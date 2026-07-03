import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const [html, css, guide, personas] = await Promise.all([
  readFile(new URL('index.html', root), 'utf8'),
  readFile(new URL('assets/guide.css', root), 'utf8'),
  readFile(new URL('assets/guide.js', root), 'utf8'),
  readFile(new URL('assets/personas.js', root), 'utf8'),
]);

test('hero begins with an interactive peer-status telemetry route', () => {
  assert.match(html, /id="telemetry-route"/);
  assert.match(html, /aria-label="Choose an environment to trace"/);
  for (const source of ['oci', 'aws', 'azure', 'gcp', 'kubernetes', 'onprem']) {
    assert.match(html, new RegExp(`data-source="${source}"`));
  }
  assert.match(html, /id="telemetry-route-detail"[^>]*aria-live="polite"/);
  assert.match(guide, /function buildTelemetryRoute\(/);
  assert.match(guide, /vendor-neutral telemetry contract/i);
  assert.doesNotMatch(html, /class="hero__meta"/);
  assert.doesNotMatch(html, /class="hero__panel/);
});

test('interlock workflows are a primary destination from the hero, onboarding, and mobile map', () => {
  assert.match(html, /class="telemetry-route__primary" href="interlocks\.html">Open interlock workflows/);
  assert.match(html, /class="[^"]*mobile-contents__link[^"]*" href="interlocks\.html">Interlocks/);
  assert.match(personas, /Explore interlock workflows/);
});

test('homepage presents L0 through L4 as the canonical path and scale as an extension', () => {
  assert.match(html, /L0 to L4 maturity path/);
  assert.match(html, /id="scale-pattern"/);
  assert.match(html, /Operator-scale architecture extension/);
  assert.doesNotMatch(html, /data-lv="L5"/);
  assert.doesNotMatch(html, /<b>L5<\/b>/);
  assert.match(personas, /Scale pattern · operator architecture/);
});

test('project documentation exposes the canonical model and remaining PRD register', async () => {
  const [readme, roadmap] = await Promise.all([
    readFile(new URL('README.md', root), 'utf8'),
    readFile(new URL('docs/PRODUCT-ROADMAP.md', root), 'utf8'),
  ]);
  assert.match(readme, /L0 to L4/);
  assert.match(readme, /operator-scale architecture extension/);
  assert.match(readme, /docs\/PRODUCT-ROADMAP\.md/);
  assert.doesNotMatch(readme, /path from L0 to L5/i);
  assert.match(roadmap, /PRD-05.*Launchpad alignment/i);
  assert.match(roadmap, /Remaining tasks/i);
  assert.match(roadmap, /No open GitHub issues/i);
});

test('Launchpad mirrors L0 to L4 and labels operator scale as an extension', async () => {
  const [launchpad, launchpadCss] = await Promise.all([
    readFile(new URL('launchpad.html', root), 'utf8'),
    readFile(new URL('static/observability.css', root), 'utf8'),
  ]);
  assert.match(launchpad, /aria-label="L0 to L4 maturity path and operator-scale extension"/);
  assert.match(launchpad, /class="lp-step lp-step--scale"/);
  assert.match(launchpad, /data-href="index\.html#scale-pattern"/);
  assert.match(launchpad, />Scale pattern<\/span>/);
  assert.doesNotMatch(launchpad, />L5<\/span>/);
  assert.doesNotMatch(launchpadCss, /--l5:/);
  assert.match(launchpadCss, /--scale:/);
});

test('Launchpad exposes a sticky mobile structural map with scroll state', async () => {
  const [launchpad, launchpadCss, launchpadJs] = await Promise.all([
    readFile(new URL('launchpad.html', root), 'utf8'),
    readFile(new URL('static/observability.css', root), 'utf8'),
    readFile(new URL('static/observability.js', root), 'utf8'),
  ]);
  assert.match(launchpad, /class="launchpad-mobile-map"[^>]*aria-label="Launchpad sections"/);
  for (const section of ['lp-start', 'lp-path-sec', 'lp-personas', 'lp-security']) {
    assert.match(launchpad, new RegExp(`data-launchpad-section="${section}"`));
  }
  assert.match(launchpadCss, /@media \(max-width: 1079px\)[\s\S]*\.launchpad-mobile-map\s*\{[^}]*position:\s*sticky/s);
  assert.match(launchpadCss, /\.launchpad-mobile-map__item\s*\{[^}]*min-height:\s*48px/s);
  assert.match(launchpadJs, /function initLaunchpadMobileMap\(/);
  assert.match(launchpadJs, /IntersectionObserver/);
  assert.match(launchpadJs, /aria-current/);
});

test('Launchpad state contract restores URL values and falls back to session storage', async () => {
  const stateSource = await readFile(new URL('assets/state.js', root), 'utf8');
  const writes = [];
  const session = new Map([['obs-state-v1', JSON.stringify({ persona: 'build', industry: 'retail', lens: '1' })]]);
  const context = {
    URL,
    JSON,
    window: {
      location: { href: 'https://example.test/launchpad.html?module=apm&scale-pattern=operator' },
      history: { replaceState: (_state, _title, url) => writes.push(String(url)) },
      sessionStorage: {
        getItem: (key) => session.get(key) ?? null,
        setItem: (key, value) => session.set(key, value),
      },
    },
  };
  vm.runInNewContext(stateSource, context);
  const initial = context.window.OBS_STATE.read();
  assert.equal(initial.module, 'apm');
  assert.equal(initial.persona, 'build');
  assert.equal(initial.industry, 'retail');
  assert.equal(initial.lens, '1');
  assert.equal(initial['scale-pattern'], 'operator');

  const next = context.window.OBS_STATE.replace({ module: 'loganalytics', persona: 'operate', lens: '2' });
  assert.equal(next.module, 'loganalytics');
  assert.match(writes.at(-1), /module=loganalytics/);
  assert.match(writes.at(-1), /persona=operate/);
  assert.equal(JSON.parse(session.get('obs-state-v1')).lens, '2');
});

test('Launchpad integrates stateful personalization and keyboard option clusters', async () => {
  const launchpad = await readFile(new URL('launchpad.html', root), 'utf8');
  assert.match(launchpad, /<script src="assets\/state\.js" defer><\/script>/);
  assert.match(launchpad, /id="rolePick"/);
  assert.match(launchpad, /<select id="industryPick"/);
  assert.match(personas, /function bindOptionCluster\(/);
  assert.match(personas, /ArrowRight/);
  assert.match(personas, /ArrowLeft/);
  assert.match(personas, /Home/);
  assert.match(personas, /End/);
});

test('Launchpad functional text, targets, lens tabs, and reduced motion meet PRD-05', async () => {
  const [launchpadCss, launchpadJs] = await Promise.all([
    readFile(new URL('static/observability.css', root), 'utf8'),
    readFile(new URL('static/observability.js', root), 'utf8'),
  ]);
  assert.doesNotMatch(launchpadCss, /font-size:\s*(?:10|11)px/);
  assert.match(launchpadCss, /button,\s*input,\s*select\s*\{[^}]*min-height:\s*48px/s);
  assert.match(launchpadCss, /\.launchpad-mobile-map__item[^}]*color:\s*var\(--text-tertiary\)/s);
  assert.match(launchpadCss, /prefers-reduced-motion:\s*reduce[\s\S]*transition-duration:\s*0s\s*!important/s);
  assert.match(launchpadJs, /function activateInspectorTab\(/);
  assert.match(launchpadJs, /ArrowRight/);
  assert.match(launchpadJs, /window\.OBS_STATE\?\.replace\?\.\(\{ lens:/);
});

test('Launchpad implementation tabs and mobile drawer expose complete keyboard contracts', async () => {
  const [launchpad, launchpadJs] = await Promise.all([
    readFile(new URL('launchpad.html', root), 'utf8'),
    readFile(new URL('static/observability.js', root), 'utf8'),
  ]);
  for (const [tab, panel] of [
    ['phase-tab-1', 'phase-panel-1'],
    ['phase-tab-4', 'phase-panel-4'],
    ['audience-tab-level1', 'phase1-level1-panel'],
    ['audience-tab-level3', 'phase1-level3-panel'],
  ]) {
    assert.match(launchpad, new RegExp(`id="${tab}"[^>]*aria-controls="${panel}"`));
    assert.match(launchpad, new RegExp(`id="${panel}"[^>]*role="tabpanel"[^>]*aria-labelledby="${tab}"`));
  }
  assert.match(launchpad, /id="phase-tab-1"[^>]*tabindex="0"/);
  assert.match(launchpad, /id="phase-tab-2"[^>]*tabindex="-1"/);
  assert.match(launchpad, /id="mobileDrawer"[^>]*role="dialog"[^>]*aria-modal="true"/);
  assert.match(launchpadJs, /function bindRovingTablist\(/);
  assert.match(launchpadJs, /function trapMobileNavFocus\(/);
  assert.match(launchpadJs, /mobileNavReturnFocus/);
  assert.match(launchpadJs, /mobileNavBackgroundState/);
  assert.match(launchpadJs, /function hideMobileNavBackground\(/);
  assert.match(launchpadJs, /function restoreMobileNavBackground\(/);
  assert.match(launchpadJs, /element\.inert = true/);
  assert.match(launchpadJs, /setAttribute\('aria-hidden', 'true'\)/);
  for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) assert.match(launchpadJs, new RegExp(key));
});

test('advanced acronyms are defined inline at first meaningful use', () => {
  const definitions = {
    IAM: 'Identity and Access Management',
    'O&amp;M': 'Observability and Management',
    OKE: 'Oracle Kubernetes Engine',
    RAG: 'retrieval-augmented generation',
    SLO: 'service-level objective',
    MQL: 'Monitoring Query Language',
    LLM: 'large language model',
  };
  for (const [label, title] of Object.entries(definitions)) {
    assert.match(html, new RegExp(`<abbr[^>]+title="[^"]*${title}[^"]*"[^>]*>${label}<\\/abbr>`, 'i'));
  }
});

test('personalization starts with four operating goals and hides optional refinements', () => {
  const goals = personas.match(/const GOALS = \[([\s\S]*?)\n  \];/)?.[1] ?? '';
  assert.equal((goals.match(/id: "/g) ?? []).length, 4);
  for (const role of ['own', 'build', 'operate', 'govern']) {
    assert.match(personas, new RegExp(`id: "${role}"`));
  }
  assert.match(html, /id="goalPick"/);
  assert.match(html, /<details class="[^"]*start__refine[^"]*"/);
  assert.match(html, /id="rolePick"/);
  assert.match(html, /id="industryPick"/);
  assert.match(personas, /recommended: true/);
  assert.match(personas, /Operational consequence/i);
});

test('mobile contents control exposes the structural map and scroll state hooks', () => {
  assert.match(html, /class="mobile-contents"[^>]*aria-label="Page contents"/);
  for (const href of ['#start', '#finder', '#ladder', 'launchpad.html']) {
    assert.match(html, new RegExp(`class="[^"]*mobile-contents__link[^"]*"[^>]+href="${href.replace('#', '\\#')}"`));
  }
  assert.match(css, /@media \(max-width: 1080px\)[\s\S]*\.mobile-contents/);
  assert.match(guide, /data-section/);
  assert.match(guide, /aria-current/);
});

test('finder result is focusable, announced, mobile-adjacent, and renders an ordered route', () => {
  assert.match(html, /id="finderResult"[^>]*tabindex="-1"[^>]*aria-labelledby="fr-name"/);
  assert.match(html, /<ol class="path" id="fr-path"><\/ol>/);
  assert.match(guide, /activeCard\.after\(res\)/);
  assert.match(guide, /res\.focus\(/);
  assert.match(guide, /finder-status/);
  assert.match(css, /\.finder__result\s*\{[^}]*scroll-margin-top:/s);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.path\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /counter\(route-step\)/);
});

test('interactive mobile targets meet the 48px minimum', () => {
  for (const selector of ['mobile-contents__link', 'pickchip', 'uc', 'pathchip']) {
    assert.match(css, new RegExp(`\\.${selector}[^\\{]*\\{[^}]*min-height:\\s*48px`, 's'));
  }
});

test('selection state persists through a shared URL state model', async () => {
  const stateSource = await readFile(new URL('assets/state.js', root), 'utf8');
  const calls = [];
  const context = {
    URL,
    URLSearchParams,
    window: {
      location: { href: 'https://example.test/index.html?source=aws&persona=operate&pattern=hybrid&lens=2' },
      history: { replaceState: (_state, _title, url) => calls.push(String(url)) },
    },
  };
  vm.runInNewContext(stateSource, context);
  const initial = context.window.OBS_STATE.read();
  assert.equal(initial.source, 'aws');
  assert.equal(initial.persona, 'operate');
  assert.equal(initial.pattern, 'hybrid');
  assert.equal(initial.lens, '2');

  const next = context.window.OBS_STATE.replace({ industry: 'retail', goal: 'protect', level: 'L2' });
  assert.equal(next.industry, 'retail');
  assert.equal(next.goal, 'protect');
  assert.equal(next.level, 'L2');
  assert.match(calls.at(-1), /industry=retail/);
  assert.match(calls.at(-1), /goal=protect/);
  assert.match(calls.at(-1), /level=L2/);
  assert.ok(Object.isFrozen(next));
});

test('tabs implement WAI-ARIA relationships and keyboard behavior', () => {
  for (const [tab, panel] of [['exec', 'i-exec-panel'], ['arch', 'i-arch-panel'], ['prac', 'i-prac-panel']]) {
    assert.match(html, new RegExp(`id="i-${tab}-tab"[^>]*aria-controls="${panel}"`));
    assert.match(html, new RegExp(`id="${panel}"[^>]*aria-labelledby="i-${tab}-tab"`));
  }
  assert.match(guide, /ArrowLeft/);
  assert.match(guide, /ArrowRight/);
  assert.match(guide, /Home/);
  assert.match(guide, /End/);
});

test('clipboard copy reports success and failure through an accessible toast', () => {
  assert.match(html, /id="toast"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(guide, /function showToast\(/);
  assert.match(guide, /Copy failed/);
  assert.match(guide, /\.catch\(/);
});

test('functional metadata uses readable text tokens and sequence text is at least 12px', () => {
  for (const selector of ['uc__k', 'path-label', 'card__more', 'pcard__lens', 'i-personas__k']) {
    const rule = css.match(new RegExp(`\\.${selector}[^\\{]*\\{([^}]*)\\}`, 's'))?.[1] ?? '';
    assert.match(rule, /(?:--stone-600|--text-muted)/, selector);
    assert.doesNotMatch(rule, /--text-subtle|--text-2xs/, selector);
  }
});

test('reveal animation remains progressive enhancement with reduced-motion support', () => {
  assert.match(css, /\.js \.reveal\s*\{/);
  assert.doesNotMatch(css, /(?:^|\})\s*\.reveal\s*\{[^}]*opacity:\s*0/s);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*\.js \.reveal\s*\{[^}]*opacity:\s*1/s);
});

test('homepage prose uses em dashes only when necessary', () => {
  assert.ok((html.match(/—/g) ?? []).length <= 5, 'index.html should contain no more than five em dashes');
});
