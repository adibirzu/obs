import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('browser navigation and reload waits have an explicit bounded deadline', async () => {
  const harness = await read('tests/e2e/browser-harness.mjs');

  assert.match(harness, /const PAGE_LOAD_TIMEOUT_MS = [\d_]+;/);
  assert.match(harness, /function waitForEvent/);
  assert.match(harness, /Page\.loadEventFired', PAGE_LOAD_TIMEOUT_MS/);
  assert.match(harness, /loaded\.cancel\(\)/);
  assert.match(harness, /timed out after \$\{timeoutMs\}ms/);
});

test('Draw.io PDF export retries transient failures with bounded requests and clear diagnostics', async () => {
  const generator = await read('scripts/generate-interlocks-pdf.mjs');

  assert.match(generator, /const PDF_EXPORT_ATTEMPTS = [2-9];/);
  assert.match(generator, /AbortSignal\.timeout\(timeoutMs\)/);
  assert.match(generator, /for \(let attempt = 1; attempt <= attempts; attempt \+= 1\)/);
  assert.match(generator, /cancelResponse/);
  assert.match(generator, /failed after \$\{attempts\} attempts/);
  assert.match(generator, /pathToFileURL/);
});

test('Draw.io PDF export recovers within its retry budget and writes only a valid PDF', async () => {
  const { exportPoster } = await import('../scripts/generate-interlocks-pdf.mjs');
  const retries = [];
  const delays = [];
  const writes = [];
  let requests = 0;
  const result = await exportPoster({ id: 'network' }, {
    readFileImpl: async () => '<mxfile/>',
    fetchImpl: async (_url, options) => {
      requests += 1;
      assert.equal(options.signal instanceof AbortSignal, true);
      if (requests < 3) throw new Error('temporary endpoint failure');
      return new Response(Buffer.from('%PDF-test'), { status: 200 });
    },
    writeFileImpl: async (destination, bytes) => writes.push({ destination: destination.href, bytes: bytes.toString() }),
    attempts: 3,
    timeoutMs: 50,
    retryDelayMs: 7,
    delayImpl: async milliseconds => delays.push(milliseconds),
    onRetry: message => retries.push(message),
  });

  assert.deepEqual(result, { id: 'network', bytes: 9 });
  assert.equal(requests, 3);
  assert.deepEqual(delays, [7, 7]);
  assert.equal(retries.length, 2);
  assert.deepEqual(writes.map(({ bytes }) => bytes), ['%PDF-test']);
});

test('Draw.io PDF export exhausts its budget, cancels responses, and reports the final cause', async () => {
  const { exportPoster } = await import('../scripts/generate-interlocks-pdf.mjs');
  let cancellations = 0;
  let writes = 0;
  const response = {
    ok: false,
    status: 503,
    bodyUsed: false,
    body: { cancel: async () => { cancellations += 1; } },
  };

  await assert.rejects(exportPoster({ id: 'security' }, {
    readFileImpl: async () => '<mxfile/>',
    fetchImpl: async () => response,
    writeFileImpl: async () => { writes += 1; },
    attempts: 2,
    timeoutMs: 50,
    retryDelayMs: 1,
    delayImpl: async () => {},
  }), /security: Draw\.io PDF export failed after 2 attempts: conversion endpoint returned HTTP 503/);
  assert.equal(cancellations, 2);
  assert.equal(writes, 0);
});

test('public metadata uses only the repository-backed GitHub Pages origin', async () => {
  const paths = [
    'README.md',
    'deploy/portal-ingress.yaml',
    'governance/schemas/community-scenario.schema.json',
    'governance/schemas/external-links.schema.json',
    'governance/external-links.json',
  ];
  const contents = await Promise.all(paths.map(read));

  for (const [index, content] of contents.entries()) {
    assert.doesNotMatch(content, /obs\.octodemo\.cloud/i, paths[index]);
  }
  assert.match(contents[0], /https:\/\/adibirzu\.github\.io\/obs\//);
  assert.match(contents[1], /adibirzu\.github\.io/);
  await assert.rejects(access(new URL('CNAME', root)), error => error.code === 'ENOENT');
});
