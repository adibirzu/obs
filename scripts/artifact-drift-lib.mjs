import { discoverGovernedArtifacts, hashFile } from './artifact-snapshot-lib.mjs';

export function expectedHashes(manifest) {
  if (manifest.schemaVersion !== '1.0.0' || manifest.algorithm !== 'sha256' || !Array.isArray(manifest.files)) {
    throw new Error('governance/artifact-snapshot.json does not match the supported immutable snapshot schema');
  }
  const paths = manifest.files.map(entry => entry.path);
  if (new Set(paths).size !== paths.length || paths.some((path, index) => index > 0 && paths[index - 1] > path)) {
    throw new Error('governance/artifact-snapshot.json paths must be unique and sorted');
  }
  for (const entry of manifest.files) {
    if (typeof entry.path !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sha256)) {
      throw new Error(`Invalid artifact snapshot entry: ${JSON.stringify(entry)}`);
    }
  }
  return new Map(manifest.files.map(entry => [entry.path, entry.sha256]));
}

export async function verifyArtifactWorkspace({ root, policy, expected, label }) {
  const actualPaths = await discoverGovernedArtifacts(root, policy);
  const actual = new Set(actualPaths);
  const missing = [...expected.keys()].filter(path => !actual.has(path));
  const unexpected = actualPaths.filter(path => !expected.has(path));
  const changed = [];
  for (const [path, expectedHash] of expected) {
    if (actual.has(path) && await hashFile(root, path) !== expectedHash) changed.push(path);
  }
  if (missing.length || unexpected.length || changed.length) {
    const details = [
      missing.length ? `missing:\n- ${missing.join('\n- ')}` : '',
      unexpected.length ? `unexpected or obsolete:\n- ${unexpected.join('\n- ')}` : '',
      changed.length ? `SHA-256 mismatch:\n- ${changed.join('\n- ')}` : '',
    ].filter(Boolean).join('\n');
    throw new Error(`${label} does not match governance/artifact-snapshot.json:\n${details}`);
  }
}
