import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { startBrowserHarness } from './browser-harness.mjs';

const root = resolve(new URL('../../', import.meta.url).pathname);
const configuredCdpPort = Number.parseInt(process.env.COVERAGE_CDP_PORT ?? process.env.CDP_PORT ?? '', 10);
const harness = await startBrowserHarness({
  root,
  ...(Number.isInteger(configuredCdpPort) && configuredCdpPort > 0 ? { cdpPort: configuredCdpPort } : {}),
});
const policy = JSON.parse(await readFile(resolve(root, 'governance/quality-gates.json'), 'utf8'));
const clientPolicy = policy.coverage.client;
const requiredCoverageTargets = Object.freeze([
  'assets/guide.js',
  'assets/personas.js',
  'assets/state.js',
  'static/observability.js',
  'assets/interlocks/interlocks.js',
  'assets/interlocks/usecase-detail.js',
]);
for (const path of requiredCoverageTargets) assert.ok(clientPolicy.include.includes(path), `Coverage policy includes ${path}`);
const snapshots = [];

const settle = () => harness.evaluate(`new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);

async function exerciseAtlas() {
  await harness.navigate('index.html');
  await harness.waitFor(`document.querySelectorAll('#telemetry-route [data-source]').length === 6`);
  await harness.evaluate(`(async () => {
    const clickAll = selector => [...document.querySelectorAll(selector)].forEach(node => node.click());
    clickAll('#telemetry-route [data-source]');
    clickAll('#goalPick [data-goal]');
    clickAll('#rolePick [data-persona]');
    const industry = document.querySelector('#industryPick');
    for (const option of [...industry.options]) { industry.value = option.value; industry.dispatchEvent(new Event('change', { bubbles: true })); }
    for (const card of [...document.querySelectorAll('.uc[data-uc]')]) { card.click(); await new Promise(requestAnimationFrame); }
    document.querySelectorAll('.lens [role="tab"]').forEach(tab => tab.click());
    document.querySelector('.lens [role="tab"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    const search = document.querySelector('#scenario-search');
    for (const query of ['retail checkout eks latency', 'no matching scenario']) { search.value = query; search.dispatchEvent(new Event('input', { bubbles: true })); }
    search.value = 'retail'; search.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('#scenario-matches button')?.click();
    document.querySelector('#finderClear')?.click();
    for (const card of [...document.querySelectorAll('.card[data-id]')]) { card.click(); document.querySelector('#i-close')?.click(); }
    window.dispatchEvent(new Event('scroll'));
  })()`);
  await settle();
  snapshots.push(...await harness.takeCoverage());
}

async function exerciseLaunchpad() {
  await harness.navigate('launchpad.html');
  await harness.waitFor(`document.querySelectorAll('.nav-item[data-module]').length > 10`);
  await harness.evaluate(`(() => {
    const click = selector => document.querySelector(selector)?.click();
    document.querySelectorAll('.theme-option').forEach(node => node.click());
    document.querySelectorAll('[data-toggle-kind="tier"] .toggle-option').forEach(node => node.click());
    document.querySelectorAll('[data-toggle-kind="cloud-guard"] .toggle-option').forEach(node => node.click());
    document.querySelectorAll('#rolePick [data-persona]').forEach(node => node.click());
    document.querySelectorAll('#goalPick [data-goal]').forEach(node => node.click());
    click('[data-command-palette-trigger]');
    const command = document.querySelector('#commandPaletteInput');
    if (command) {
      for (const query of ['logs', 'unfindable']) { command.value = query; command.dispatchEvent(new Event('input', { bubbles: true })); }
      command.value = ''; command.dispatchEvent(new Event('input', { bubbles: true }));
      command.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      command.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    }
    click('#mobileNavToggle'); click('#mobileNavClose');
    window.dispatchEvent(new Event('resize'));
  })()`);
  for (const module of ['home', 'monitoring', 'ebs', 'fusion', 'integrations', 'loganalytics', 'apm', 'opsinsights', 'dbmgmt', 'ai']) {
    await harness.evaluate(`document.querySelector('.sidebar .nav-item[data-module="${module}"]').click()`);
    await harness.waitFor(`document.querySelector('.module.active')?.id === 'module-${module}'`);
    await harness.evaluate(`(() => {
      document.querySelectorAll('.module.active .use-case-tab, .module.active .view-btn, .module.active .suggestion-chip, .module.active .prompt-chip, .module.active .cluster-bubble, .module.active .waterfall-row, .module.active .session-marker, .module.active .sankey-node, .module.active .service-card').forEach(node => {
        node.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        node.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });
      document.querySelector('#inspectorClose')?.click();
    })()`);
    if (module === 'monitoring') {
      await harness.evaluate(`(() => {
        const fire = (node, type, init = {}) => node?.dispatchEvent(new Event(type, { bubbles: true, ...init }));
        for (const id of ['compartmentSearch', 'regionSearch', 'namespaceSearch']) {
          const input = document.getElementById(id); input?.focus(); if (input) input.value = 'oci'; fire(input, 'input');
        }
        document.querySelector('#compartmentDropdown .dropdown-item:not(.disabled)')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const region = document.getElementById('regionSearch'); if (region) region.value = 'eu-frankfurt-1'; document.getElementById('addRegionBtn')?.click();
        const namespace = document.querySelector('#namespaceDropdown [data-value="oci_computeagent"]'); namespace?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const metric = document.getElementById('metricNameSearch'); metric?.focus(); if (metric) metric.value = 'Cpu'; fire(metric, 'input');
        document.querySelector('#metricNameDropdown [data-value="CpuUtilization"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        document.getElementById('addQuery')?.click();
        document.querySelector('.remove-query')?.click();
        document.querySelectorAll('.tag-remove').forEach(node => node.click());
      })()`);
    }
    if (module === 'ai') {
      await harness.evaluate(`(() => {
        const input = document.querySelector('.module.active .chat-input');
        const send = document.querySelector('.module.active .chat-send');
        for (const query of ['error trend', 'cpu performance', 'similar incident', 'report', 'Logan logs', 'database SQL', 'memory OOM', 'latency timeout', 'alarm alert', 'cost budget', 'security threat', 'general question']) {
          input.value = query; send.click();
        }
        input.value = 'keypress path'; input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', bubbles: true }));
      })()`);
      await harness.evaluate(`new Promise(resolve => setTimeout(resolve, 1700))`);
    }
  }
  await settle();
  snapshots.push(...await harness.takeCoverage());
}

async function exerciseInterlocks() {
  await harness.navigate('interlocks.html');
  await harness.waitFor(`document.querySelectorAll('#diagram-tabs [role="tab"]').length === 6`);
  await harness.evaluate(`(async () => {
    const tabs = [...document.querySelectorAll('#diagram-tabs [role="tab"]')];
    tabs.forEach(tab => tab.click());
    tabs[0]?.focus();
    for (const key of ['ArrowRight', 'ArrowLeft', 'End', 'Home']) tabs[0]?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    const search = document.querySelector('#service-search');
    for (const query of ['Log Analytics', 'no-result', '']) { search.value = query; search.dispatchEvent(new Event('input', { bubbles: true })); }
    for (const selector of ['#domain-filter', '#category-filter']) {
      const select = document.querySelector(selector);
      for (const option of [...select.options]) { select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    document.querySelector('#clear-filters')?.click();
    for (const card of [...document.querySelectorAll('.service-card__button')].slice(0, 8)) { card.click(); document.querySelector('#dialog-close')?.click(); }
  })()`);
  await settle();
  snapshots.push(...await harness.takeCoverage());

  for (const usecase of ['flow-logs', 'iam-events', 'checkout-latency']) {
    await harness.navigate(`interlock-detail.html?diagram=network&usecase=${usecase}`);
    await harness.waitFor(`Boolean(document.querySelector('#detail-title')?.textContent)`);
    await harness.evaluate(`[...document.querySelectorAll('button')].find(button => button.textContent.includes('Copy direct link'))?.click()`);
    await settle();
    snapshots.push(...await harness.takeCoverage());
  }
}

function sourceLineRanges(source) {
  const ranges = [];
  let start = 0;
  let blockComment = false;
  let number = 0;
  for (const line of source.split(/(?<=\n)/)) {
    number += 1;
    let code = '';
    for (let index = 0; index < line.length; index += 1) {
      if (blockComment && line.slice(index, index + 2) === '*/') { blockComment = false; index += 1; continue; }
      if (blockComment) continue;
      if (line.slice(index, index + 2) === '/*') { blockComment = true; index += 1; continue; }
      if (line.slice(index, index + 2) === '//') break;
      code += line[index];
    }
    ranges.push({ number, start, end: start + line.length, isCode: /[A-Za-z0-9_$'"`]|=>|[+*=<>!?-]/.test(code) });
    start += line.length;
  }
  return ranges;
}

async function calculateFile(path) {
  const source = await readFile(resolve(root, path), 'utf8');
  const mergedExecutable = new Uint8Array(source.length);
  const mergedCovered = new Uint8Array(source.length);
  const matching = snapshots.filter(script => {
    try { return decodeURIComponent(new URL(script.url).pathname).replace(/^\//, '') === path; } catch { return false; }
  });
  assert.ok(matching.length > 0, `${path} was loaded by the browser coverage journeys`);

  for (const script of matching) {
    const local = new Int8Array(source.length).fill(-1);
    const ranges = script.functions.flatMap(fn => fn.ranges).sort((left, right) =>
      (right.endOffset - right.startOffset) - (left.endOffset - left.startOffset));
    for (const range of ranges) {
      const end = Math.min(range.endOffset, source.length);
      local.fill(range.count > 0 ? 1 : 0, Math.min(range.startOffset, end), end);
    }
    for (let index = 0; index < local.length; index += 1) {
      if (local[index] >= 0) mergedExecutable[index] = 1;
      if (local[index] > 0) mergedCovered[index] = 1;
    }
  }

  const lines = sourceLineRanges(source).filter(line => line.isCode && mergedExecutable.subarray(line.start, line.end).some(Boolean));
  const coveredLines = lines.filter(line => mergedCovered.subarray(line.start, line.end).some(Boolean));
  const covered = coveredLines.length;
  const coveredNumbers = new Set(coveredLines.map(line => line.number));
  return { path, covered, total: lines.length, percent: lines.length ? (covered / lines.length) * 100 : 100, uncovered: lines.filter(line => !coveredNumbers.has(line.number)).map(line => line.number) };
}

try {
  await harness.setViewport({ width: 1440, height: 1000 });
  await harness.startCoverage();
  console.log('Browser coverage: exercising Atlas');
  await exerciseAtlas();
  console.log('Browser coverage: exercising Launchpad');
  await exerciseLaunchpad();
  console.log('Browser coverage: exercising Interlocks');
  await exerciseInterlocks();
  snapshots.push(...await harness.stopCoverage());

  const results = await Promise.all(clientPolicy.include.map(calculateFile));
  const totals = results.reduce((sum, result) => ({ covered: sum.covered + result.covered, total: sum.total + result.total }), { covered: 0, total: 0 });
  const aggregate = totals.total ? (totals.covered / totals.total) * 100 : 100;
  console.log('\nBrowser client line coverage');
  for (const result of results) console.log(`${result.percent.toFixed(2).padStart(7)}%  ${String(result.covered).padStart(4)}/${String(result.total).padEnd(4)}  ${result.path}`);
  console.log(`${aggregate.toFixed(2).padStart(7)}%  ${totals.covered}/${totals.total}  all configured client scripts`);
  if (aggregate < clientPolicy.lines) {
    const launchpadResult = results.find(result => result.path === 'static/observability.js');
    console.log(`Launchpad uncovered lines: ${launchpadResult?.uncovered.join(',')}`);
  }
  assert.ok(aggregate >= clientPolicy.lines, `Browser line coverage ${aggregate.toFixed(2)}% is below ${clientPolicy.lines}%`);
  assert.deepEqual(harness.exceptions, [], 'Runtime.exceptionThrown');
  assert.deepEqual(harness.localNetworkFailures, [], 'Network.loadingFailed');
} finally {
  await harness.close();
}
