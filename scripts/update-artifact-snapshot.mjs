import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { hashFile, snapshotSourcePaths } from './artifact-snapshot-lib.mjs';

const root = resolve(new URL('../', import.meta.url).pathname);
const policy = JSON.parse(await readFile(resolve(root, 'governance/artifact-policy.json'), 'utf8'));
const manifestPath = resolve(root, 'governance/artifact-snapshot.json');
const paths = await snapshotSourcePaths(root, policy);
const manifest = {
  schemaVersion: '1.0.0',
  algorithm: 'sha256',
  generatedBy: 'npm run artifacts:update-snapshot',
  files: await Promise.all(paths.map(async path => ({ path, sha256: await hashFile(root, path) }))),
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Updated immutable artifact snapshot with ${manifest.files.length} reviewed paths.`);
