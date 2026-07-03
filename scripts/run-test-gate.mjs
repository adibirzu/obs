import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const policy = JSON.parse(await readFile(new URL('governance/quality-gates.json', root), 'utf8'));
const minimumTests = policy.tests.minimum;
const testFiles = (await readdir(new URL('tests/', root)))
  .filter(file => file.endsWith('.test.mjs'))
  .sort()
  .map(file => `tests/${file}`);
const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...testFiles], {
  cwd: new URL('.', root),
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});

process.stdout.write(result.stdout);
process.stderr.write(result.stderr);

const summary = Object.fromEntries(
  [...result.stdout.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)]
    .map(([, key, value]) => [key, Number(value)]),
);
const total = summary.tests ?? 0;
const passed = summary.pass ?? 0;
const failed = summary.fail ?? 0;
const cancelled = summary.cancelled ?? 0;
const skipped = summary.skipped ?? 0;
const todo = summary.todo ?? 0;
const errors = [
  ...(result.status === 0 ? [] : [`test process exited ${result.status}`]),
  ...(total >= minimumTests ? [] : [`expected at least ${minimumTests} tests, found ${total}`]),
  ...(passed === total ? [] : [`only ${passed}/${total} tests passed`]),
  ...(failed !== 0 ? [`${failed} tests failed`] : []),
  ...(cancelled !== 0 ? [`${cancelled} tests cancelled`] : []),
  ...(skipped !== 0 ? [`${skipped} tests skipped`] : []),
  ...(todo !== 0 ? [`${todo} tests left todo`] : []),
];

if (errors.length) {
  console.error(`Test quality gate failed:\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Test quality gate passed: ${passed}/${total} tests, minimum ${minimumTests}.`);
}
