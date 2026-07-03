import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import { expectedHashes, verifyArtifactWorkspace } from '../scripts/artifact-drift-lib.mjs';
import { buildVerificationEntries } from '../scripts/deployment-verification-lib.mjs';
import { verifyPublicDeployment } from '../scripts/verify-public-deployment.mjs';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const fileEntry = (path, body) => {
  const bytes = Buffer.from(body);
  return { path, bytes: bytes.length, sha256: sha256(bytes) };
};

const surfaceBodies = Object.freeze({
  'index.html': '<!doctype html><main id="top"><section id="telemetry-route"></section></main>',
  'launchpad.html': '<!doctype html><main><section id="module-home"></section></main>',
  'interlocks.html': '<!doctype html><main><article id="architecture-board"></article></main>',
  'interlock-detail.html': '<!doctype html><main><article id="usecase-detail"></article></main>',
});
const pdfBody = '%PDF-1.7\nmock architecture\n';
const manifest = {
  files: [
    ...Object.entries(surfaceBodies).map(([path, body]) => fileEntry(path, body)),
    fileEntry('assets/workflow.pdf', pdfBody),
  ],
};

function responseFor(url, overrides = {}) {
  const path = new URL(url).pathname;
  const manifestPath = path.split('/').at(-1);
  const body = surfaceBodies[manifestPath] ?? pdfBody;
  return new Response(overrides.body ?? body, {
    status: overrides.status ?? 200,
    headers: overrides.headers ?? { 'content-length': String(Buffer.byteLength(overrides.body ?? body)) },
  });
}

test('public deployment verification consumes and cryptographically verifies every required response', async () => {
  const responses = [];
  const requests = [];
  await verifyPublicDeployment({
    baseUrl: 'https://example.test/project/',
    manifest,
    requiredPdfCount: 1,
    attempts: 1,
    retryDelayMs: 0,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      const response = responseFor(url);
      responses.push(response);
      return response;
    },
  });
  assert.equal(requests.length, 5);
  assert.deepEqual(requests.map(request => new URL(request.url).pathname).sort(), [
    '/project/assets/workflow.pdf',
    '/project/index.html',
    '/project/interlock-detail.html',
    '/project/interlocks.html',
    '/project/launchpad.html',
  ]);
  assert.ok(requests.every(request => request.options.redirect === 'manual'));
  assert.ok(responses.every(response => response.bodyUsed), 'all successful response streams are consumed');
});

test('public deployment verification rejects stale size and hash content', async t => {
  const indexBody = surfaceBodies['index.html'];
  const cases = [
    {
      name: 'byte-size mismatch',
      body: `${indexBody} stale`,
      pattern: /byte size/i,
    },
    {
      name: 'sha256 mismatch',
      body: indexBody.replace('telemetry-route', 'telemetry-routf'),
      pattern: /SHA-256/i,
    },
  ];
  for (const scenario of cases) {
    await t.test(scenario.name, async () => {
      await assert.rejects(verifyPublicDeployment({
        baseUrl: 'https://example.test/',
        manifest,
        requiredPdfCount: 1,
        attempts: 1,
        retryDelayMs: 0,
        fetchImpl: async url => new Response(new URL(url).pathname.endsWith('index.html') ? scenario.body : responseFor(url).body),
      }), scenario.pattern);
    });
  }
});

test('public deployment verification requires a surface-specific DOM marker for every HTML surface', async t => {
  const markers = {
    'index.html': 'telemetry-route',
    'launchpad.html': 'module-home',
    'interlocks.html': 'architecture-board',
    'interlock-detail.html': 'usecase-detail',
  };
  for (const [path, marker] of Object.entries(markers)) {
    await t.test(path, async () => {
      const invalidBody = surfaceBodies[path].replace(marker, 'fallback-page');
      const invalidManifest = {
        files: manifest.files.map(entry => entry.path === path ? fileEntry(path, invalidBody) : entry),
      };
      await assert.rejects(verifyPublicDeployment({
        baseUrl: 'https://example.test/',
        manifest: invalidManifest,
        requiredPdfCount: 1,
        attempts: 1,
        retryDelayMs: 0,
        fetchImpl: async url => new Response(new URL(url).pathname.endsWith(path) ? invalidBody : responseFor(url).body),
      }), new RegExp(marker));
    });
  }
});

test('deployment manifest accepts only normalized project-relative paths', () => {
  for (const invalidPath of [
    '/index.html',
    '../index.html',
    'assets/../index.html',
    'https://stale.test/index.html',
    '//stale.test/index.html',
    'assets\\workflow.pdf',
    'assets//workflow.pdf',
    './index.html',
    'index.html?fallback=1',
    'index.html#fallback',
    '%2e%2e/index.html',
  ]) {
    const invalidManifest = { files: [...manifest.files, fileEntry(invalidPath, 'invalid')] };
    assert.throws(
      () => buildVerificationEntries(invalidManifest, 1),
      error => error.message.includes(invalidPath) && /normalized project-relative path/i.test(error.message),
      invalidPath,
    );
  }
});

test('public deployment verification rejects redirects and cancels their response stream', async () => {
  let cancelled = false;
  const body = new ReadableStream({
    pull() {},
    cancel() { cancelled = true; },
  });
  await assert.rejects(verifyPublicDeployment({
    baseUrl: 'https://example.test/',
    manifest,
    requiredPdfCount: 1,
    attempts: 1,
    retryDelayMs: 0,
    fetchImpl: async () => new Response(body, { status: 301, headers: { location: 'https://stale.test/' } }),
  }), /HTTP 301|redirect/i);
  assert.equal(cancelled, true);
});

test('artifact drift gate fails on an unexpected vector in an isolated build workspace', async t => {
  const workspace = await mkdtemp(resolve(tmpdir(), 'artifact-drift-negative-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const root = 'assets/diagrams/interlocks';
  await mkdir(resolve(workspace, root), { recursive: true });
  const expectedPath = `${root}/expected.drawio`;
  await writeFile(resolve(workspace, expectedPath), '<mxfile/>');
  const policy = {
    versionControl: {
      generatedExtensions: ['.drawio'],
      generatedRoots: [root],
      generatedFiles: [],
    },
  };
  const expected = expectedHashes({
    schemaVersion: '1.0.0',
    algorithm: 'sha256',
    files: [{ path: expectedPath, sha256: sha256('<mxfile/>') }],
  });
  await verifyArtifactWorkspace({ root: workspace, policy, expected, label: 'Negative fixture' });
  const unexpectedPath = `${root}/unexpected-mock-vector.drawio`;
  await writeFile(resolve(workspace, unexpectedPath), '<mxfile host="unexpected"/>');
  await assert.rejects(
    verifyArtifactWorkspace({ root: workspace, policy, expected, label: 'Negative fixture' }),
    error => {
      assert.match(error.message, /unexpected or obsolete/i);
      assert.match(error.message, /unexpected-mock-vector\.drawio/);
      return true;
    },
  );
});
