import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

import { expectedHashes, verifyArtifactWorkspace } from './artifact-drift-lib.mjs';

const root = resolve(new URL('../', import.meta.url).pathname);
const policy = JSON.parse(await readFile(resolve(root, 'governance/artifact-policy.json'), 'utf8'));
const snapshotPath = resolve(root, 'governance/artifact-snapshot.json');
const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));

function generate(commandArgs) {
  const result = spawnSync(process.execPath, commandArgs, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${commandArgs.join(' ')} failed:\n${result.stderr || result.stdout}`);
  process.stdout.write(result.stdout);
}

const expected = expectedHashes(snapshot);
await verifyArtifactWorkspace({ root, policy, expected, label: 'Checked-in artifact set' });
generate(['scripts/generate-interlocks-drawio.mjs']);
generate(['scripts/generate-interlocks-drawio.mjs', '--edition=documented']);
generate(['scripts/generate-usecase-artifacts.mjs']);
await verifyArtifactWorkspace({ root, policy, expected, label: 'Regenerated artifact set' });
console.log(`Artifact drift gate passed: ${expected.size} exact paths and SHA-256 hashes match the immutable manifest.`);
