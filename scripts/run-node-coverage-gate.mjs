import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

import { enforcePerFileLineFloors, parseNodeCoverageReport } from './coverage-gate-lib.mjs';

const root = resolve(new URL('../', import.meta.url).pathname);
const testsDirectory = resolve(root, 'tests');
const policy = JSON.parse(await readFile(resolve(root, 'governance/quality-gates.json'), 'utf8'));
const testFiles = (await readdir(testsDirectory))
  .filter(path => path.endsWith('.test.mjs'))
  .sort()
  .map(path => `tests/${path}`);
const args = [
  '--experimental-test-coverage',
  `--test-coverage-lines=${policy.coverage.lines}`,
  '--test',
  ...testFiles,
];
const result = spawnSync(process.execPath, args, {
  cwd: root,
  encoding: 'utf8',
  env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  maxBuffer: 20 * 1024 * 1024,
});
process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const nodeFloors = Object.fromEntries(Object.entries(policy.coverage.perFileLines)
  .filter(([path]) => path.startsWith('scripts/')));
const coverage = parseNodeCoverageReport(`${result.stdout ?? ''}\n${result.stderr ?? ''}`, Object.keys(nodeFloors));
enforcePerFileLineFloors(coverage, nodeFloors, 'Node per-file line coverage');
console.log(`Node per-file coverage gate passed: ${Object.keys(nodeFloors).length} critical modules met their individual floors.`);
