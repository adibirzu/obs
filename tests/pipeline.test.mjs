import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const readJson = async path => JSON.parse(await read(path));

test('CI runs on pull requests and main commits with pinned least-privilege actions', async () => {
  const workflow = await read('.github/workflows/quality.yml');
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /push:\s*\n\s*branches:\s*\[main\]/);
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.match(workflow, /actions\/checkout@[a-f0-9]{40}/);
  assert.match(workflow, /actions\/setup-node@[a-f0-9]{40}/);
  assert.match(workflow, /gitleaks\/gitleaks-action@[a-f0-9]{40}/);
  assert.match(workflow, /npm run test:ci/);
  assert.match(workflow, /npm run test:coverage:node:ci/);
  assert.match(workflow, /npm run test:browser:ci/);
  assert.match(workflow, /npm run artifacts:check/);
});

test('clean-checkout governance runs before every artifact or release operation', async () => {
  const [workflow, packageJson, script] = await Promise.all([
    read('.github/workflows/quality.yml'),
    readJson('package.json'),
    read('scripts/check-clean-governance.mjs'),
  ]);
  const cleanGate = workflow.indexOf('npm run governance:validate-clean-checkout');
  const firstArtifact = workflow.indexOf('npm run artifacts:');
  assert.ok(cleanGate > 0 && firstArtifact > cleanGate, 'clean governance precedes artifact generation');
  assert.equal(packageJson.scripts['governance:validate-clean-checkout'], 'node scripts/check-clean-governance.mjs');
  assert.match(script, /dist/);
  assert.match(script, /releaseOnly\.generatedRoots/);
  assert.match(script, /validateGovernance/);
  assert.match(script, /git status/);
  assert.match(script, /filesystem drift/i);
});

test('test runner enforces at least 40 tests, zero failures, and 80 percent line coverage', async () => {
  const [quality, packageJson, runner, coverageRunner] = await Promise.all([
    readJson('governance/quality-gates.json'),
    readJson('package.json'),
    read('scripts/run-test-gate.mjs'),
    read('scripts/run-node-coverage-gate.mjs'),
  ]);
  assert.equal(quality.tests.minimum, 40);
  assert.equal(quality.tests.allowSkipped, false);
  assert.equal(quality.coverage.lines, 80);
  assert.equal(packageJson.scripts['test:coverage:node:ci'], 'node scripts/run-node-coverage-gate.mjs');
  assert.match(coverageRunner, /--test-coverage-lines=/);
  assert.match(runner, /minimumTests/);
  assert.match(runner, /failed !== 0/);
  assert.match(runner, /skipped !== 0/);
});

test('coverage gate includes critical browser application scripts at 80 percent', async () => {
  const [quality, packageJson, coverageScript, nodeCoverageScript] = await Promise.all([
    readJson('governance/quality-gates.json'),
    readJson('package.json'),
    read('tests/e2e/browser-coverage.mjs'),
    read('scripts/run-node-coverage-gate.mjs'),
  ]);
  assert.equal(quality.coverage.client.lines, 80);
  for (const path of ['assets/guide.js', 'assets/personas.js', 'assets/state.js', 'static/observability.js', 'assets/interlocks/interlocks.js', 'assets/interlocks/usecase-detail.js']) {
    assert.ok(quality.coverage.client.include.includes(path), path);
    assert.match(coverageScript, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(packageJson.scripts['test:coverage:browser'], /browser-coverage\.mjs/);
  assert.match(packageJson.scripts['test:coverage:ci'], /test:coverage:node:ci/);
  assert.match(packageJson.scripts['test:coverage:ci'], /test:coverage:browser/);
  assert.equal(packageJson.scripts['test:coverage:node:ci'], 'node scripts/run-node-coverage-gate.mjs');
  assert.match(coverageScript, /enforcePerFileLineFloors/);
  assert.match(nodeCoverageScript, /enforcePerFileLineFloors/);
  for (const [path, floor] of Object.entries({
    'static/observability.js': 75,
    'scripts/redact-gate.mjs': 70,
    'scripts/validate-governance.mjs': 75,
  })) assert.ok(quality.coverage.perFileLines[path] >= floor, path);
});

test('CI runs all browser journeys through one managed harness before release', async () => {
  const [workflow, packageJson, suite] = await Promise.all([
    read('.github/workflows/quality.yml'),
    readJson('package.json'),
    read('tests/e2e/browser-suite.mjs'),
  ]);
  const nodeCoverage = workflow.indexOf('npm run test:coverage:node:ci');
  const browserSuite = workflow.indexOf('npm run test:browser:ci');
  const release = workflow.indexOf('npm run release:build');
  assert.ok(nodeCoverage > 0 && browserSuite > nodeCoverage && release > browserSuite);
  assert.equal((workflow.match(/npm run test:browser:ci/g) || []).length, 1);
  assert.doesNotMatch(workflow, /npm run test:e2e/);
  assert.doesNotMatch(workflow, /npm run test:coverage:ci/);
  assert.doesNotMatch(workflow, /npm run test:smoke/);
  assert.equal(packageJson.scripts['test:browser:ci'], 'node tests/e2e/browser-suite.mjs');
  assert.match(packageJson.scripts.build, /test:coverage:node:ci/);
  assert.match(packageJson.scripts.build, /test:browser:ci/);
  assert.doesNotMatch(packageJson.scripts.build, /test:coverage:ci/);
  assert.equal((suite.match(/startBrowserHarness\(/g) || []).length, 1);
  assert.equal((suite.match(/resetContext\(\)/g) || []).length, 2);
  for (const journey of ['runLaunchpadE2E', 'runBrowserCoverage', 'runSurfaceSmoke']) assert.match(suite, new RegExp(journey));
});

test('browser harness uses ephemeral ports and deep smoke assertions', async () => {
  const [harness, smoke, launchpad] = await Promise.all([
    read('tests/e2e/browser-harness.mjs'),
    read('tests/e2e/surfaces.smoke.mjs'),
    read('tests/e2e/launchpad.e2e.mjs'),
  ]);
  assert.match(harness, /port = 0/);
  assert.match(harness, /server\.address\(\)\.port/);
  assert.match(harness, /--remote-debugging-port=0/);
  assert.match(harness, /DevToolsActivePort/);
  assert.match(harness, /STARTUP_ATTEMPTS/);
  assert.match(harness, /waitForProcessExit/);
  assert.match(harness, /signalCode !== null/);
  assert.match(harness, /detached: true/);
  assert.match(harness, /SIGKILL/);
  assert.match(harness, /Chrome diagnostics/);
  assert.match(harness, /chromium_headless_shell-/);
  assert.match(harness, /initializeDevTools/);
  assert.match(harness, /await close\(\)/);
  assert.doesNotMatch(harness, /reserveEphemeralPort/);
  assert.match(launchpad, /startBrowserHarness/);
  for (const assertion of ['activeElement', 'aria-current', 'aria-selected', 'aria-controls', 'scrollWidth', 'minTouchTarget']) {
    assert.match(smoke, new RegExp(assertion));
  }
});

test('DevToolsActivePort parsing accepts a native Chrome handshake and rejects malformed ports', async () => {
  const { parseDevToolsActivePort } = await import('../tests/e2e/browser-harness-protocol.mjs');
  assert.equal(parseDevToolsActivePort('49152\n/devtools/browser/example\n'), 49152);
  for (const value of ['', 'not-a-port\n/devtools/browser/example', '0\n/devtools/browser/example', '70000\n/devtools/browser/example']) {
    assert.throws(() => parseDevToolsActivePort(value), /DevToolsActivePort/);
  }
});

test('static analysis checks JavaScript, JSON, shell, HTML, CSS, and YAML surfaces', async () => {
  const [packageJson, checker] = await Promise.all([
    readJson('package.json'),
    read('scripts/static-check.mjs'),
  ]);
  assert.equal(packageJson.scripts.lint, 'node scripts/static-check.mjs');
  for (const token of ['node --check', 'JSON.parse', 'bash -n', 'duplicate id', 'target="_blank"', 'yaml']) {
    assert.match(checker, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});

test('redaction gate scans secrets, private keys, tokens, OCIDs, topology, and proprietary identifiers', async () => {
  const [packageJson, scanner, workflow] = await Promise.all([
    readJson('package.json'),
    read('scripts/redact-gate.mjs'),
    read('.github/workflows/quality.yml'),
  ]);
  assert.equal(packageJson.scripts['security:scan'], 'node scripts/redact-gate.mjs');
  for (const token of ['PRIVATE KEY', 'ghp_', 'OCI OCID', 'APM data key', 'OCI namespace', 'private topology', 'fingerprint']) {
    assert.match(scanner, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
  assert.match(workflow, /Security gate/);
  assert.match(workflow, /npm run security:scan/);
});

test('artifact policy separates tracked vectors from release-only PDFs and drift is enforced', async () => {
  const [policy, snapshot, packageJson, drift, driftLibrary, release, releaseFilter] = await Promise.all([
    readJson('governance/artifact-policy.json'),
    readJson('governance/artifact-snapshot.json'),
    readJson('package.json'),
    read('scripts/check-artifact-drift.mjs'),
    read('scripts/artifact-drift-lib.mjs'),
    read('scripts/build-release.mjs'),
    read('scripts/release-path-policy.mjs'),
  ]);
  assert.ok(policy.versionControl.generatedExtensions.includes('.drawio'));
  assert.ok(policy.versionControl.generatedExtensions.includes('.excalidraw'));
  assert.ok(policy.releaseOnly.generatedExtensions.includes('.pdf'));
  assert.ok(policy.releaseOnly.generatedExtensions.includes('.zip'));
  assert.match(drift, /generate-interlocks-drawio\.mjs/);
  assert.match(drift, /generate-usecase-artifacts\.mjs/);
  assert.match(drift, /SHA-256|sha256/i);
  assert.match(drift, /artifact-snapshot\.json/);
  assert.match(driftLibrary, /unexpected/i);
  assert.equal(snapshot.schemaVersion, '1.0.0');
  assert.equal(snapshot.algorithm, 'sha256');
  assert.ok(snapshot.files.length > 150);
  assert.deepEqual(snapshot.files.map(entry => entry.path), [...snapshot.files.map(entry => entry.path)].sort());
  assert.equal(new Set(snapshot.files.map(entry => entry.path)).size, snapshot.files.length);
  for (const entry of snapshot.files) {
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    const bytes = await readFile(new URL(entry.path, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
  }
  assert.match(release, /artifact-policy\.json/);
  assert.doesNotMatch(release, /generate-interlocks-pdf\.mjs/);
  assert.doesNotMatch(release, /generate-usecase-pdf\.mjs/);
  assert.match(release, /pre-built release PDF cache/i);
  for (const excluded of ['\\.bkp', '\\.env', '\\.DS_Store', 'Thumbs\\.db']) assert.match(releaseFilter, new RegExp(excluded));
  assert.match(release, /requiredPdfCount/);
  assert.ok(packageJson.scripts['artifacts:check']);
  assert.ok(packageJson.scripts['release:build']);
});

test('release path filter rejects backups, configuration leaks, and OS noise', async () => {
  const { isReleasePathAllowed } = await import('../scripts/release-path-policy.mjs');
  for (const path of [
    'assets/diagrams/interlocks/.$iam-governance.drawio.bkp',
    'assets/.env.production',
    'static/.npmrc',
    'assets/.DS_Store',
    'assets/Thumbs.db',
    'assets/editor-file.swp',
    'assets/.oci/config',
  ]) assert.equal(isReleasePathAllowed(path), false, path);
  for (const path of ['interlocks.html', 'assets/diagrams/interlocks/network.drawio', 'assets/site-config.js']) {
    assert.equal(isReleasePathAllowed(path), true, path);
  }
});

test('verified release is uploaded and deployed to GitHub Pages with public URL checks', async () => {
  const [policy, workflow, verifier, verificationLibrary] = await Promise.all([
    readJson('governance/artifact-policy.json'),
    read('.github/workflows/quality.yml'),
    read('scripts/verify-public-deployment.mjs'),
    read('scripts/deployment-verification-lib.mjs'),
  ]);
  assert.equal(policy.releasePackage.requiredPdfCount, 66);
  assert.ok(policy.releasePackage.requiredPaths.includes('interlocks.html'));
  assert.match(workflow, /actions\/configure-pages@[a-f0-9]{40}/);
  assert.match(workflow, /actions\/upload-pages-artifact@[a-f0-9]{40}/);
  assert.match(workflow, /actions\/deploy-pages@[a-f0-9]{40}/);
  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /path: dist\/site/);
  assert.match(workflow, /verify-public-deployment\.mjs/);
  assert.match(verificationLibrary, /interlocks\.html/);
  assert.match(verificationLibrary, /requiredPdfCount/);
  for (const surface of ['index.html', 'launchpad.html', 'interlocks.html', 'interlock-detail.html']) {
    assert.match(verificationLibrary, new RegExp(surface.replace('.', '\\.')));
  }
  assert.match(verifier, /sha256|SHA-256/);
  assert.match(verifier, /byte size/i);
  for (const marker of ['telemetry-route', 'module-home', 'architecture-board', 'usecase-detail']) {
    assert.match(verifier, new RegExp(marker));
  }
  assert.match(verifier, /redirect: 'manual'/);
  assert.doesNotMatch(workflow, /configure-pages-deployment/);
});

test('public deployment verification derives all required surfaces and exactly 66 PDF routes', async () => {
  const { buildVerificationPaths } = await import('../scripts/deployment-verification-lib.mjs');
  const manifest = { files: [
    ...['index.html', 'launchpad.html', 'interlocks.html', 'interlock-detail.html']
      .map(path => ({ path, bytes: 1, sha256: 'a'.repeat(64) })),
    ...Array.from({ length: 66 }, (_, index) => ({ path: `assets/architecture-${index + 1}.pdf`, bytes: 1, sha256: 'b'.repeat(64) })),
  ] };
  const paths = buildVerificationPaths(manifest, 66);
  assert.deepEqual(paths.slice(0, 4), ['index.html', 'launchpad.html', 'interlocks.html', 'interlock-detail.html']);
  assert.equal(paths.length, 70);
  assert.throws(() => buildVerificationPaths({ files: manifest.files.slice(0, -1) }, 66), /66 PDFs/);
  assert.throws(
    () => buildVerificationPaths({ files: manifest.files.filter(entry => entry.path !== 'launchpad.html') }, 66),
    /missing required surface: launchpad\.html/,
  );
});

test('cross-surface smoke suite covers four surfaces at desktop and mobile widths', async () => {
  const [packageJson, smoke] = await Promise.all([
    readJson('package.json'),
    read('tests/e2e/surfaces.smoke.mjs'),
  ]);
  assert.equal(packageJson.scripts['test:smoke'], 'node tests/e2e/surfaces.smoke.mjs');
  for (const surface of ['index.html', 'launchpad.html', 'interlocks.html', 'interlock-detail.html']) assert.match(smoke, new RegExp(surface));
  assert.match(smoke, /1440/);
  assert.match(smoke, /390/);
  assert.match(smoke, /noOverflow/);
  assert.match(smoke, /Runtime\.exceptionThrown/);
  assert.match(smoke, /Network\.loadingFailed/);
});
