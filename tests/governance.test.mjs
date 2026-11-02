import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  discoverExternalLinks,
  loadWorkflowRegistry,
  refreshLinks,
  validateLinkRegistry,
  validateGovernance,
  validateRenameLedger,
  validateTelemetryContracts,
  validateWorkflows,
} from '../scripts/validate-governance.mjs';

const root = new URL('../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const [checkedInRegistry, checkedInLedger] = await Promise.all([
  readJson('governance/external-links.json'),
  readJson('governance/roadmap-renames.json'),
]);
// Validate the snapshot at its newest recorded verification, independent of the wall clock.
const snapshotToday = [
  ...checkedInRegistry.links.map(link => link.lastChecked),
  ...checkedInLedger.claims.map(claim => claim.verifiedOn),
].sort().at(-1);

test('external links are discovered across source files and governed by dated HTTP metadata', async () => {
  const [registry, schema, sourceRegister, discovered] = await Promise.all([
    readJson('governance/external-links.json'),
    readJson('governance/schemas/external-links.schema.json'),
    readJson('assets/interlocks/documentation-sources.json'),
    discoverExternalLinks({ rootUrl: root }),
  ]);

  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.deepEqual(validateLinkRegistry({ discovered, registry, today: snapshotToday }), []);
  assert.ok(registry.links.length > 40);
  assert.ok(registry.links.every(link => Number.isInteger(link.statusCode) || link.exemption));
  assert.ok(registry.links.every(link => /^\d{4}-\d{2}-\d{2}$/.test(link.lastChecked)));
  assert.ok(discovered.every(link => link.sources.every(source => !source.startsWith('dist/'))), 'ignored release output never enters source governance');
  assert.ok(sourceRegister.sources.every(source => Number.isInteger(source.httpStatus)));
  // This generated register is a snapshot; refreshing links alone does not regenerate it.
  for (const source of sourceRegister.sources) {
    const link = registry.links.find(link => link.url === source.officialUrl);
    assert.ok(link, source.officialUrl);
    assert.match(source.lastChecked, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(source.lastChecked, sourceRegister.verifiedOn);
    assert.ok(source.lastChecked <= link.lastChecked, source.officialUrl);
  }
});

test('external link registry rejects malformed, stale, drifting, and orphaned records', () => {
  const discovered = [
    { url: 'https://new.example.test/', sources: ['README.md'] },
    { url: 'https://drift.example.test/', sources: ['index.html'] },
  ];
  const registry = {
    schemaVersion: '0.0.0',
    checkedAt: 'not-a-date',
    policy: { maxAgeDays: 0, acceptedStatusCodes: 'invalid' },
    links: [
      { url: 'https://drift.example.test/', statusCode: 500, lastChecked: '2025-01-01', sources: ['old.html'] },
      { url: 'https://drift.example.test/', statusCode: 200, lastChecked: '2027-01-01', sources: [] },
      { url: 'https://orphan.example.test/', statusCode: 200, lastChecked: 'invalid', sources: ['README.md'] },
    ],
  };
  const errors = validateLinkRegistry({ discovered, registry, today: '2026-07-03' });
  for (const expected of [
    'schemaVersion', 'checkedAt', 'maxAgeDays', 'acceptedStatusCodes', 'duplicate', 'stale check',
    'future lastChecked', 'unacceptable or missing status', 'sources missing', 'unregistered',
    'source list drift', 'orphaned registry entry',
  ]) assert.ok(errors.some(error => error.includes(expected)), expected);
  assert.ok(validateLinkRegistry({ discovered: [], registry: { ...registry, links: null }, today: '2026-07-03' })
    .some(error => error.includes('links must be an array')));
});

test('Logan, Prometheus, and APM use segregated telemetry metadata contracts', async () => {
  const contracts = await readJson('governance/telemetry-contracts.json');
  assert.deepEqual(validateTelemetryContracts(contracts), []);
  assert.deepEqual(Object.keys(contracts.contracts).sort(), ['apm', 'logan', 'prometheus']);
  assert.ok(contracts.sharedCorrelationFields.includes('trace_id'));
  assert.ok(contracts.contracts.logan.forbiddenFields.includes('metric_value'));
  assert.ok(contracts.contracts.prometheus.forbiddenFields.includes('log_source'));
  assert.ok(contracts.contracts.apm.forbiddenFields.includes('raw_log'));
});

test('rename and roadmap ledger rejects stale claims and deprecated service names', async () => {
  const ledger = await readJson('governance/roadmap-renames.json');
  assert.deepEqual(await validateRenameLedger({ rootUrl: root, ledger, today: snapshotToday }), []);
  assert.ok(ledger.claims.every(claim => claim.verifiedOn && claim.reviewAfter));
  assert.ok(ledger.renames.some(rename => rename.deprecated === 'OCI Logging Analytics'));
});

test('all sixty technical workflows expose prerequisites, correlation keys, and empty-result guidance', async () => {
  const [contracts, workflows] = await Promise.all([
    readJson('governance/telemetry-contracts.json'),
    loadWorkflowRegistry(root),
  ]);
  assert.equal(workflows.length, 60);
  assert.deepEqual(validateWorkflows(workflows, contracts), []);
  for (const workflow of workflows) {
    assert.ok(workflow.prerequisites.length >= 3, workflow.id);
    assert.ok(workflow.correlationKeys.includes('trace_id'), workflow.id);
    assert.match(workflow.emptyResult, /inconclusive|not proof|does not prove/i, workflow.id);
  }
});

test('workflow detail UI renders governance prerequisites and empty-result caveats', async () => {
  const detail = await readFile(new URL('assets/interlocks/usecase-detail.js', root), 'utf8');
  assert.match(detail, /System prerequisites/);
  assert.match(detail, /Distributed correlation keys/);
  assert.match(detail, /Empty-result caveat/);
  assert.match(detail, /item\.prerequisites/);
  assert.match(detail, /item\.correlationKeys/);
  assert.match(detail, /item\.emptyResult/);
});

test('complete governance compilation validates the checked-in contracts together', async () => {
  const result = await validateGovernance({ today: snapshotToday });
  assert.ok(result.links > 40);
  assert.equal(result.workflows, 60);
  assert.ok(result.claims > 0);
});

test('link refresh omits self-origin redirect targets and preserves external redirects', async () => {
  const urls = [
    'https://adibirzu.github.io/obs/',
    'https://adibirzu.github.io/obs/guide.html',
    'https://adibirzu.github.io/other/',
    'https://docs.example.test/old',
  ];
  const registry = await refreshLinks({
    discovered: urls.map(url => ({ url, sources: ['README.md'] })),
    previous: { links: [{ url: urls[0], redirectedTo: 'https://custom.example.test/' }] },
    today: snapshotToday,
    fetchImpl: async () => ({ status: 200, url: 'https://custom.example.test/' }),
  });

  for (const link of registry.links.slice(0, 2)) {
    assert.equal(link.statusCode, 200);
    assert.equal(link.lastChecked, snapshotToday);
    assert.equal(Object.hasOwn(link, 'redirectedTo'), false);
  }
  for (const link of registry.links.slice(2)) {
    assert.equal(link.redirectedTo, 'https://custom.example.test/');
  }
});
