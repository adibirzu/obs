import assert from 'node:assert/strict';
import { resolve } from 'node:path';

import { startBrowserHarness } from './browser-harness.mjs';

const root = resolve(new URL('../../', import.meta.url).pathname);

export async function runLaunchpadE2E(harness) {
  await harness.setViewport({ width: 390, height: 844 });
  console.log('Launchpad E2E: loading persisted mobile state');
  await harness.navigate('launchpad.html?module=apm&persona=operate&industry=retail&lens=2&scale-pattern=operator');
  await harness.waitFor(`document.querySelectorAll('#rolePick [data-persona]').length === 4`);

  const restored = await harness.evaluate(`(() => ({
    module: document.querySelector('.module.active')?.id,
    moduleParam: new URLSearchParams(location.search).get('module'),
    persona: document.querySelector('#rolePick [aria-pressed="true"]')?.dataset.persona,
    industry: document.querySelector('#industryPick')?.value,
    scale: document.querySelector('[data-scale-pattern]')?.getAttribute('aria-pressed'),
    mapDisplay: getComputedStyle(document.querySelector('.launchpad-mobile-map')).display,
    mapPosition: getComputedStyle(document.querySelector('.launchpad-mobile-map')).position,
    mapTargets: [...document.querySelectorAll('.launchpad-mobile-map__item')].every(item => item.getBoundingClientRect().height >= 48),
    noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    viewport: { inner: innerWidth, client: document.documentElement.clientWidth, header: (() => { const r = document.querySelector('.mobile-header').getBoundingClientRect(); return { left: r.left, width: r.width, right: r.right }; })() }
  }))()`);
  const { viewport, ...restoredState } = restored;
  assert.deepEqual(restoredState, {
    module: 'module-apm', moduleParam: 'apm', persona: 'operate', industry: 'retail', scale: 'true',
    mapDisplay: 'grid', mapPosition: 'sticky', mapTargets: true, noOverflow: true,
  });
  assert.equal(viewport.inner, 390);
  assert.ok(viewport.client > 0 && viewport.client <= viewport.inner);
  assert.deepEqual(viewport.header, {
    left: 0,
    width: viewport.client,
    right: viewport.client,
  });

  console.log('Launchpad E2E: exercising keyboard controls');
  await harness.evaluate(`document.querySelector('[data-launchpad-section="lp-start"]').click()`);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-home'`);
  await harness.evaluate(`document.querySelector('#rolePick [data-persona="own"]').focus()`);
  assert.equal(await harness.evaluate(`document.activeElement.dataset.persona`), 'own');
  await harness.press('ArrowRight', 'ArrowRight', 39);
  assert.equal(await harness.evaluate(`document.activeElement.dataset.persona`), 'build');
  await harness.press(' ', 'Space', 32);
  await harness.waitFor(`new URLSearchParams(location.search).get('persona') === 'build'`);
  await harness.press('Tab', 'Tab', 9);
  assert.notEqual(await harness.evaluate(`document.activeElement.dataset.persona || ''`), 'build');

  await harness.evaluate(`document.querySelector('#mobileNavToggle').click()`);
  await harness.waitFor(`document.querySelector('#mobileDrawer').getAttribute('aria-hidden') === 'false' && getComputedStyle(document.querySelector('.mobile-drawer .nav-item[data-module="loganalytics"]')).visibility === 'visible'`);
  await harness.waitFor(`document.activeElement?.id === 'mobileNavClose'`);
  assert.equal(await harness.evaluate(`document.activeElement?.id`), 'mobileNavClose');
  assert.deepEqual(await harness.evaluate(`({
    mainInert: document.querySelector('.main-content').inert,
    mainHidden: document.querySelector('.main-content').getAttribute('aria-hidden'),
    headerInert: document.querySelector('.mobile-header').inert,
    headerHidden: document.querySelector('.mobile-header').getAttribute('aria-hidden'),
    sidebarInert: document.querySelector('.sidebar').inert,
    mapInert: document.querySelector('.launchpad-mobile-map').inert
  })`), { mainInert: true, mainHidden: 'true', headerInert: true, headerHidden: 'true', sidebarInert: true, mapInert: true });
  await harness.evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))`);
  assert.equal(await harness.evaluate(`document.activeElement === [...document.querySelectorAll('#mobileDrawer a[href], #mobileDrawer button:not([disabled]), #mobileDrawer input:not([disabled]), #mobileDrawer select:not([disabled]), #mobileDrawer [tabindex]:not([tabindex="-1"])')].filter(node => node.offsetParent !== null).at(-1)`), true);
  await harness.press('Tab', 'Tab', 9);
  assert.equal(await harness.evaluate(`document.activeElement?.id`), 'mobileNavClose');
  await harness.evaluate(`document.querySelector('#mobileNavClose').click()`);
  assert.equal(await harness.evaluate(`document.activeElement?.id`), 'mobileNavToggle');
  assert.deepEqual(await harness.evaluate(`({
    mainInert: document.querySelector('.main-content').inert,
    mainHidden: document.querySelector('.main-content').getAttribute('aria-hidden'),
    headerInert: document.querySelector('.mobile-header').inert,
    headerHidden: document.querySelector('.mobile-header').getAttribute('aria-hidden')
  })`), { mainInert: false, mainHidden: null, headerInert: false, headerHidden: null });

  await harness.evaluate(`document.querySelector('#mobileNavToggle').click()`);
  await harness.waitFor(`document.activeElement?.id === 'mobileNavClose'`);
  for (let index = 0; index < 6; index += 1) await harness.press('Tab', 'Tab', 9);
  assert.equal(await harness.evaluate(`document.activeElement.dataset.module`), 'loganalytics');
  await harness.press('Enter', 'Enter', 13);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-loganalytics'`);
  assert.equal(await harness.evaluate(`new URLSearchParams(location.search).get('module')`), 'loganalytics');
  assert.equal(await harness.evaluate(`document.activeElement?.id`), 'mobileNavToggle');
  assert.equal(await harness.evaluate(`document.querySelector('.main-content').inert`), false);

  console.log('Launchpad E2E: reloading persisted state');
  await harness.reload();
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-loganalytics'`);
  const afterReload = await harness.evaluate(`({
    module: document.querySelector('.module.active')?.id,
    persona: document.querySelector('#rolePick [aria-pressed="true"]')?.dataset.persona,
    industry: document.querySelector('#industryPick')?.value,
    scale: document.querySelector('[data-scale-pattern]')?.getAttribute('aria-pressed'),
    lens: new URLSearchParams(location.search).get('lens')
  })`);
  assert.deepEqual(afterReload, { module: 'module-loganalytics', persona: 'build', industry: 'retail', scale: 'true', lens: '1' });

  console.log('Launchpad E2E: neutralizing hostile query-builder input');
  await harness.evaluate(`document.querySelector('.sidebar .nav-item[data-module="monitoring"]').click()`);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-monitoring'`);
  const hostileInput = '<img src=x onerror="window.__queryBuilderXss=true">';
  await harness.evaluate(`(() => {
    window.__queryBuilderXss = false;
    const payload = ${JSON.stringify(hostileInput)};
    const region = document.getElementById('regionSearch');
    region.value = payload;
    document.getElementById('addRegionBtn').click();
    const namespace = document.getElementById('namespaceSearch');
    namespace.value = payload;
    namespace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const metric = document.getElementById('metricNameSearch');
    metric.value = payload;
    document.getElementById('runQuery1').click();
  })()`);
  assert.deepEqual(await harness.evaluate(`({
    executed: window.__queryBuilderXss,
    regionText: document.querySelector('#selectedRegions .tag')?.childNodes[0]?.textContent.trim(),
    regionImageCount: document.querySelectorAll('#selectedRegions img').length,
    resultContainsPayload: document.getElementById('queryResults')?.textContent.includes(${JSON.stringify(hostileInput)}),
    resultImageCount: document.querySelectorAll('#queryResults img').length
  })`), {
    executed: false, regionText: hostileInput, regionImageCount: 0, resultContainsPayload: true, resultImageCount: 0,
  });
  await harness.evaluate(`document.querySelector('.sidebar .nav-item[data-module="home"]').click()`);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-home'`);

  console.log('Launchpad E2E: exercising inspector lens tabs');
  await harness.evaluate(`document.querySelector('.service-card.logs .service-card__inspect')?.focus()`);
  await harness.press('Enter', 'Enter', 13);
  await harness.waitFor(`document.querySelector('#serviceInspector')?.classList.contains('is-open')`);
  assert.deepEqual(await harness.evaluate(`({
    role: document.querySelector('#serviceInspector')?.getAttribute('role'),
    modal: document.querySelector('#serviceInspector')?.getAttribute('aria-modal'),
    labelledBy: document.querySelector('#serviceInspector')?.getAttribute('aria-labelledby'),
    active: document.activeElement?.id
  })`), { role: 'dialog', modal: 'true', labelledBy: 'inspectorTitle', active: 'closeInspector' });
  await harness.evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))`);
  assert.equal(await harness.evaluate(`document.activeElement?.id`), 'inspector-tab-level3');
  assert.equal(await harness.evaluate(`document.querySelector('.inspector-tab-btn[aria-selected="true"]')?.dataset.tab`), 'level2');
  await harness.evaluate(`document.querySelector('.inspector-tab-btn[aria-selected="true"]').focus()`);
  await harness.press('ArrowLeft', 'ArrowLeft', 37);
  assert.equal(await harness.evaluate(`document.querySelector('.inspector-tab-btn[aria-selected="true"]')?.dataset.tab`), 'level1');
  assert.equal(await harness.evaluate(`new URLSearchParams(location.search).get('lens')`), '0');
  await harness.evaluate(`(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = () => false;
    document.querySelector('#inspector-tab-level3').click();
    document.querySelector('#inspector-panel-level3 .copy-code-btn').click();
  })()`);
  await harness.waitFor(`document.querySelector('#clipboardStatus')?.getAttribute('role') === 'alert'`);
  assert.match(await harness.evaluate(`document.querySelector('#clipboardStatus')?.textContent || ''`), /Copy failed/);
  await harness.press('Escape', 'Escape', 27);
  assert.equal(await harness.evaluate(`document.activeElement?.classList.contains('service-card__inspect')`), true);

  console.log('Launchpad E2E: opening details from service and future-capability tiles');
  await harness.evaluate(`document.querySelector('.service-card.logs .feature-tag')?.click()`);
  await harness.waitFor(`document.querySelector('#serviceInspector')?.classList.contains('is-open')`);
  assert.match(await harness.evaluate(`document.querySelector('#inspectorTitle')?.textContent || ''`), /Logging & Log Analytics/);
  await harness.press('Escape', 'Escape', 27);
  await harness.evaluate(`document.querySelector('.future-capability[data-future-id="ai-investigation"]')?.focus()`);
  await harness.press('Enter', 'Enter', 13);
  await harness.waitFor(`document.querySelector('#serviceInspector')?.classList.contains('is-open')`);
  assert.deepEqual(await harness.evaluate(`({
    title: document.querySelector('#inspectorTitle')?.textContent,
    eyebrow: document.querySelector('#inspectorEyebrow')?.textContent,
    notice: document.querySelector('.future-detail__notice')?.textContent
  })`), {
    title: 'AI-assisted investigation',
    eyebrow: 'Future capability direction · safe harbor',
    notice: 'Planning direction only. This is not public product documentation, a commitment, a release date, or evidence that the capability is available in a customer tenancy.'
  });
  await harness.press('Escape', 'Escape', 27);

  console.log('Launchpad E2E: exercising visual controls and screenshot lightbox');
  await harness.setViewport({ width: 1440, height: 1000 });
  await harness.evaluate(`document.querySelector('.pillar-node[data-pillar="monitoring"] .node-content').focus()`);
  await harness.press('Enter', 'Enter', 13);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-monitoring'`);
  await harness.evaluate(`document.querySelector('.sidebar .nav-item[data-module="loganalytics"]').click()`);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-loganalytics'`);
  await harness.evaluate(`document.querySelector('.cluster-bubble').focus()`);
  await harness.press(' ', 'Space', 32);
  assert.match(await harness.evaluate(`document.querySelector('.cluster-detail-panel h4')?.textContent || ''`), /CrashLoopBackOff \(847 records\)/);
  await harness.evaluate(`document.querySelector('.sidebar .nav-item[data-module="apm"]').click()`);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-apm'`);
  await harness.evaluate(`document.querySelector('#brazilMarker').focus()`);
  await harness.press('Enter', 'Enter', 13);
  assert.equal(await harness.evaluate(`document.querySelector('#regionDetail').classList.contains('highlight')`), true);
  await harness.evaluate(`document.querySelector('.sidebar .nav-item[data-module="fusion"]').click()`);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-fusion'`);
  await harness.evaluate(`document.querySelector('[data-usecase="stuck-job"]').click(); document.querySelector('#stuckJob').focus()`);
  await harness.press(' ', 'Space', 32);
  assert.match(await harness.evaluate(`document.querySelector('#jobDetailPanel')?.style.animation || ''`), /pulseHighlight/);

  await harness.evaluate(`document.querySelector('.sidebar .nav-item[data-module="home"]').click()`);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-home'`);
  await harness.evaluate(`document.querySelector('.showcase-image').focus()`);
  await harness.press('Enter', 'Enter', 13);
  await harness.waitFor(`document.querySelector('.octo-lb')?.classList.contains('open')`);
  assert.deepEqual(await harness.evaluate(`({
    role: document.querySelector('.octo-lb')?.getAttribute('role'),
    modal: document.querySelector('.octo-lb')?.getAttribute('aria-modal'),
    labelledBy: document.querySelector('.octo-lb')?.getAttribute('aria-labelledby'),
    active: document.activeElement?.className
  })`), { role: 'dialog', modal: 'true', labelledBy: 'octo-lightbox-caption', active: 'octo-lb__x' });
  await harness.evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))`);
  assert.equal(await harness.evaluate(`document.activeElement?.classList.contains('octo-lb__image')`), true);
  await harness.press('Tab', 'Tab', 9);
  assert.equal(await harness.evaluate(`document.activeElement?.classList.contains('octo-lb__x')`), true);
  await harness.press('Escape', 'Escape', 27);
  assert.equal(await harness.evaluate(`document.activeElement?.classList.contains('showcase-image')`), true);
  await harness.setViewport({ width: 390, height: 844 });

  console.log('Launchpad E2E: exercising implementation tab systems');
  await harness.evaluate(`document.querySelector('.sidebar .nav-item[data-module="home"]').click()`);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-home'`);
  await harness.evaluate(`document.querySelector('#phase-tab-1').focus()`);
  await harness.press('End', 'End', 35);
  assert.deepEqual(await harness.evaluate(`({
    active: document.activeElement?.id,
    selected: document.querySelector('.timeline-node[aria-selected="true"]')?.id,
    tabStops: document.querySelectorAll('.timeline-node[tabindex="0"]').length,
    panelVisible: !document.querySelector('#phase-panel-4').hidden,
    controlsValid: document.querySelector('#phase-tab-4').getAttribute('aria-controls') === 'phase-panel-4'
  })`), { active: 'phase-tab-4', selected: 'phase-tab-4', tabStops: 1, panelVisible: true, controlsValid: true });
  await harness.press('Home', 'Home', 36);
  assert.equal(await harness.evaluate(`document.activeElement?.id`), 'phase-tab-1');

  await harness.evaluate(`document.querySelector('#audience-tab-level1').focus()`);
  await harness.press('ArrowRight', 'ArrowRight', 39);
  assert.deepEqual(await harness.evaluate(`({
    active: document.activeElement?.id,
    selected: document.querySelector('.level-tab[aria-selected="true"]')?.id,
    tabStops: document.querySelectorAll('.level-tab[tabindex="0"]').length,
    controls: document.querySelector('#audience-tab-level2').getAttribute('aria-controls'),
    panelVisible: !document.querySelector('#phase1-level2-panel').hidden,
    otherPanelHidden: document.querySelector('#phase1-level1-panel').hidden
  })`), { active: 'audience-tab-level2', selected: 'audience-tab-level2', tabStops: 1, controls: 'phase1-level2-panel', panelVisible: true, otherPanelHidden: true });

  console.log('Launchpad E2E: exercising structural map and reduced motion');
  await harness.evaluate(`document.querySelector('[data-launchpad-section="lp-path-sec"]').click()`);
  await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-home'`);
  await harness.waitFor(`document.querySelector('[data-launchpad-section="lp-path-sec"]').getAttribute('aria-current') === 'location'`);
  assert.equal(await harness.evaluate(`document.querySelector('[data-launchpad-section="lp-path-sec"]').getAttribute('aria-current')`), 'location');

  await harness.setReducedMotion('reduce');
  const reduced = await harness.evaluate(`(() => {
    const control = document.querySelector('.lp-step__btn');
    const scaleLabel = document.querySelector('.lp-step--scale .lp-step__lv');
    const style = getComputedStyle(scaleLabel);
    return {
      transition: getComputedStyle(control).transitionDuration,
      animation: getComputedStyle(control).animationDuration,
      color: style.color,
      visible: style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0,
      fontSize: Number.parseFloat(style.fontSize)
    };
  })()`);
  assert.equal(reduced.transition, '0s');
  assert.ok(Number.parseFloat(reduced.animation) <= 0.00001);
  assert.notEqual(reduced.color, 'rgba(0, 0, 0, 0)');
  assert.equal(reduced.visible, true);
  assert.ok(reduced.fontSize >= 12);

  assert.deepEqual(harness.exceptions, []);
  assert.deepEqual(harness.localNetworkFailures, []);
  console.log('Launchpad E2E: keyboard, mobile, persistence, lens, color, and reduced motion passed.');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const configuredCdpPort = Number.parseInt(process.env.E2E_CDP_PORT ?? process.env.CDP_PORT ?? '', 10);
  const harness = await startBrowserHarness({
    root,
    ...(Number.isInteger(configuredCdpPort) && configuredCdpPort > 0 ? { cdpPort: configuredCdpPort } : {}),
  });
  try {
    await runLaunchpadE2E(harness);
  } finally {
    await harness.close();
  }
}
