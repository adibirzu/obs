import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('Launchpad service cards expose native inspector triggers and modal semantics', async () => {
  const [html, script] = await Promise.all([
    read('launchpad.html'),
    read('static/observability.js'),
  ]);

  assert.equal((html.match(/<article class="service-card /g) ?? []).length, 6);
  assert.equal((html.match(/class="service-card__inspect"/g) ?? []).length, 6);
  assert.match(html, /id="serviceInspector"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="inspectorTitle"/);
  assert.match(script, /trapInspectorFocus/);
  assert.match(script, /event\.key === 'Escape'/);
  assert.match(script, /previousFocus\.focus\(\)/);
  assert.match(script, /closeBtn\.focus\(\)/);
});

test('Launchpad clipboard helper reports blocked APIs and failed fallbacks accessibly', async () => {
  const [html, script] = await Promise.all([
    read('launchpad.html'),
    read('static/observability.js'),
  ]);

  assert.match(html, /id="clipboardStatus"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(script, /async function copyTextWithFallback/);
  assert.match(script, /navigator\.clipboard\?\.writeText/);
  assert.match(script, /document\.execCommand\('copy'\)/);
  assert.match(script, /Copy failed\. Select the visible code and copy it manually\./);
  assert.match(script, /setAttribute\('role', error \? 'alert'/);
});

test('Interlocks panel label follows the active diagram tab', async () => {
  const [html, script] = await Promise.all([
    read('interlocks.html'),
    read('assets/interlocks/interlocks.js'),
  ]);

  assert.match(html, /id="architecture-board"[^>]*aria-labelledby="diagram-title"/);
  assert.match(script, /function syncArchitectureBoardLabel/);
  assert.match(script, /`diagram-tab-\$\{diagramId\}`/);
});

test('Launchpad visual data controls expose names, roles, and keyboard activation', async () => {
  const [html, script, styles] = await Promise.all([
    read('launchpad.html'),
    read('static/observability.js'),
    read('static/observability.css'),
  ]);

  assert.equal((html.match(/class="node-content" role="button" tabindex="0" aria-label="Open /g) ?? []).length, 6);
  assert.equal((html.match(/<button type="button" class="cluster-bubble /g) ?? []).length, 6);
  assert.match(html, /<button type="button" class="job-cell status-error"[^>]*id="stuckJob"[^>]*aria-label="Show details for stuck BIP Report job"/);
  assert.match(html, /<a href="#regionDetail" id="brazilMarker"[^>]*aria-label="Show Brazil performance details"/);
  assert.match(script, /bindKeyboardActivation/);
  assert.match(script, /event\.key === 'Enter' \|\| event\.key === ' '/);
  assert.match(styles, /\.pillar-node \.node-content:focus-visible/);
  assert.match(styles, /\.cluster-bubble:focus-visible/);
  assert.match(styles, /\.session-marker-link:focus-visible/);
  assert.match(styles, /\.job-cell:focus-visible/);
});

test('Launchpad screenshots launch an accessible focus-managed lightbox', async () => {
  const [html, script] = await Promise.all([
    read('launchpad.html'),
    read('assets/launchpad-resources.js'),
  ]);

  assert.equal((html.match(/<button type="button" class="showcase-image" aria-label="Open /g) ?? []).length, 4);
  assert.match(script, /aria-labelledby/);
  assert.match(script, /aria-modal/);
  assert.match(script, /function trapFocus/);
  assert.match(script, /e\.key !== "Tab"/);
  assert.match(script, /e\.key === "Escape"/);
  assert.match(script, /returnFocus\.focus\(\)/);
  assert.match(script, /closeButton\.focus\(\)/);
});
