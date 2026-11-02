import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [html, source] = await Promise.all([
  read('index.html'), read('assets/ai-starter-kit.js'),
]);
const context = vm.createContext({ module: { exports: {} }, document: { getElementById: () => null } });
await vm.runInContext(source, context);
const data = context.module.exports;

test('independent architecture disclaimer remains present', () => {
  assert.match(html, /not an Oracle product/);
});

test('executable architecture exposes frozen nodes and complete canonical service mappings', () => {
  for (const [key, length] of [['inputs', 5], ['ring', 8], ['tools', 4], ['bottom', 5], ['badges', 6]]) {
    assert.equal(data[key].length, length);
    assert.ok(Object.isFrozen(data[key]));
  }
  assert.equal(Object.keys(data.mappings).length, 8);
  assert.ok(Object.isFrozen(data));
  assert.ok(Object.isFrozen(data.mappings.traces));
  const expectedRing = ['Distributed Tracing', 'Tool Call Monitoring', 'Latency Metrics', 'Token Consumption', 'Success/Error Rates', 'Agent Evaluations', 'Safety Signals', 'Telemetry Collection'];
  assert.deepEqual(Array.from(data.ring, node => node.label), expectedRing);
  const expected = {
    hub: ['OCI Generative AI Agents', 'None specified'], traces: ['OCI APM', 'OpenTelemetry → Grafana Tempo / Jaeger'],
    evaluation: ['None specified', 'Langfuse / Arize Phoenix'], metrics: ['OCI Monitoring', 'Prometheus + Grafana'],
    platform: ['OCI Logging, Monitoring, APM', 'None specified'], alerting: ['OCI Notifications', 'Alertmanager'],
    governance: ['OCI Cloud Guard, Data Safe, IAM', 'None specified'], audit: ['OCI Audit', 'None specified'],
  };
  for (const [key, [oci, oss]] of Object.entries(expected)) {
    const mapping = data.mappings[key];
    assert.equal(mapping.oci, oci);
    assert.equal(mapping.oss, oss);
    assert.ok(Object.isFrozen(mapping));
    assert.ok(mapping.role.trim());
    assert.ok(mapping.observes.trim());
  }
  const nodes = [...data.inputs, data.hub, ...data.ring, ...data.tools, ...data.bottom];
  assert.equal(new Set(nodes.map(node => node.id)).size, 23);
  assert.deepEqual([...new Set(nodes.map(node => node.mapping))].sort(), Object.keys(expected).sort());
  for (const node of nodes) {
    assert.ok(data.mappings[node.mapping]);
    assert.ok(node.observes);
    assert.ok(Object.isFrozen(node));
  }
});

test('every vendored payload has a license, pinned version and verified SHA-256', async () => {
  async function visit(directory) {
    for (const entry of await readdir(new URL(`../${directory}`, import.meta.url), { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) { await visit(path); continue; }
      // LICENSE and README are provenance metadata, not vendored payloads.
      if (['LICENSE', 'README.md'].includes(entry.name)) continue;
      const [notice, manifest, bytes] = await Promise.all([
        read(`${directory}/LICENSE`), read(`${directory}/README.md`),
        readFile(new URL(`../${path}`, import.meta.url)),
      ]);
      assert.ok(notice.trim(), `${path}: license required`);
      assert.match(manifest, /\bv?\d+\.\d+\.\d+\b/, `${path}: pinned version required`);
      const hash = createHash('sha256').update(bytes).digest('hex');
      assert.ok(manifest.split('\n').some(line => line.includes(entry.name) && line.includes(hash)), `${path}: matching named SHA-256 required`);
    }
  }
  await visit('assets/vendor');
});
