import assert from 'node:assert/strict';
import test from 'node:test';

import { isTextLikePath, repositoryFiles, scanText } from '../scripts/redact-gate.mjs';

test('redaction scanner discovers tracked and untracked text files while excluding its fixtures', () => {
  const files = repositoryFiles();
  assert.ok(files.includes('README.md'));
  assert.ok(files.includes('tests/security.test.mjs'));
  assert.ok(!files.includes('scripts/redact-gate.mjs'));
  assert.ok(!files.includes('tests/pipeline.test.mjs'));
  assert.ok(files.every((path, index) => index === 0 || files[index - 1] <= path));
});

test('redaction scanner detects representative secrets without echoing their values', () => {
  const githubToken = 'ghp_' + 'a'.repeat(36);
  const privateKey = ['-----BEGIN', 'PRIVATE KEY-----'].join(' ');
  const ocid = ['ocid1', 'tenancy', 'oc1', '', 'a'.repeat(40)].join('.');
  const findings = scanText('fixture.txt', `${githubToken}\n${privateKey}\n${ocid}`);
  assert.deepEqual(findings.map(({ rule }) => rule).sort(), ['github-token', 'oci-ocid', 'private-key']);
  assert.ok(findings.every(finding => !JSON.stringify(finding).includes(githubToken)));
});

test('redaction scanner allows explicit placeholder forms', () => {
  const findings = scanText('fixture.txt', [
    'Authorization=Bearer <APM_PRIVATE_DATAKEY>',
    'compartment=<COMPARTMENT_OCID>',
  ].join('\n'));
  assert.deepEqual(findings, []);
});

test('redaction scanner detects context-bound namespaces and topology without literal fixtures', () => {
  const namespace = 'la_namespace=' + 'n'.repeat(12);
  const publicAddress = 'jumphost_ip=' + [100, 64, 1, 9].join('.');
  const privateAddress = 'worker_node_ip=' + [10, 20, 30, 40].join('.');
  const findings = scanText('fixture.env', [namespace, publicAddress, privateAddress].join('\n'));
  assert.deepEqual(findings.map(({ rule }) => rule).sort(), ['oci-namespace', 'private-topology', 'public-topology']);
});

test('redaction scanner includes unstructured vector and XML assets', () => {
  for (const path of ['diagram.svg', 'payload.xml', 'workflow.excalidraw', 'library.excalidrawlib']) assert.equal(isTextLikePath(path), true, path);
});

test('redaction scanner detects a bare infrastructure token without assignment context', () => {
  const bareToken = ['abc', '123', 'def', '457'].join('');
  const findings = scanText('diagram.svg', `<text>${bareToken}</text>`);
  assert.deepEqual(findings.map(({ rule }) => rule), ['oci-infrastructure-token']);
  assert.ok(findings.every(finding => !JSON.stringify(finding).includes(bareToken)));
});

test('redaction scanner detects bare internal topology addresses without assignment context', () => {
  const publicAddress = [130, 61, 8, 9].join('.');
  const privateAddress = [10, 42, 8, 9].join('.');
  const findings = scanText('topology.xml', `<endpoint>${publicAddress}</endpoint>\n<node>${privateAddress}</node>`);
  assert.deepEqual(findings.map(({ rule }) => rule).sort(), ['private-topology', 'public-topology']);
});
