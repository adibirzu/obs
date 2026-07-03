import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

import { buildVerificationPaths } from './deployment-verification-lib.mjs';

const ATTEMPTS = 5;
const RETRY_DELAY_MS = 2_000;
const delay = milliseconds => new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));

async function verifyUrl(url) {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < ATTEMPTS) await delay(RETRY_DELAY_MS);
    }
  }
  throw new Error(`${url} remained unavailable after ${ATTEMPTS} attempts: ${lastError.message}`);
}

export async function verifyPublicDeployment({ baseUrl, manifest, requiredPdfCount }) {
  const parsedBase = new URL(baseUrl);
  if (!['http:', 'https:'].includes(parsedBase.protocol) || parsedBase.username || parsedBase.password) {
    throw new Error('PUBLIC_SITE_URL must be an HTTP(S) URL without embedded credentials');
  }
  if (!parsedBase.pathname.endsWith('/')) parsedBase.pathname = `${parsedBase.pathname}/`;
  const failures = [];
  for (const path of buildVerificationPaths(manifest, requiredPdfCount)) {
    try {
      await verifyUrl(new URL(path, parsedBase).href);
    } catch (error) {
      failures.push(error.message);
      if (failures.length === 10) break;
    }
  }
  if (failures.length) throw new Error(`Public deployment verification failed:\n- ${failures.slice(0, 10).join('\n- ')}`);
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
  });
  console.log(`Public deployment verified: interlocks.html and ${policy.releasePackage.requiredPdfCount} PDFs are reachable.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
