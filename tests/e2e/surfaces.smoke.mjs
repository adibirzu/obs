import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

import { startBrowserHarness } from './browser-harness.mjs';

const root = resolve(new URL('../../', import.meta.url).pathname);
const kitContext = vm.createContext({ module: { exports: {} }, document: { getElementById: () => null } });
await vm.runInContext(await readFile(resolve(root, 'assets/ai-starter-kit.js'), 'utf8'), kitContext);
const kitData = kitContext.module.exports;
const mappingRows = Object.values(kitData.mappings).map(({ role, oci, oss, observes }) => [role, oci, oss, observes]);

const viewports = Object.freeze([
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]);
const surfaces = Object.freeze([
  {
    name: 'Atlas', path: 'index.html', ready: `document.querySelectorAll('#telemetry-route [data-source]').length === 6 && Boolean(document.querySelector('#scenario-matches .scenario-card')) && document.querySelectorAll('#ai-kit-chart svg [data-kit-node]').length === 18`,
    interact: `(async () => { const source = document.querySelector('#telemetry-route [data-source="aws"]'); source.click(); document.querySelector('#rolePick [data-persona="operate"]')?.click(); const search = document.querySelector('#scenario-search'); search.value = 'retail checkout eks latency'; search.dispatchEvent(new Event('input', { bubbles: true })); const pattern = document.querySelector('.uc[data-uc]'); pattern.click(); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); const result = document.querySelector('#finderResult'); const resultFocused = document.activeElement === result; document.querySelector('#atlas-library').open = true; const kit = document.querySelector('[data-kit-node="tracing"]'); kit.focus(); kit.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); const kitDetail = document.querySelector('#ai-kit-detail'); const kitMapping = kitDetail.textContent.includes('OCI APM') && kitDetail.textContent.includes('OpenTelemetry → Grafana Tempo / Jaeger'); const lens = document.querySelector('.lens [role="tab"][aria-selected="true"]'); lens.focus(); return { kitMapping, sourceSelected: source.getAttribute('aria-pressed') === 'true', scenarioMatched: document.querySelector('#scenario-matches .scenario-card')?.textContent.includes('Retail checkout'), resultFocused, patternSelected: pattern.getAttribute('aria-pressed') === 'true', tabControlsPanel: Boolean(document.getElementById(lens.getAttribute('aria-controls'))) }; })()`,
  },
  {
    name: 'Launchpad', path: 'launchpad.html', ready: `document.querySelectorAll('#rolePick [data-persona]').length === 4`,
    interact: `(async () => { const button = document.querySelector('[data-launchpad-section="lp-path-sec"]'); button.click(); await new Promise(resolve => setTimeout(resolve, 80)); const role = document.querySelector('#rolePick [data-persona="build"]'); role.focus(); role.click(); return { activeElement: document.activeElement === role, moduleChanged: document.querySelector('.module.active')?.id === 'module-home', statePersisted: new URLSearchParams(location.search).get('persona') === 'build', currentSection: Boolean(document.querySelector('.launchpad-mobile-map__item[aria-current="location"]')) }; })()`,
  },
  {
    name: 'Interlocks', path: 'interlocks.html', ready: `document.querySelectorAll('#diagram-tabs .diagram-tab').length === 6 && Boolean(document.querySelector('#community-scenario-list .community-scenario'))`,
    interact: `(() => { const tab = document.querySelector('[data-diagram-id="security"]'); tab.focus(); tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); const selected = document.querySelector('[role="tab"][aria-selected="true"]'); return { activeElement: document.activeElement === selected, ariaSelected: selected !== tab, controlsValid: Boolean(document.getElementById(selected.getAttribute('aria-controls'))), rovingTabindex: document.querySelectorAll('[role="tab"][tabindex="0"]').length === 1, panelLabelMatchesActiveTab: document.querySelector('#architecture-board').getAttribute('aria-labelledby') === selected.id }; })()`,
  },
  {
    name: 'Interlock detail', path: 'interlock-detail.html?diagram=network&usecase=flow-logs', ready: `document.querySelectorAll('.usecase-detail__guidance').length === 3`,
    interact: `(() => { const copy = [...document.querySelectorAll('button')].find(button => button.textContent.includes('Copy direct link')); copy.focus(); copy.click(); const current = document.querySelector('.usecase-detail__navigator [aria-current="page"]'); return { activeElement: document.activeElement === copy, titleLinked: document.querySelector('main')?.contains(document.querySelector('#detail-title')), currentWorkflow: Boolean(current), workflowSequence: Boolean(document.querySelector('.network-drilldown__sequence a')), statusRegion: document.querySelector('#page-status')?.getAttribute('aria-live') === 'polite' }; })()`,
  },
]);

export async function runSurfaceSmoke(harness) {
  await harness.setReducedMotion('no-preference');
  for (const viewport of viewports) {
    await harness.setViewport(viewport);
    for (const surface of surfaces) {
      console.log(`Smoke: ${surface.name} at ${viewport.name} (${viewport.width}px)`);
      await harness.navigate(surface.path);
      await harness.waitFor(surface.ready);
      const layout = await harness.evaluate(`(() => ({
        title: document.querySelector('h1')?.textContent?.trim() || document.title,
        noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        overflowing: [...document.querySelectorAll('body *')]
          .filter(element => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return style.display !== 'none' && style.visibility !== 'hidden' && rect.right > document.documentElement.clientWidth + 1; })
          .slice(0, 8)
          .map(element => ({ tag: element.tagName, className: String(element.className), right: Math.round(element.getBoundingClientRect().right) })),
        visibleMain: (() => { const main = document.querySelector('main'); if (!main) return false; const style = getComputedStyle(main); return style.display !== 'none' && style.visibility !== 'hidden'; })(),
        focusable: document.querySelectorAll('a[href], button, input, select, [tabindex]:not([tabindex="-1"])').length,
        oneHeading: [...document.querySelectorAll('h1')].filter(node => node.offsetParent !== null).length === 1,
        duplicateIds: [...document.querySelectorAll('[id]')].filter((node, index, nodes) => nodes.findIndex(other => other.id === node.id) !== index).map(node => node.id),
        ariaControlsValid: [...document.querySelectorAll('[aria-controls]')].every(node => Boolean(document.getElementById(node.getAttribute('aria-controls')))),
        undersizedTouchTargets: [...document.querySelectorAll('.uc, .diagram-tab, .service-card__button, .launchpad-mobile-map__item, .ai-kit__node, .ai-kit__card')]
          .filter(node => { const style = getComputedStyle(node); const rect = node.getBoundingClientRect(); return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0; })
          .filter(node => { const rect = node.getBoundingClientRect(); return rect.width < 48 || rect.height < 48; })
          .map(node => { const rect = node.getBoundingClientRect(); return { label: node.textContent.trim().slice(0, 32), width: Math.round(rect.width), height: Math.round(rect.height) }; }),
        minTouchTarget: 48
      }))()`);
      assert.ok(layout.title, `${surface.name}/${viewport.name}: title`);
      assert.equal(layout.noOverflow, true, `${surface.name}/${viewport.name}: noOverflow ${JSON.stringify(layout.overflowing)}`);
      assert.equal(layout.visibleMain, true, `${surface.name}/${viewport.name}: main visible`);
      assert.ok(layout.focusable > 0, `${surface.name}/${viewport.name}: focusable controls`);
      assert.equal(layout.oneHeading, true, `${surface.name}/${viewport.name}: exactly one h1`);
      assert.deepEqual(layout.duplicateIds, [], `${surface.name}/${viewport.name}: duplicate IDs`);
      assert.equal(layout.ariaControlsValid, true, `${surface.name}/${viewport.name}: aria-controls targets`);
      assert.deepEqual(layout.undersizedTouchTargets, [], `${surface.name}/${viewport.name}: minimum ${layout.minTouchTarget}px touch targets`);
      const interaction = await harness.evaluate(surface.interact);
      if (surface.name === 'Atlas') {
        const integration = await harness.evaluate(`(() => {
          const kit = document.querySelector('#ai-starter-kit');
          const scripts = [...document.scripts];
          const vendor = scripts.findIndex(script => script.src.endsWith('/assets/vendor/d3/d3.min.js'));
          const enhancement = scripts.findIndex(script => script.src.endsWith('/assets/ai-starter-kit.js'));
          const pipeline = document.querySelector('#ai .aicap');
          return {
            localScriptOrder: vendor >= 0 && enhancement === vendor + 1,
            d3Version: window.d3.version,
            inL4AfterPipeline: kit.closest('#ai') !== null && Boolean(pipeline.compareDocumentPosition(kit) & Node.DOCUMENT_POSITION_FOLLOWING),
            title: document.querySelector('#ai-kit-title').textContent.trim(),
            enhanced: !document.querySelector('#ai-kit-interactive').hidden && document.querySelector('#ai-kit-fallback').hidden,
            nodes: [...kit.querySelectorAll('[data-kit-node]')].map(node => node.dataset.kitNode),
            goals: [...document.querySelectorAll('#ai-kit-badges li')].map(node => node.textContent),
            rows: [...document.querySelector('#ai-kit-fallback table').tBodies[0].rows].map(row => [...row.cells].map(cell => cell.textContent.trim())),
            accessibleNodes: [...kit.querySelectorAll('[data-kit-node]')].every(node => node.tabIndex === 0 && node.getAttribute('role') === 'button' && node.getAttribute('aria-label') === 'Explore ' + node.__data__.label && node.getAttribute('aria-controls') === 'ai-kit-detail' && node.getAttribute('aria-describedby') === 'ai-kit-help'),
          };
        })()`);
        assert.equal(integration.localScriptOrder, true, 'local D3 loads immediately before enhancement');
        assert.equal(integration.d3Version, '7.9.0');
        assert.equal(integration.inL4AfterPipeline, true, 'starter kit follows the preserved L4 pipeline');
        assert.equal(integration.title, 'AI Observability Starter Kit');
        assert.equal(integration.enhanced, true, 'D3 render replaces fallback');
        assert.equal(integration.accessibleNodes, true, 'rendered nodes expose keyboard and detail semantics');
        assert.deepEqual(integration.nodes, [...kitData.inputs, kitData.hub, ...kitData.ring, ...kitData.tools, ...kitData.bottom].map(node => node.id));
        assert.deepEqual(integration.goals, Array.from(kitData.badges));
        assert.deepEqual(integration.rows, mappingRows, 'parsed fallback table cells exactly match every executable mapping');
        for (const id of ['alerts', 'audit-trail']) {
          const observes = await harness.evaluate(`(() => {
            document.querySelector('[data-kit-node="${id}"]').click();
            return document.querySelector('#ai-kit-detail p').textContent;
          })()`);
          const node = kitData.bottom.find(node => node.id === id);
          assert.ok(observes.endsWith('Observes: ' + kitData.mappings[node.mapping].observes), id + ': selected operational card uses canonical description');
        }

        if (viewport.width === 390) assert.equal(await harness.evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Atlas at 390px: no document overflow');
        assert.equal(await harness.evaluate(`fetch('https://offline-check.invalid/no-network').then(() => false, () => true)`), true, 'external fetch blocked');
        await harness.evaluate(`document.querySelector('[data-kit-node="tracing"]').focus()`);
        await harness.press('Escape', 'Escape', 27);
        assert.equal(await harness.evaluate(`(() => {
          document.activeElement.blur();
          const node = document.querySelector('[data-kit-node="mcp"]');
          node.dispatchEvent(new MouseEvent('mouseenter'));
          const preview = document.querySelector('#ai-kit-detail').textContent.includes('MCP Tools');
          const unpressed = node.getAttribute('aria-pressed') === 'false';
          const quiet = document.querySelector('#ai-kit-detail').getAttribute('aria-live') === 'off';
          node.dispatchEvent(new MouseEvent('mouseleave'));
          return preview && unpressed && quiet && document.querySelector('#ai-kit-detail').textContent.includes('Explore the observability path');
        })()`), true, 'hover previews and mouseleave restores without pressing or live announcements');
        assert.equal(await harness.evaluate(`(() => {
          const node = document.querySelector('[data-kit-node="tracing"]'); node.focus();
          return node.getAttribute('aria-pressed') === 'false' && document.querySelector('#ai-kit-detail').textContent.includes('Distributed Tracing');
        })()`), true, 'focus previews without activation');
        await harness.press(' ', 'Space', 32);
        assert.equal(await harness.evaluate(`document.querySelector('[data-kit-node="tracing"]').getAttribute('aria-pressed') === 'true'`), true, 'Space activates');
        assert.equal(await harness.evaluate(`document.querySelector('#ai-kit-detail').getAttribute('aria-live')`), 'polite', 'real selection announces details');
        assert.equal(await harness.evaluate(`getComputedStyle(document.querySelector('.ai-kit__link.is-connected')).animationName === 'ai-kit-flow'`), true, 'selected path really animates with full motion');
        assert.equal(await harness.evaluate(`getComputedStyle(document.querySelector('.ai-kit__link.can-animate')).transitionDuration !== '0s'`), true, 'highlight really transitions');
        if (viewport.width === 1440) {
          const sizes = await harness.evaluate(`(() => {
            const svg = document.querySelector('#ai-kit-chart svg');
            const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
            return [...svg.querySelectorAll('.ai-kit__subtitle')].map(text => parseFloat(getComputedStyle(text).fontSize) * scale);
          })()`);
          assert.ok(sizes.length > 0 && sizes.every(size => size >= 11), '1440px: rendered node subtitles are at least 11px');
        }
        assert.equal(await harness.evaluate(` [...document.querySelectorAll('.ai-kit__node')].every(node => {
          const box = node.querySelector('rect').getBBox();
          return [...node.querySelectorAll('text')].every(text => { const t = text.getBBox(); return t.x >= box.x + 8 && t.x + t.width <= box.x + box.width - 8 && t.y >= box.y + 8 && t.y + t.height <= box.y + box.height - 8; });
        })`), true, 'all rendered SVG text fits inside node padding');
        assert.equal(await harness.evaluate(`(() => {
          const ring = new Set(['tracing', 'tool-calls', 'latency', 'tokens', 'rates', 'evaluations', 'safety', 'telemetry']);
          const boxes = [...document.querySelectorAll('.ai-kit__node')].filter(node => ring.has(node.dataset.kitNode)).map(node => {
            const rect = node.querySelector('rect').getBBox(), transform = node.transform.baseVal.consolidate().matrix;
            return { x: rect.x + transform.e, y: rect.y + transform.f, width: rect.width, height: rect.height };
          });
          return [...document.querySelectorAll('.ai-kit__link')].filter(path => !ring.has(path.__data__.target)).every(path => {
            const length = path.getTotalLength();
            for (let distance = 0; distance <= length; distance += 2) {
              const point = path.getPointAtLength(distance);
              if (boxes.some(box => point.x > box.x - 3 && point.x < box.x + box.width + 3 && point.y > box.y - 3 && point.y < box.y + box.height + 3)) return false;
            }
            return true;
          });
        })()`), true, 'external links avoid every ring node');
        await harness.setReducedMotion('reduce');
        await harness.waitFor(`document.querySelector('#ai-starter-kit').dataset.reducedMotion === 'true'`);
        assert.equal(await harness.evaluate(`(() => { const node = document.querySelector('[data-kit-node="tracing"]'); node.focus(); return document.activeElement === node; })()`), true);
        await harness.press('Enter', 'Enter', 13);
        assert.equal(await harness.evaluate(`document.querySelector('#ai-kit-detail').textContent.includes('OCI APM')`), true);
        assert.equal(await harness.evaluate(`[...document.querySelectorAll('.ai-kit__link')].every(path => !path.classList.contains('can-animate') && getComputedStyle(path).animationName === 'none' && getComputedStyle(path).transitionDuration === '0s')`), true);
        await harness.press('Escape', 'Escape', 27);
        assert.equal(await harness.evaluate(`document.querySelectorAll('#ai-starter-kit [aria-pressed="true"]').length === 0`), true);
        assert.equal(await harness.evaluate(`document.querySelector('#ai-kit-detail').getAttribute('aria-live')`), 'off', 'Escape clears silently');
        assert.equal(await harness.evaluate(`document.querySelector('#ai-kit-detail').textContent.includes('Explore the observability path')`), true, 'Escape restores default details');
        await harness.setReducedMotion('no-preference');
        await harness.waitFor(`document.querySelector('.ai-kit__link.can-animate') !== null`);
        // Reload without D3, using interception rather than any external request.
        await harness.send('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(window, 'd3', { get: () => undefined, set: () => {}, configurable: true });` }).then(async ({ identifier }) => {
          try {
            await harness.reload();
            await harness.waitFor(`document.readyState === 'complete'`);
            assert.equal(await harness.evaluate(`(() => { document.querySelector('#atlas-library').open = true; return window.d3 === undefined && !document.querySelector('#ai-kit-fallback').hidden && document.querySelector('#ai-kit-fallback').getBoundingClientRect().height > 0 && document.querySelector('#ai-kit-interactive').hidden && document.querySelector('#ai-kit-help').closest('[hidden]') !== null; })()`), true, 'D3 unavailable: static fallback visible and interaction help hidden');
            assert.deepEqual(await harness.evaluate(`Array.from(document.querySelector('#ai-kit-fallback table').tBodies[0].rows, row => Array.from(row.cells, cell => cell.textContent.trim()))`), mappingRows, 'unavailable D3 preserves complete mapping table');
          } finally { await harness.send('Page.removeScriptToEvaluateOnNewDocument', { identifier }); }
        });
      }
      for (const [name, passed] of Object.entries(interaction)) assert.equal(passed, true, `${surface.name}/${viewport.name}: ${name}`);
    }
  }
  assert.deepEqual(harness.exceptions, [], 'Runtime.exceptionThrown');
  assert.deepEqual(harness.localNetworkFailures, [], 'Network.loadingFailed');
  console.log('Cross-surface smoke passed: 4 surfaces × 2 viewport widths.');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const configuredCdpPort = Number.parseInt(process.env.CDP_PORT ?? '', 10);
  const harness = await startBrowserHarness({
    root,
    ...(Number.isInteger(configuredCdpPort) && configuredCdpPort > 0 ? { cdpPort: configuredCdpPort } : {}),
  });
  try {
    await runSurfaceSmoke(harness);
  } finally {
    await harness.close();
  }
}
