import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [html, source, css, vendor, license, readme] = await Promise.all([
  read('index.html'), read('assets/ai-starter-kit.js'), read('assets/guide.css'),
  read('assets/vendor/d3/d3.min.js'), read('assets/vendor/d3/LICENSE'), read('assets/vendor/d3/README.md'),
]);
const context = vm.createContext({ document: { getElementById: () => null } });
vm.runInContext(source.replace("  const panel =", "  globalThis.kitData = data;\n  const panel ="), context);
const data = context.kitData;

test('starter kit extends L4 after the preserved pipeline with local scripts and disclaimer', () => {
  const section = html.slice(html.indexOf('id="ai"'), html.indexOf('id="personas"'));
  assert.ok(section.indexOf('id="ai-starter-kit"') > section.indexOf('The pipeline ends in action'));
  assert.match(section, /<h2 id="ai-kit-title">AI Observability Starter Kit<\/h2>/);
  assert.match(section, /Tracing · Monitoring · Evaluation · Governance; OCI \+ open source/);
  assert.match(html, /not an Oracle product/);
  assert.match(html, /<script src="assets\/vendor\/d3\/d3.min.js"><\/script>\s*<script src="assets\/ai-starter-kit.js"><\/script>/);
  assert.doesNotMatch(section + source, /https?:\/\/|innerHTML|Foundry|Microsoft/);
  assert.match(vendor, /v7\.9\.0/);
  assert.match(license, /ISC|Permission to use/);
  assert.ok(readme.includes(createHash('sha256').update(vendor).digest('hex')));
});

test('frozen architecture contains every required node and equivalent static service mapping', () => {
  for (const [key, length] of [['inputs', 5], ['ring', 8], ['tools', 4], ['bottom', 5], ['badges', 6]]) {
    assert.equal(data[key].length, length);
    assert.ok(Object.isFrozen(data[key]));
    data[key].forEach(value => assert.ok(html.includes(typeof value === 'string' ? value : value.label)));
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
    assert.ok(html.includes(`<th scope="row">${mapping.role}</th><td>${oci}</td><td>${oss}</td><td>${mapping.observes}</td>`));
  }
  for (const node of [...data.inputs, data.hub, ...data.ring, ...data.tools, ...data.bottom]) {
    assert.ok(data.mappings[node.mapping]);
    assert.ok(node.observes);
    assert.ok(Object.isFrozen(node));
  }
});

test('enhancement guards unavailable D3 and provides keyboard, live detail and reduced motion', () => {
  vm.runInNewContext(source, { document: { getElementById: () => ({}) }, window: {} });
  assert.match(source, /if \(!panel \|\| !window.d3\) return/);
  assert.match(html, /id="ai-kit-detail"[^>]*aria-live="polite"/);
  assert.match(html, /id="ai-kit-interactive" hidden/);
  assert.match(html, /id="ai-kit-fallback"/);
  for (const attribute of ['tabindex', 'role', 'aria-label', 'aria-controls', 'aria-describedby']) assert.ok(source.includes(`.attr('${attribute}'`));
  for (const key of ['Enter', ' ', 'Escape']) assert.ok(source.includes(`event.key === '${key}'`));
  assert.match(source, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.ai-kit/);
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

test('operational cards reuse canonical mapping descriptions and fallback help stays interactive', () => {
  assert.match(source, /observes: data.mappings\[node.mapping\].observes/);
  assert.ok(html.indexOf('id="ai-kit-help"') > html.indexOf('id="ai-kit-interactive" hidden'));
  assert.ok(html.indexOf('id="ai-kit-help"') < html.indexOf('id="ai-kit-fallback"'));
  assert.match(html, /<h3>Design goals<\/h3>/);
});
