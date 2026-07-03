import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const readJson = async path => JSON.parse(await read(path));

test('reference community scenario is complete, multicloud, and operationally measurable', async () => {
  const [scenario, markdown, schema] = await Promise.all([
    readJson('assets/scenarios/retail-checkout-multicloud.json'),
    read('docs/scenarios/retail-checkout-multicloud.md'),
    readJson('governance/schemas/community-scenario.schema.json'),
  ]);

  assert.equal(scenario.schemaVersion, '1.0.0');
  assert.equal(scenario.id, 'retail-checkout-multicloud');
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.deepEqual(
    [...new Set(scenario.topology.environments.map(({ provider }) => provider))].sort(),
    ['aws', 'azure', 'oci', 'on-premises'],
  );
  assert.ok(scenario.telemetry.metrics.length >= 6);
  assert.ok(scenario.failurePoints.length >= 5);
  assert.ok(scenario.workflow.prerequisites.length >= 5);
  assert.ok(scenario.workflow.correlationKeys.includes('trace_id'));
  assert.match(scenario.workflow.emptyResult, /inconclusive/i);
  assert.ok(scenario.failurePoints.every(({ interlocks }) => interlocks.length >= 1));
  assert.ok(scenario.telemetry.metrics.every(({ name, unit, owner, failureThreshold }) => name && unit && owner && failureThreshold));
  for (const heading of ['Topology', 'Telemetry contract', 'Failure points', 'Incident workflow', 'Ownership']) {
    assert.match(markdown, new RegExp(`## ${heading}`, 'i'));
  }
});

test('scenario registry dynamically loads files and matches query and operating-profile traits', async () => {
  const [index, loader] = await Promise.all([
    readJson('assets/scenarios/index.json'),
    read('assets/scenarios.js'),
  ]);
  assert.deepEqual(index.scenarios, ['retail-checkout-multicloud.json']);
  assert.match(loader, /fetch\(indexUrl/);
  assert.match(loader, /Promise\.all/);
  assert.match(loader, /matchScenarios/);

  const context = { globalThis: {}, URL, console };
  vm.runInNewContext(loader, context);
  const scenario = await readJson('assets/scenarios/retail-checkout-multicloud.json');
  assert.equal(context.globalThis.OBS_SCENARIOS.validateScenario(scenario).length, 0);
  assert.ok(context.globalThis.OBS_SCENARIOS.validateScenario({ schemaVersion: '1.0.0', id: 'incomplete' }).length >= 5);
  const byQuery = context.globalThis.OBS_SCENARIOS.matchScenarios([scenario], { query: 'retail checkout eks latency' });
  const byProfile = context.globalThis.OBS_SCENARIOS.matchScenarios([scenario], { persona: 'operate', industry: 'retail', goal: 'diagnose' });
  assert.equal(byQuery[0].scenario.id, scenario.id);
  assert.equal(byProfile[0].scenario.id, scenario.id);
  assert.ok(byProfile[0].score >= 3);
});

test('Finder and persona engines surface matching community scenarios', async () => {
  const [html, guide, personas] = await Promise.all([
    read('index.html'),
    read('assets/guide.js'),
    read('assets/personas.js'),
  ]);
  assert.match(html, /id="scenario-search"/);
  assert.match(html, /id="scenario-matches"[^>]*aria-live="polite"/);
  assert.ok(html.indexOf('assets/scenarios.js') < html.indexOf('assets/personas.js'));
  assert.match(personas, /obs:profile-change/);
  assert.match(guide, /OBS_SCENARIOS\.load/);
  assert.match(guide, /matchScenarios/);
  assert.match(guide, /scenario\.discovery\.finderPatterns/);
  assert.match(guide, /runFinder\(pattern/);
});

test('Interlock engine maps community scenarios to declared workflows', async () => {
  const [html, script, scenario, networkDefinitions, domainDefinitions] = await Promise.all([
    read('interlocks.html'),
    read('assets/interlocks/interlocks.js'),
    readJson('assets/scenarios/retail-checkout-multicloud.json'),
    read('assets/interlocks/network-drilldowns.js'),
    read('assets/interlocks/domain-drilldowns.js'),
  ]);
  assert.match(html, /id="community-scenarios"/);
  assert.ok(html.indexOf('assets/scenarios.js') < html.indexOf('assets/interlocks/interlocks.js'));
  assert.match(script, /OBS_SCENARIOS\.load/);
  assert.match(script, /renderCommunityScenarios/);
  assert.match(script, /scenario\.discovery\.interlocks/);
  assert.ok(scenario.discovery.interlocks.some(({ diagram, workflow }) => diagram === 'end-to-end' && workflow === 'customer-journey'));
  assert.ok(scenario.discovery.interlocks.some(({ diagram, workflow }) => diagram === 'operations-lifecycle' && workflow === 'incident-correlation'));
  const context = {};
  vm.runInNewContext(networkDefinitions, context);
  vm.runInNewContext(domainDefinitions, context);
  const registry = { network: context.NETWORK_DRILLDOWNS, ...context.DOMAIN_DRILLDOWNS };
  for (const { diagram, workflow } of scenario.discovery.interlocks) {
    assert.ok(registry[diagram]?.some(({ id }) => id === workflow), `${diagram}/${workflow} exists`);
  }
});

test('contribution governance defines ownership and a merge-blocking acceptance checklist', async () => {
  const contributing = await read('CONTRIBUTING.md');
  for (const heading of ['Ownership boundaries', 'Scenario file contract', 'Technical acceptance checklist', 'Editorial acceptance checklist', 'Pull request workflow']) {
    assert.match(contributing, new RegExp(`## ${heading}`, 'i'));
  }
  for (const requirement of ['community author', 'project maintainer', 'service owner', 'telemetry contract', 'empty-result', 'npm run test:ci', 'npm run governance:validate', 'npm run security:scan', 'npm run test:smoke']) {
    assert.match(contributing, new RegExp(requirement, 'i'));
  }
});
