import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('query builder renders user-controlled regions, namespaces, and metrics without HTML sinks', async () => {
  const source = await read('static/observability.js');
  const addTag = source.slice(source.indexOf('function addTag'), source.indexOf('function initNamespaceSelect'));

  assert.doesNotMatch(addTag, /innerHTML/);
  assert.doesNotMatch(addTag, /querySelector\(`\[data-value=/);
  assert.match(addTag, /createTextNode/);
  assert.doesNotMatch(source, /results\.innerHTML/);
  assert.match(source, /renderQueryResults/);
  assert.match(source, /renderExecutedQuery/);
});

test('documentation examples keep credentials out of command arguments and URLs', async () => {
  const [guide, launchpad] = await Promise.all([
    read('assets/guide.js'),
    read('static/observability.js'),
  ]);

  assert.doesNotMatch(guide, /--secret-content-content|\$PW/);
  assert.match(guide, /TMP_0600_SECRET_CREATE_JSON/);
  assert.match(guide, /--from-json/);
  assert.doesNotMatch(launchpad, /admin:password|database-endpoint/);
  assert.match(launchpad, /TMP_0600_CURL_CONFIG/);
  assert.match(launchpad, /<DB_MANAGEMENT_ENDPOINT>/);
});
