import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';

const posix = value => value.split(sep).join('/');

async function filesUnder(directory) {
  const output = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return output;
    throw error;
  }
  for (const entry of entries) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(absolute));
    else if (entry.isFile()) output.push(absolute);
  }
  return output;
}

export async function hashFile(root, path) {
  return createHash('sha256').update(await readFile(resolve(root, path))).digest('hex');
}

export async function snapshotSourcePaths(root, policy) {
  const extensions = new Set(policy.versionControl.generatedExtensions);
  const paths = new Set(policy.versionControl.generatedFiles);
  for (const directory of policy.versionControl.generatedRoots) {
    for (const absolute of await filesUnder(resolve(root, directory))) {
      const path = posix(relative(root, absolute));
      if (extensions.has(extname(path))) paths.add(path);
    }
  }
  return [...paths].sort();
}

export async function discoverGovernedArtifacts(root, policy) {
  const paths = new Set(policy.versionControl.generatedFiles);
  const vectorLike = /\.(?:drawio|excalidraw)(?:\.|$)/i;
  for (const directory of policy.versionControl.generatedRoots) {
    for (const absolute of await filesUnder(resolve(root, directory))) {
      const path = posix(relative(root, absolute));
      if (vectorLike.test(path) || policy.versionControl.generatedFiles.includes(path)) paths.add(path);
    }
  }
  return [...paths].sort();
}
