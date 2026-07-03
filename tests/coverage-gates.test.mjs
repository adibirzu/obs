import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { enforcePerFileLineFloors, parseNodeCoverageReport } from '../scripts/coverage-gate-lib.mjs';

const root = new URL('../', import.meta.url);

test('quality policy defines explicit per-file floors for critical modules', async () => {
  const policy = JSON.parse(await readFile(new URL('governance/quality-gates.json', root), 'utf8'));
  assert.ok(policy.coverage.perFileLines['static/observability.js'] >= 75);
  assert.ok(policy.coverage.perFileLines['scripts/redact-gate.mjs'] >= 70);
  assert.ok(policy.coverage.perFileLines['scripts/validate-governance.mjs'] >= 75);
});

test('per-file gate fails one regressed file even when aggregate coverage is high', () => {
  const results = [
    { path: 'static/observability.js', percent: 74.99 },
    { path: 'assets/state.js', percent: 100 },
  ];
  assert.throws(
    () => enforcePerFileLineFloors(results, { 'static/observability.js': 75 }),
    /static\/observability\.js.*74\.99%.*75%/,
  );
});

test('per-file gate fails closed when a configured file is absent from the report', () => {
  assert.throws(
    () => enforcePerFileLineFloors([], { 'scripts/redact-gate.mjs': 70 }),
    /missing.*scripts\/redact-gate\.mjs/i,
  );
});

test('Node coverage report maps file rows to configured project paths', () => {
  const output = [
    'ℹ scripts                                |        |          |         |',
    'ℹ  redact-gate.mjs                       |  72.50 |    91.67 |   60.00 | 28-34',
    'ℹ  validate-governance.mjs               |  76.25 |    53.10 |   79.31 | 56-57',
  ].join('\n');
  assert.deepEqual(parseNodeCoverageReport(output, [
    'scripts/redact-gate.mjs',
    'scripts/validate-governance.mjs',
  ]), [
    { path: 'scripts/redact-gate.mjs', percent: 72.5 },
    { path: 'scripts/validate-governance.mjs', percent: 76.25 },
  ]);
});
