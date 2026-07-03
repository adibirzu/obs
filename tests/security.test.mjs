import assert from 'node:assert/strict';
import test from 'node:test';

import { scanText } from '../scripts/redact-gate.mjs';

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
