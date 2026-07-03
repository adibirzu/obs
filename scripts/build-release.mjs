import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { extname, relative, resolve, sep } from 'node:path';

import { isReleasePathAllowed } from './release-path-policy.mjs';

const root = resolve(new URL('../', import.meta.url).pathname);
const policy = JSON.parse(await readFile(resolve(root, 'governance/artifact-policy.json'), 'utf8'));
const output = resolve(root, policy.releasePackage.output);
const manifestPath = resolve(root, policy.releasePackage.manifest);
const posix = value => value.split(sep).join('/');
const isWithin = (path, roots) => roots.some(candidate => path === candidate || path.startsWith(`${candidate}/`));

export function classifyArtifact(path, artifactPolicy = policy) {
  const extension = extname(path);
  if (isWithin(path, artifactPolicy.releaseOnly.generatedRoots)
    && artifactPolicy.releaseOnly.generatedExtensions.includes(extension)) return 'release-only';
  if (artifactPolicy.versionControl.generatedFiles.includes(path)) return 'version-controlled';
  if (isWithin(path, artifactPolicy.versionControl.generatedRoots)
    && artifactPolicy.versionControl.generatedExtensions.includes(extension)) return 'version-controlled';
  if (isWithin(path, artifactPolicy.versionControl.authoredRoots)) return 'version-controlled';
  return 'runtime';
}

function runGenerator(path) {
  const result = spawnSync(process.execPath, [path], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${path} failed:\n${result.stderr || result.stdout}`);
  process.stdout.write(result.stdout);
}

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
    else if (entry.isSymbolicLink()) throw new Error(`Release package cannot contain symbolic links: ${absolute}`);
  }
  return files;
}

runGenerator('scripts/generate-interlocks-pdf.mjs');
runGenerator('scripts/generate-usecase-pdf.mjs');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of policy.releasePackage.include) {
  const source = resolve(root, entry);
  try {
    const metadata = await stat(source);
    await cp(source, resolve(output, entry), {
      recursive: metadata.isDirectory(),
      force: true,
      filter: candidate => isReleasePathAllowed(relative(root, candidate)),
    });
  } catch (error) {
    throw new Error(`Release input is missing: ${entry} (${error.code})`);
  }
}

const files = await listFiles(output);
const releasePaths = files.map(absolute => posix(relative(output, absolute))).sort();
const leaked = releasePaths.filter(path => !isReleasePathAllowed(path));
if (leaked.length) throw new Error(`Release package contains blocked files:\n- ${leaked.join('\n- ')}`);
const missingRequired = policy.releasePackage.requiredPaths.filter(path => !releasePaths.includes(path));
if (missingRequired.length) throw new Error(`Release package is missing required public paths:\n- ${missingRequired.join('\n- ')}`);
const pdfPaths = releasePaths.filter(path => extname(path).toLowerCase() === '.pdf');
if (pdfPaths.length !== policy.releasePackage.requiredPdfCount) {
  throw new Error(`Release package must contain exactly ${policy.releasePackage.requiredPdfCount} architecture PDFs; found ${pdfPaths.length}`);
}
for (const path of pdfPaths) {
  const bytes = await readFile(resolve(output, path));
  if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`Release PDF is invalid: ${path}`);
}
const manifest = {
  schemaVersion: '1.0.0',
  generatedFrom: 'governance/artifact-policy.json',
  files: await Promise.all(files.sort().map(async absolute => {
    const path = posix(relative(output, absolute));
    const bytes = await readFile(absolute);
    return {
      path,
      classification: classifyArtifact(path),
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    };
  })),
};
await mkdir(resolve(manifestPath, '..'), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const counts = manifest.files.reduce((current, file) => ({ ...current, [file.classification]: (current[file.classification] ?? 0) + 1 }), {});
console.log(`Release package built at ${policy.releasePackage.output}: ${manifest.files.length} files (${JSON.stringify(counts)}).`);
