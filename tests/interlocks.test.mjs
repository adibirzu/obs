import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import {
  buildDrawio,
  buildDocumentationRegister,
  buildDocumentedDrawio,
  buildDocumentedExcalidraw,
  buildExcalidraw,
  buildStandaloneDrawio,
} from '../scripts/generate-interlocks-drawio.mjs';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('assets/interlocks/catalog.json', root), 'utf8'));

test('Log Analytics is a cross-domain interlock with explicit signal boundaries', async () => {
  const logAnalytics = catalog.services.find(({ id }) => id === 'logging-analytics');
  assert.ok(logAnalytics);
  assert.match(logAnalytics.summary, /log and event records/i);
  assert.match(logAnalytics.interlock, /Prometheus exporter metrics/i);
  assert.match(logAnalytics.interlock, /APM traces/i);

  for (const diagram of catalog.diagrams) {
    assert.ok(diagram.serviceRefs.includes('logging-analytics'), `${diagram.id}: Logan reference`);
  }

  const context = {};
  const drilldownScript = await readFile(new URL('assets/interlocks/domain-drilldowns.js', root), 'utf8');
  const networkScript = await readFile(new URL('assets/interlocks/network-drilldowns.js', root), 'utf8');
  vm.runInNewContext(drilldownScript, context);
  vm.runInNewContext(networkScript, context);
  for (const [domain, drilldowns] of Object.entries(context.DOMAIN_DRILLDOWNS)) {
    const loganWorkflows = drilldowns.filter(({ services }) => services.includes('Oracle Log Analytics (Logan)'));
    assert.ok(loganWorkflows.length >= 5, `${domain}: at least five Logan workflows`);
  }
  assert.ok(
    context.NETWORK_DRILLDOWNS.filter(({ services }) => services.includes('Oracle Log Analytics (Logan)')).length >= 5,
    'network: at least five Logan workflows',
  );

  assert.match(drilldownScript, /Prometheus exporter metrics/);
  assert.match(drilldownScript, /published service boundary/);

  const page = await readFile(new URL('interlocks.html', root), 'utf8');
  assert.match(page, /id="logan-interlock"/);
  assert.match(page, /Logan across every interlock/);
  assert.match(page, /Prometheus exporter metrics remain in a metric backend/);
  assert.match(page, /APM remains a linked service/);
});

test('PDF generation selects every diagram when no ids are supplied', async () => {
  const { selectDiagrams } = await import('../scripts/interlock-pdf-selection.mjs');
  assert.equal(selectDiagrams(catalog.diagrams, []).length, catalog.diagrams.length);
  assert.deepEqual(selectDiagrams(catalog.diagrams, ['network']).map(({ id }) => id), ['network']);
  assert.throws(() => selectDiagrams(catalog.diagrams, ['missing']), /Unknown diagram id: missing/);
});

test('Interlocks functional metadata and controls meet the project accessibility floor', async () => {
  const css = await readFile(new URL('assets/interlocks/interlocks.css', root), 'utf8');
  assert.doesNotMatch(css, /color:\s*var\(--text-subtle\)/);
  assert.doesNotMatch(css, /font-size:\s*\.(?:5\d|6\d|7[0-4])rem/);
  assert.doesNotMatch(css, /min-height:\s*4[0-7]px/);
  assert.match(css, /\.interlock-button\s*\{[^}]*min-height:\s*48px/s);
  assert.match(css, /\.diagram-tab\s*\{[^}]*min-height:\s*48px/s);
});

test('catalog defines the six requested interlock sheets in a stable order', () => {
  assert.deepEqual(
    catalog.diagrams.map(({ id }) => id),
    ['network', 'security', 'iam-governance', 'landing-zone', 'operations-lifecycle', 'end-to-end'],
  );
  assert.equal(new Set(catalog.diagrams.map(({ title }) => title)).size, 6);
});

test('every diagram is complete and references known services', () => {
  const serviceIds = new Set(catalog.services.map(({ id }) => id));

  for (const diagram of catalog.diagrams) {
    assert.ok(diagram.title.length > 20, `${diagram.id}: title`);
    assert.ok(diagram.subtitle.length > 40, `${diagram.id}: subtitle`);
    assert.ok(diagram.purpose.length > 80, `${diagram.id}: purpose`);
    assert.ok(diagram.legend.length >= 5, `${diagram.id}: legend`);
    assert.ok(diagram.sourceGroups.length >= 4, `${diagram.id}: source groups`);
    assert.ok(diagram.outcomeGroups.length >= 4, `${diagram.id}: outcome groups`);
    assert.ok(diagram.workflows.length >= 5, `${diagram.id}: workflows`);
    assert.ok(diagram.serviceRefs.length >= 8, `${diagram.id}: service references`);
    for (const serviceId of diagram.serviceRefs) {
      assert.ok(serviceIds.has(serviceId), `${diagram.id}: unknown service ${serviceId}`);
    }
  }
});

test('service catalog is source-grounded and maintainable', () => {
  assert.ok(catalog.services.length >= 30);
  assert.equal(new Set(catalog.services.map(({ id }) => id)).size, catalog.services.length);

  for (const service of catalog.services) {
    assert.ok(service.summary.length >= 45, `${service.id}: summary`);
    assert.ok(service.interlock.length >= 35, `${service.id}: interlock`);
    assert.match(service.docs, /^https:\/\/(docs\.oracle\.com|www\.oracle\.com)\//, `${service.id}: official docs`);
    assert.ok(service.domains.length >= 1, `${service.id}: domains`);
    assert.ok(service.signals.length >= 1, `${service.id}: signals`);
  }
});

test('documentation register separates Oracle-documented facts from architecture inferences', () => {
  const register = buildDocumentationRegister(catalog, { verifiedOn: '2026-06-30' });

  assert.equal(register.edition, 'documented');
  assert.equal(register.verifiedOn, '2026-06-30');
  assert.equal(register.sources.length, catalog.services.length);
  assert.equal(register.diagramPatterns.length, catalog.diagrams.length);
  assert.match(register.methodology.architecturalInference, /not Oracle product guarantees/i);

  for (const [index, source] of register.sources.entries()) {
    assert.equal(source.id, `DOC-${String(index + 1).padStart(2, '0')}`);
    assert.match(source.officialUrl, /^https:\/\/(docs\.oracle\.com|www\.oracle\.com)\//);
    assert.equal(source.claimType, 'documented-service-capability');
    assert.ok(source.documentedCapability.length >= 45, source.serviceId);
    assert.ok(source.architecturalInference.length >= 35, source.serviceId);
  }

  for (const pattern of register.diagramPatterns) {
    assert.equal(pattern.claimType, 'reference-architecture-inference');
    assert.ok(pattern.sourceIds.length >= 8, pattern.diagramId);
  }
});

test('documented Draw.io edition embeds official links and visible source identifiers', () => {
  const xml = buildDocumentedDrawio(catalog, { modified: '2026-06-30T00:00:00.000Z' });
  assert.equal((xml.match(/<diagram /g) ?? []).length, 6);
  assert.equal((xml.match(/pageWidth="3000" pageHeight="4243"/g) ?? []).length, 6);
  assert.ok((xml.match(/link="https:\/\/docs\.oracle\.com/g) ?? []).length >= 100);
  assert.ok((xml.match(/DOC-[0-9]{2}/g) ?? []).length >= 80);
  assert.match(xml, /OFFICIAL ORACLE DOCUMENTATION/);
  assert.match(xml, /REFERENCE ARCHITECTURE INFERENCE/);
  assert.doesNotMatch(xml, /edge="1"/, 'documented posters use dedicated lanes instead of routed lines through labels');
  assert.doesNotMatch(xml, /OCI Alarms/);
  assert.match(xml, /Monitoring Alarms/);
});

test('documented Excalidraw edition is a dense linked 4K vector poster', () => {
  for (const diagram of catalog.diagrams) {
    const excalidraw = buildDocumentedExcalidraw(catalog, diagram);
    assert.equal(excalidraw.appState.name, `${diagram.title} — Documented Edition`);
    assert.equal(excalidraw.appState.exportBackground, true);
    assert.ok(excalidraw.elements.length >= 100, `${diagram.id}: infographic density`);
    assert.equal(new Set(excalidraw.elements.map(({ id }) => id)).size, excalidraw.elements.length);
    assert.ok(
      excalidraw.elements.filter(({ link }) => link?.startsWith('https://docs.oracle.com')).length >= 8,
      `${diagram.id}: official documentation links`,
    );
    assert.ok(
      excalidraw.elements.every(({ x, y, width, height }) => x >= 0 && y >= 0 && x + width <= 3000 && y + height <= 4243),
      `${diagram.id}: poster bounds`,
    );
  }
});

test('documented Excalidraw service names, DOC badges, and summaries do not overlap', () => {
  const centralIds = [
    'monitoring', 'logging', 'events', 'alarms', 'notifications', 'announcements',
    'logging-analytics', 'apm', 'stack-monitoring', 'operations-insights', 'resource-analytics', 'database-management',
    'cloud-advisor', 'cost-analysis', 'limits-quotas-budgets', 'tenancy-explorer', 'organization-management',
  ];

  for (const diagram of catalog.diagrams) {
    const elements = new Map(buildDocumentedExcalidraw(catalog, diagram).elements.map((element) => [element.id, element]));
    for (const serviceId of centralIds) {
      const name = elements.get(`${diagram.id}-service-${serviceId}-name`);
      const badge = elements.get(`${diagram.id}-service-${serviceId}-doc-box`);
      const summary = elements.get(`${diagram.id}-service-${serviceId}-summary`);
      assert.ok(name && badge && summary, `${diagram.id}/${serviceId}: service card parts`);
      assert.ok(name.x + name.width <= badge.x, `${diagram.id}/${serviceId}: name clears DOC badge`);
      assert.ok(summary.y >= badge.y + badge.height, `${diagram.id}/${serviceId}: summary clears DOC badge`);
    }
  }
});

test('Draw.io generator emits six dense, uncompressed 4K vector poster pages', () => {
  const xml = buildDrawio(catalog, { modified: '2026-06-30T00:00:00.000Z' });
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.equal((xml.match(/<diagram /g) ?? []).length, 6);
  assert.equal((xml.match(/<mxGraphModel /g) ?? []).length, 6);
  assert.equal((xml.match(/pageWidth="3000" pageHeight="4243"/g) ?? []).length, 6);
  assert.doesNotMatch(xml, /<diagram[^>]*>\s*[A-Za-z0-9+/]{100,}/);

  for (const diagram of catalog.diagrams) {
    assert.match(xml, new RegExp(`name="${diagram.sheetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    const page = xml.match(new RegExp(`<diagram id="${diagram.id}"[\\s\\S]*?<\\/diagram>`))?.[0] ?? '';
    assert.ok((page.match(/vertex="1"/g) ?? []).length >= 95, `${diagram.id}: dense editable poster cells`);
    assert.match(page, /service-icon/, `${diagram.id}: icon-backed service cards`);
    if (diagram.id !== 'end-to-end') {
      assert.equal((page.match(/edge="1"/g) ?? []).length, 0, `${diagram.id}: no routed lines through content`);
    }
  }
  assert.match(xml, /TELEMETRY &amp; SIGNAL FLOW/);
  assert.match(xml, /INSIGHTS &amp; ACTIONS FLOW/);
  assert.match(xml, /SIGNAL TYPES &amp; EVIDENCE/);
  assert.match(xml, /LAYER 4.*REFERENCE OPERATING MODEL WORKFLOWS/);
});

test('generator emits editable standalone Draw.io and Excalidraw artifacts', async () => {
  for (const diagram of catalog.diagrams) {
    const standalone = buildStandaloneDrawio(catalog, diagram, { modified: '2026-06-30T00:00:00.000Z' });
    assert.equal((standalone.match(/<diagram /g) ?? []).length, 1);
    assert.match(standalone, /pageWidth="3000" pageHeight="4243"/);

    const excalidraw = buildExcalidraw(catalog, diagram);
    assert.equal(excalidraw.type, 'excalidraw');
    assert.equal(excalidraw.version, 2);
    assert.equal(excalidraw.appState.viewBackgroundColor, '#ffffff');
    assert.ok(excalidraw.elements.length >= 20, `${diagram.id}: comprehensive element set`);
    assert.equal(new Set(excalidraw.elements.map(({ id }) => id)).size, excalidraw.elements.length);
    assert.ok(
      excalidraw.elements.filter(({ type }) => type === 'text').every(({ fontFamily }) => fontFamily === 5),
      `${diagram.id}: all text uses Excalifont`,
    );

    await Promise.all([
      readFile(new URL(`assets/diagrams/interlocks-infographic/${diagram.id}.drawio`, root), 'utf8'),
      readFile(new URL(`assets/diagrams/interlocks-infographic/${diagram.id}.excalidraw`, root), 'utf8'),
    ]);
  }
});

test('separately named documented artifacts are generated without replacing earlier editions', async () => {
  const workbook = await readFile(new URL('assets/diagrams/oci-observability-service-interlocks-documented.drawio', root), 'utf8');
  const register = JSON.parse(await readFile(new URL('assets/interlocks/documentation-sources.json', root), 'utf8'));
  assert.match(workbook, /OFFICIAL ORACLE DOCUMENTATION/);
  assert.equal(register.sources.length, catalog.services.length);

  for (const diagram of catalog.diagrams) {
    await Promise.all([
      readFile(new URL(`assets/diagrams/interlocks-documented/${diagram.id}-documented.drawio`, root), 'utf8'),
      readFile(new URL(`assets/diagrams/interlocks-documented/${diagram.id}-documented.excalidraw`, root), 'utf8'),
    ]);
  }
});

test('explorer page exposes diagram selection, service discovery, and editable download', async () => {
  const html = await readFile(new URL('interlocks.html', root), 'utf8');
  assert.match(html, /id="diagram-tabs"/);
  assert.match(html, /id="service-search"/);
  assert.match(html, /id="domain-filter"/);
  assert.match(html, /assets\/diagrams\/oci-observability-service-interlocks-documented\.drawio/);
  assert.match(html, /assets\/interlocks\/documentation-sources\.json/);
  assert.match(html, /id="artifact-library"/);
  assert.match(html, /assets\/interlocks\/interlocks\.js/);
  assert.match(html, /assets\/interlocks\/interlocks\.css/);
  assert.match(html, /<script defer src="assets\/interlocks\/catalog-data\.js"><\/script>/);
  assert.doesNotMatch(html, /<script type="module"/);
});

test('explorer provides robust WCAG-oriented semantics and keyboard behavior', async () => {
  const [html, script, styles] = await Promise.all([
    readFile(new URL('interlocks.html', root), 'utf8'),
    readFile(new URL('assets/interlocks/interlocks.js', root), 'utf8'),
    readFile(new URL('assets/interlocks/interlocks.css', root), 'utf8'),
  ]);

  assert.match(html, /href="#services"[^>]*>Skip to service reference/);
  assert.match(html, /id="architecture-board"[^>]*role="tabpanel"/);
  assert.match(html, /aria-describedby="dialog-summary"/);
  assert.match(html, /id="page-status"[^>]*aria-live="polite"/);
  assert.match(script, /event\.key === 'ArrowRight'/);
  assert.match(script, /event\.key === 'Home'/);
  assert.match(script, /previousFocus\.focus/);
  assert.match(script, /interlocks-documented\/\$\{diagram\.id\}-documented\.drawio/);
  assert.match(styles, /forced-colors:\s*active/);
  assert.match(styles, /min-height:\s*48px/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(styles, /\.flow-arrow \{ display: none; \}/);
});

test('every documented poster has a print-quality PDF download', async () => {
  const [script, pdfs] = await Promise.all([
    readFile(new URL('assets/interlocks/interlocks.js', root), 'utf8'),
    Promise.all(catalog.diagrams.map(async (diagram) => {
      const pdf = await readFile(new URL(`assets/diagrams/interlocks-documented/${diagram.id}-documented.pdf`, root));
      return { id: diagram.id, pdf };
    })),
  ]);

  assert.match(script, /text: 'PDF'/);
  assert.match(script, /interlocks-documented\/\$\{diagram\.id\}-documented\.pdf/);
  for (const { id, pdf } of pdfs) {
    assert.ok(pdf.subarray(0, 5).equals(Buffer.from('%PDF-')), `${id}: valid PDF header`);
    assert.ok(pdf.length > 10_000, `${id}: non-trivial print-quality PDF`);
  }
});

test('generated local catalog removes the runtime fetch requirement', async () => {
  const catalogScript = await readFile(new URL('assets/interlocks/catalog-data.js', root), 'utf8');
  assert.match(catalogScript, /^globalThis\.INTERLOCK_CATALOG = Object\.freeze\(/);
  assert.match(catalogScript, /"id":"network"/);
  assert.match(catalogScript, /"id":"end-to-end"/);
});

test('workflow overview links to dedicated networking detail pages', async () => {
  const [html, script, drilldowns] = await Promise.all([
    readFile(new URL('interlocks.html', root), 'utf8'),
    readFile(new URL('assets/interlocks/interlocks.js', root), 'utf8'),
    readFile(new URL('assets/interlocks/network-drilldowns.js', root), 'utf8'),
  ]);

  assert.doesNotMatch(html, /id="domain-drilldowns-view"/);
  assert.match(script, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(script, /state\.activeDiagramId = requested\.diagram/);
  assert.match(script, /data-usecase-id/);
  assert.match(script, /function detailUrl/);
  assert.doesNotMatch(script, /class InterlockFlowRenderer/);
  assert.match(drilldowns, /flow-logs/);
  assert.match(drilldowns, /zpr-log-analytics/);
});

test('network drilldowns include the ZPR to Log Analytics visibility workflow', async () => {
  const drilldowns = await readFile(new URL('assets/interlocks/network-drilldowns.js', root), 'utf8');

  assert.match(drilldowns, /ZPR to Log Analytics visibility/);
  assert.match(drilldowns, /VCN Flow Logs/);
  assert.match(drilldowns, /Oracle Log Analytics \(Logan\)/);
  assert.doesNotMatch(drilldowns, /Signal-to-automation with Service Connector Hub/);
});

test('every interlock domain defines ten actionable drilldowns', async () => {
  const definitions = await readFile(new URL('assets/interlocks/domain-drilldowns.js', root), 'utf8');
  const expectedDomains = ['security', 'iam-governance', 'landing-zone', 'operations-lifecycle', 'end-to-end'];

  for (const domain of expectedDomains) {
    const entries = definitions.match(new RegExp(`['"]?${domain}['"]?: Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\)`, 'm'))?.[1] ?? '';
    assert.equal((entries.match(/id:/g) ?? []).length, 10, `${domain}: ten use cases`);
  }
});

test('every visible interlock example is an actionable drilldown trigger', async () => {
  const script = await readFile(new URL('assets/interlocks/interlocks.js', root), 'utf8');
  assert.match(script, /className: 'example-drilldown'/);
  assert.match(script, /href: detailUrl\(diagram\.id, useCaseId\)/);
  assert.match(script, /interlock-detail\.html/);
});

test('each interlock has a dedicated shareable detail page', async () => {
  const [html, script] = await Promise.all([
    readFile(new URL('interlock-detail.html', root), 'utf8'),
    readFile(new URL('assets/interlocks/usecase-detail.js', root), 'utf8'),
  ]);
  assert.match(html, /id="usecase-detail"/);
  assert.match(html, /assets\/interlocks\/domain-drilldowns\.js/);
  assert.match(script, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(script, /Previous workflow/);
  assert.match(script, /Next workflow/);
  assert.match(script, /Copy direct link/);
  assert.match(script, /navigator\.clipboard\.writeText/);
  assert.match(script, /text: 'PDF'/);
  assert.match(script, /All workflows in this domain/);
  assert.match(script, /usecase-detail__navigator/);
});

test('every use case has editable Draw.io and Excalidraw artifacts', async () => {
  const manifest = JSON.parse(await readFile(new URL('assets/diagrams/usecases/manifest.json', root), 'utf8'));
  assert.equal(manifest.artifacts.length, 60);
  for (const { domain, id } of manifest.artifacts) {
    const [drawio, excalidraw, pdf] = await Promise.all([
      readFile(new URL(`assets/diagrams/usecases/${domain}/${id}.drawio`, root), 'utf8'),
      readFile(new URL(`assets/diagrams/usecases/${domain}/${id}.excalidraw`, root), 'utf8'),
      readFile(new URL(`assets/diagrams/usecases/${domain}/${id}.pdf`, root)),
    ]);
    assert.match(drawio, /<mxfile/);
    assert.match(drawio, /endArrow=block/);
    assert.match(drawio, /pageWidth="1400" pageHeight="1060"/);
    assert.match(drawio, /SYSTEM PREREQUISITES/);
    assert.match(drawio, /DISTRIBUTED CORRELATION KEYS/);
    assert.match(drawio, /EMPTY-RESULT CAVEAT/);
    const parsedExcalidraw = JSON.parse(excalidraw);
    assert.equal(parsedExcalidraw.type, 'excalidraw');
    assert.ok(parsedExcalidraw.elements.some(({ id }) => id === 'prerequisites'));
    assert.ok(parsedExcalidraw.elements.some(({ id }) => id === 'correlation'));
    assert.ok(parsedExcalidraw.elements.some(({ id }) => id === 'empty-result'));
    assert.ok(pdf.subarray(0, 5).equals(Buffer.from('%PDF-')));
    assert.match(pdf.toString('latin1'), /SYSTEM PREREQUISITES/);
    assert.match(pdf.toString('latin1'), /DISTRIBUTED CORRELATION KEYS/);
    assert.match(pdf.toString('latin1'), /EMPTY-RESULT CAVEAT/);
  }
});

test('the atlas and README expose the interlock addon', async () => {
  const [index, readme] = await Promise.all([
    readFile(new URL('index.html', root), 'utf8'),
    readFile(new URL('README.md', root), 'utf8'),
  ]);
  assert.match(index, /href="interlocks\.html"/);
  assert.match(readme, /OCI Observability Service Interlocks/);
  assert.match(readme, /npm run generate:interlocks/);
});
