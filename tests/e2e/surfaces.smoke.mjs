import assert from 'node:assert/strict';
import { resolve } from 'node:path';

import { startBrowserHarness } from './browser-harness.mjs';

const root = resolve(new URL('../../', import.meta.url).pathname);
const viewports = Object.freeze([
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]);
const surfaces = Object.freeze([
  {
    name: 'Atlas', path: 'index.html', ready: `document.querySelectorAll('#telemetry-route [data-source]').length === 6 && Boolean(document.querySelector('#scenario-matches .scenario-card'))`,
    interact: `(async () => { const source = document.querySelector('#telemetry-route [data-source="aws"]'); source.click(); document.querySelector('#rolePick [data-persona="operate"]')?.click(); const search = document.querySelector('#scenario-search'); search.value = 'retail checkout eks latency'; search.dispatchEvent(new Event('input', { bubbles: true })); const pattern = document.querySelector('.uc[data-uc]'); pattern.click(); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); const result = document.querySelector('#finderResult'); const resultFocused = document.activeElement === result; const lens = document.querySelector('.lens [role="tab"][aria-selected="true"]'); lens.focus(); return { sourceSelected: source.getAttribute('aria-pressed') === 'true', scenarioMatched: document.querySelector('#scenario-matches .scenario-card')?.textContent.includes('Retail checkout'), resultFocused, patternSelected: pattern.getAttribute('aria-pressed') === 'true', tabControlsPanel: Boolean(document.getElementById(lens.getAttribute('aria-controls'))) }; })()`,
  },
  {
    name: 'Launchpad', path: 'launchpad.html', ready: `document.querySelectorAll('#rolePick [data-persona]').length === 4`,
    interact: `(async () => { const button = document.querySelector('[data-launchpad-section="lp-path-sec"]'); button.click(); await new Promise(resolve => setTimeout(resolve, 80)); const role = document.querySelector('#rolePick [data-persona="build"]'); role.focus(); role.click(); return { activeElement: document.activeElement === role, moduleChanged: document.querySelector('.module.active')?.id === 'module-home', statePersisted: new URLSearchParams(location.search).get('persona') === 'build', currentSection: Boolean(document.querySelector('.launchpad-mobile-map__item[aria-current="location"]')) }; })()`,
  },
  {
    name: 'Interlocks', path: 'interlocks.html', ready: `document.querySelectorAll('#diagram-tabs .diagram-tab').length === 6 && Boolean(document.querySelector('#community-scenario-list .community-scenario'))`,
    interact: `(() => { const tab = document.querySelector('[data-diagram-id="security"]'); tab.focus(); tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); const selected = document.querySelector('[role="tab"][aria-selected="true"]'); return { activeElement: document.activeElement === selected, ariaSelected: selected !== tab, controlsValid: Boolean(document.getElementById(selected.getAttribute('aria-controls'))), rovingTabindex: document.querySelectorAll('[role="tab"][tabindex="0"]').length === 1 }; })()`,
  },
  {
    name: 'Interlock detail', path: 'interlock-detail.html?diagram=network&usecase=flow-logs', ready: `document.querySelectorAll('.usecase-detail__guidance').length === 3`,
    interact: `(() => { const copy = [...document.querySelectorAll('button')].find(button => button.textContent.includes('Copy direct link')); copy.focus(); copy.click(); const current = document.querySelector('.usecase-detail__navigator [aria-current="page"]'); return { activeElement: document.activeElement === copy, titleLinked: document.querySelector('main')?.contains(document.querySelector('#detail-title')), currentWorkflow: Boolean(current), workflowSequence: Boolean(document.querySelector('.network-drilldown__sequence a')), statusRegion: document.querySelector('#page-status')?.getAttribute('aria-live') === 'polite' }; })()`,
  },
]);

const configuredCdpPort = Number.parseInt(process.env.CDP_PORT ?? '', 10);
const harness = await startBrowserHarness({
  root,
  ...(Number.isInteger(configuredCdpPort) && configuredCdpPort > 0 ? { cdpPort: configuredCdpPort } : {}),
});
try {
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
        undersizedTouchTargets: [...document.querySelectorAll('.uc, .diagram-tab, .service-card__button, .launchpad-mobile-map__item')]
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
      for (const [name, passed] of Object.entries(interaction)) assert.equal(passed, true, `${surface.name}/${viewport.name}: ${name}`);
    }
  }
  assert.deepEqual(harness.exceptions, [], 'Runtime.exceptionThrown');
  assert.deepEqual(harness.localNetworkFailures, [], 'Network.loadingFailed');
  console.log('Cross-surface smoke passed: 4 surfaces × 2 viewport widths.');
} finally {
  await harness.close();
}
