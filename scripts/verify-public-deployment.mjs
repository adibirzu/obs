import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

import { buildVerificationEntries, REQUIRED_SURFACE_PATHS } from './deployment-verification-lib.mjs';

const ATTEMPTS = 5;
const RETRY_DELAY_MS = 2_000;
const delay = milliseconds => new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));

const SURFACE_DOM_MARKERS = Object.freeze({
  'index.html': { id: 'telemetry-route', pattern: /<section\b[^>]*\bid=(['"])telemetry-route\1/i },
  'launchpad.html': { id: 'module-home', pattern: /<section\b[^>]*\bid=(['"])module-home\1/i },
  'interlocks.html': { id: 'architecture-board', pattern: /<article\b[^>]*\bid=(['"])architecture-board\1/i },
  'interlock-detail.html': { id: 'usecase-detail', pattern: /<article\b[^>]*\bid=(['"])usecase-detail\1/i },
});

async function cancelResponse(response) {
  if (response?.body && !response.bodyUsed) await response.body.cancel().catch(() => {});
}

async function verifyUrl({ url, entry, fetchImpl, attempts, retryDelayMs }) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response;
    try {
      response = await fetchImpl(url, { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
      if (response.status >= 300 && response.status < 400) throw new Error(`HTTP ${response.status} redirect is not accepted`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (response.redirected) throw new Error(`Redirected response is not accepted: ${response.url}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length !== entry.bytes) throw new Error(`byte size mismatch: expected ${entry.bytes}, received ${bytes.length}`);
      const actualHash = createHash('sha256').update(bytes).digest('hex');
      if (actualHash !== entry.sha256) throw new Error(`SHA-256 mismatch: expected ${entry.sha256}, received ${actualHash}`);
      const marker = SURFACE_DOM_MARKERS[entry.path];
      if (marker && !marker.pattern.test(bytes.toString('utf8'))) {
        throw new Error(`${entry.path} is missing the #${marker.id} DOM element`);
      }
      return;
    } catch (error) {
      await cancelResponse(response);
      lastError = error;
      if (attempt < attempts) await delay(retryDelayMs);
    }
  }
  throw new Error(`${entry.path} failed deployment integrity verification after ${attempts} attempts: ${lastError.message}`);
}

export async function verifyPublicDeployment({
  baseUrl,
  manifest,
  requiredPdfCount,
  requiredPaths = REQUIRED_SURFACE_PATHS,
  fetchImpl = fetch,
  attempts = ATTEMPTS,
  retryDelayMs = RETRY_DELAY_MS,
  concurrency = 6,
}) {
  const parsedBase = new URL(baseUrl);
  if (!['http:', 'https:'].includes(parsedBase.protocol) || parsedBase.username || parsedBase.password) {
    throw new Error('PUBLIC_SITE_URL must be an HTTP(S) URL without embedded credentials');
  }
  if (!parsedBase.pathname.endsWith('/')) parsedBase.pathname = `${parsedBase.pathname}/`;
  if (!Number.isSafeInteger(attempts) || attempts < 1) throw new Error('attempts must be a positive integer');
  if (!Number.isSafeInteger(concurrency) || concurrency < 1) throw new Error('concurrency must be a positive integer');
  const entries = buildVerificationEntries(manifest, requiredPdfCount, requiredPaths);
  const failures = [];
  for (let offset = 0; offset < entries.length; offset += concurrency) {
    const batch = entries.slice(offset, offset + concurrency);
    const results = await Promise.all(batch.map(async entry => {
      try {
        await verifyUrl({
          url: new URL(entry.path, parsedBase).href,
          entry,
          fetchImpl,
          attempts,
          retryDelayMs,
        });
        return null;
      } catch (error) {
        return error.message;
      }
    }));
    failures.push(...results.filter(Boolean));
  }
  if (failures.length) {
    const displayed = failures.slice(0, 10);
    const remainder = failures.length - displayed.length;
    const suffix = remainder ? `\n- …and ${remainder} more integrity failures` : '';
    throw new Error(`Public deployment verification failed (${failures.length}/${entries.length}):\n- ${displayed.join('\n- ')}${suffix}`);
  }
}

async function main() {
  const root = resolve(new URL('../', import.meta.url).pathname);
  const manifestPath = resolve(root, process.env.RELEASE_MANIFEST ?? 'dist/release-manifest.json');
  const [manifest, policy] = await Promise.all([
    readFile(manifestPath, 'utf8').then(JSON.parse),
    readFile(resolve(root, 'governance/artifact-policy.json'), 'utf8').then(JSON.parse),
  ]);
  await verifyPublicDeployment({
    baseUrl: process.env.PUBLIC_SITE_URL ?? '',
    manifest,
    requiredPdfCount: policy.releasePackage.requiredPdfCount,
    requiredPaths: policy.releasePackage.requiredPaths,
  });
  console.log(`Public deployment cryptographically verified: ${REQUIRED_SURFACE_PATHS.length} HTML surfaces and ${policy.releasePackage.requiredPdfCount} PDFs match the release manifest.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
