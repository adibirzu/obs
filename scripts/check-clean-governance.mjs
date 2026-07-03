import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateGovernance } from './validate-governance.mjs';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const registryPath = resolve(root, 'governance/external-links.json');
const artifactPolicy = JSON.parse(await readFile(resolve(root, 'governance/artifact-policy.json'), 'utf8'));

function gitStatus() {
  const result = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git status failed: ${result.stderr.trim()}`);
  return result.stdout;
}

async function assertAbsent(path, label) {
  try {
    await access(path);
    throw new Error(`${label} exists before clean-checkout governance validation`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function pollutedSources(registry) {
  const forbiddenRoots = artifactPolicy.releaseOnly.generatedRoots.map(path => path.replace(/\/$/, ''));
  return registry.links.flatMap(link => link.sources
    .filter(source => forbiddenRoots.some(rootPath => source === rootPath || source.startsWith(`${rootPath}/`)))
    .map(source => ({ url: link.url, source })));
}

const statusBefore = gitStatus();
const registryBefore = await readFile(registryPath, 'utf8');
await assertAbsent(resolve(root, 'dist'), 'dist/');

const registry = JSON.parse(registryBefore);
const pollution = pollutedSources(registry);
if (pollution.length) {
  throw new Error(`Clean-checkout governance found ${pollution.length} release-only source path(s); first source: ${pollution[0].source}`);
}

const result = await validateGovernance();
const registryAfter = await readFile(registryPath, 'utf8');
const statusAfter = gitStatus();
if (registryAfter !== registryBefore || statusAfter !== statusBefore) {
  throw new Error('Clean-checkout governance caused filesystem drift');
}

console.log(`Clean-checkout governance passed: ${result.links} links, no release-only sources, and no filesystem drift.`);
