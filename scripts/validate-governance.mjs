import { readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const projectRootUrl = new URL('../', import.meta.url);
const DEFAULT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.md', '.mjs', '.yaml', '.yml']);
const DEFAULT_EXCLUDED_DIRECTORIES = new Set([
  '.git', '.impeccable', '.playwright-cli', 'assets/diagrams', 'assets/redwood',
  'dist', 'governance', 'node_modules', 'static/oci-icons', 'tests',
]);
const NON_REFERENCE_HOSTS = new Set([
  '127.0.0.1', 'database-endpoint', 'example.com', 'example.test', 'inventory.service',
  'itsm.example.com', 'localhost', 'www.w3.org',
]);
const EXPLICIT_LINK_EXEMPTIONS = new Map([
  ['https://fonts.googleapis.com/', 'Origin-only browser preconnect; it is not a document endpoint and intentionally returns no content page.'],
  ['https://fonts.gstatic.com/', 'Origin-only browser preconnect; it is not a document endpoint and intentionally returns no content page.'],
]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const asPath = value => value instanceof URL ? fileURLToPath(value) : resolve(value);
const toPosix = value => value.split(sep).join('/');
const unique = values => [...new Set(values)];

async function walk(rootPath, { extensions = DEFAULT_EXTENSIONS, excludedDirectories = DEFAULT_EXCLUDED_DIRECTORIES, excludedFiles = new Set() } = {}) {
  const output = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = resolve(directory, entry.name);
      const local = toPosix(relative(rootPath, absolute));
      if (entry.isDirectory()) {
        if ([...excludedDirectories].some(excluded => local === excluded || local.startsWith(`${excluded}/`))) continue;
        await visit(absolute);
      } else if (entry.isFile() && extensions.has(extname(entry.name)) && !excludedFiles.has(local)) {
        output.push({ absolute, local });
      }
    }
  }
  await visit(rootPath);
  return output.sort((left, right) => left.local.localeCompare(right.local));
}

function normalizeDiscoveredUrl(candidate) {
  const cleaned = candidate
    .replaceAll('&amp;', '&')
    .replace(/[\\`'"),.;:}\]*]+$/g, '')
    .trim();
  if (!cleaned || cleaned.includes('${') || cleaned.includes('…')) return null;
  try {
    const parsed = new URL(cleaned);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (NON_REFERENCE_HOSTS.has(parsed.hostname) || parsed.hostname.endsWith('.example.com')) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export async function discoverExternalLinks({ rootUrl = projectRootUrl } = {}) {
  const rootPath = asPath(rootUrl);
  const sourcesByUrl = new Map();
  for (const file of await walk(rootPath)) {
    const text = await readFile(file.absolute, 'utf8');
    for (const match of text.matchAll(/https?:\/\/[^\s<>"'`\\]+/g)) {
      const url = normalizeDiscoveredUrl(match[0]);
      if (!url) continue;
      sourcesByUrl.set(url, unique([...(sourcesByUrl.get(url) ?? []), file.local]).sort());
    }
  }
  return [...sourcesByUrl.entries()]
    .map(([url, sources]) => ({ url, sources }))
    .sort((left, right) => left.url.localeCompare(right.url));
}

function ageInDays(earlier, later) {
  return Math.floor((Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) / 86_400_000);
}

export function validateLinkRegistry({ discovered, registry, today = new Date().toISOString().slice(0, 10) }) {
  const errors = [];
  if (registry.schemaVersion !== '1.0.0') errors.push('external-links: schemaVersion must be 1.0.0');
  if (!DATE_PATTERN.test(registry.checkedAt ?? '')) errors.push('external-links: checkedAt must be an ISO date');
  if (!Number.isInteger(registry.policy?.maxAgeDays) || registry.policy.maxAgeDays < 1) errors.push('external-links: maxAgeDays must be a positive integer');
  if (!Array.isArray(registry.policy?.acceptedStatusCodes)) errors.push('external-links: acceptedStatusCodes must be an array');
  if (!Array.isArray(registry.links)) return [...errors, 'external-links: links must be an array'];

  const found = new Map(discovered.map(link => [link.url, link]));
  const registered = new Map();
  for (const link of registry.links) {
    if (registered.has(link.url)) errors.push(`external-links: duplicate ${link.url}`);
    registered.set(link.url, link);
    if (!DATE_PATTERN.test(link.lastChecked ?? '')) errors.push(`external-links: invalid lastChecked for ${link.url}`);
    else if (ageInDays(link.lastChecked, today) > registry.policy.maxAgeDays) errors.push(`external-links: stale check for ${link.url}`);
    if (link.lastChecked > today) errors.push(`external-links: future lastChecked for ${link.url}`);
    const accepted = Number.isInteger(link.statusCode)
      && ((link.statusCode >= 200 && link.statusCode < 400) || registry.policy.acceptedStatusCodes.includes(link.statusCode));
    if (!accepted && !link.exemption) errors.push(`external-links: unacceptable or missing status for ${link.url}`);
    if (!Array.isArray(link.sources) || link.sources.length === 0) errors.push(`external-links: sources missing for ${link.url}`);
  }
  for (const [url, link] of found) {
    if (!registered.has(url)) errors.push(`external-links: unregistered ${url}`);
    else if (JSON.stringify(registered.get(url).sources) !== JSON.stringify(link.sources)) errors.push(`external-links: source list drift for ${url}`);
  }
  for (const url of registered.keys()) if (!found.has(url)) errors.push(`external-links: orphaned registry entry ${url}`);
  return errors;
}

export function validateTelemetryContracts(registry) {
  const errors = [];
  const expected = ['apm', 'logan', 'prometheus'];
  const names = Object.keys(registry.contracts ?? {}).sort();
  if (JSON.stringify(names) !== JSON.stringify(expected)) errors.push('telemetry: contracts must be exactly apm, logan, and prometheus');
  const shared = new Set(registry.sharedCorrelationFields ?? []);
  const ownerBySpecificField = new Map();
  for (const [name, contract] of Object.entries(registry.contracts ?? {})) {
    for (const field of contract.allowedFields ?? []) {
      if ((contract.forbiddenFields ?? []).includes(field)) errors.push(`telemetry: ${name}.${field} is both allowed and forbidden`);
      if (shared.has(field)) continue;
      if (ownerBySpecificField.has(field)) errors.push(`telemetry: ${field} crosses ${ownerBySpecificField.get(field)} and ${name}`);
      else ownerBySpecificField.set(field, name);
    }
    for (const field of shared) if (!(contract.allowedFields ?? []).includes(field)) errors.push(`telemetry: ${name} omits shared field ${field}`);
    if (!Array.isArray(contract.signalTypes) || contract.signalTypes.length === 0) errors.push(`telemetry: ${name} has no signal types`);
  }
  return errors;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function validateRenameLedger({ rootUrl = projectRootUrl, ledger, today = new Date().toISOString().slice(0, 10) }) {
  const errors = [];
  if (ledger.schemaVersion !== '1.0.0') errors.push('rename-ledger: schemaVersion must be 1.0.0');
  for (const claim of ledger.claims ?? []) {
    if (!DATE_PATTERN.test(claim.verifiedOn ?? '') || !DATE_PATTERN.test(claim.reviewAfter ?? '')) errors.push(`rename-ledger: ${claim.id} has invalid dates`);
    if (claim.status === 'current' && claim.reviewAfter < today) errors.push(`rename-ledger: ${claim.id} requires review`);
    if (!/^https:\/\//.test(claim.sourceUrl ?? '')) errors.push(`rename-ledger: ${claim.id} lacks an HTTPS source`);
  }

  const rootPath = asPath(rootUrl);
  const scan = ledger.scan ?? {};
  const files = await walk(rootPath, {
    extensions: new Set(scan.extensions ?? []),
    excludedDirectories: new Set(scan.excludeDirectories ?? []),
    excludedFiles: new Set(scan.excludeFiles ?? []),
  });
  for (const file of files) {
    const text = await readFile(file.absolute, 'utf8');
    for (const rename of ledger.renames ?? []) {
      if ((rename.allowedPaths ?? []).includes(file.local)) continue;
      const pattern = new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(rename.deprecated)}(?![A-Za-z0-9])`, 'g');
      if (pattern.test(text)) errors.push(`rename-ledger: ${file.local} uses ${rename.deprecated}; use ${rename.canonical}`);
    }
  }
  return errors;
}

export async function loadWorkflowRegistry(rootUrl = projectRootUrl) {
  const read = path => readFile(new URL(path, rootUrl), 'utf8');
  const [governance, domain, network] = await Promise.all([
    read('assets/interlocks/workflow-governance.js'),
    read('assets/interlocks/domain-drilldowns.js'),
    read('assets/interlocks/network-drilldowns.js'),
  ]);
  const context = vm.createContext({});
  vm.runInContext(governance, context);
  vm.runInContext(domain, context);
  vm.runInContext(network, context);
  return [
    ...context.NETWORK_DRILLDOWNS.map(workflow => ({ ...workflow, domain: 'network' })),
    ...Object.entries(context.DOMAIN_DRILLDOWNS).flatMap(([domainName, workflows]) => workflows.map(workflow => ({ ...workflow, domain: domainName }))),
  ];
}

export function validateWorkflows(workflows, telemetryRegistry) {
  const errors = [];
  const contractNames = new Set(Object.keys(telemetryRegistry.contracts ?? {}));
  for (const workflow of workflows) {
    const prefix = `workflow:${workflow.domain}/${workflow.id}`;
    if (!Array.isArray(workflow.prerequisites) || workflow.prerequisites.length < 3) errors.push(`${prefix} needs at least three prerequisites`);
    if (!Array.isArray(workflow.correlationKeys) || !workflow.correlationKeys.includes('trace_id')) errors.push(`${prefix} must include trace_id`);
    if (!workflow.emptyResult || !/(inconclusive|not proof|does not prove)/i.test(workflow.emptyResult)) errors.push(`${prefix} needs an empty-result caveat`);
    for (const contract of workflow.telemetryContracts ?? []) if (!contractNames.has(contract)) errors.push(`${prefix} uses unknown telemetry contract ${contract}`);
  }
  return errors;
}

async function probeLink(url) {
  const headers = { 'user-agent': 'OCI-Observability-Atlas-Link-Validator/1.0' };
  let response = await fetch(url, { method: 'HEAD', redirect: 'follow', headers, signal: AbortSignal.timeout(15_000) });
  if ([400, 405, 501].includes(response.status)) {
    response = await fetch(url, { method: 'GET', redirect: 'follow', headers: { ...headers, range: 'bytes=0-1023' }, signal: AbortSignal.timeout(15_000) });
  }
  return { statusCode: response.status, redirectedTo: response.url !== url ? response.url : undefined };
}

async function refreshLinks({ discovered, previous, today }) {
  const previousByUrl = new Map((previous?.links ?? []).map(link => [link.url, link]));
  const links = new Array(discovered.length);
  let cursor = 0;
  async function worker() {
    while (cursor < discovered.length) {
      const index = cursor++;
      const link = discovered[index];
      const old = previousByUrl.get(link.url);
      if (EXPLICIT_LINK_EXEMPTIONS.has(link.url)) {
        links[index] = { ...link, statusCode: null, lastChecked: today, exemption: EXPLICIT_LINK_EXEMPTIONS.get(link.url) };
        continue;
      }
      if (old?.exemption && !old.exemption.startsWith('Network validation could not complete')) {
        links[index] = { ...link, statusCode: null, lastChecked: today, exemption: old.exemption };
        continue;
      }
      try {
        links[index] = { ...link, ...(await probeLink(link.url)), lastChecked: today };
      } catch (error) {
        links[index] = { ...link, statusCode: null, lastChecked: today, exemption: `Network validation could not complete: ${error.name}. Review manually before relying on this reference.` };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, discovered.length) }, worker));
  return {
    schemaVersion: '1.0.0',
    checkedAt: today,
    policy: { maxAgeDays: 30, acceptedStatusCodes: [401, 403, 405, 429] },
    links,
  };
}

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, projectRootUrl), 'utf8'));
}

export async function validateGovernance({ refresh = false, today = new Date().toISOString().slice(0, 10) } = {}) {
  const registryUrl = new URL('governance/external-links.json', projectRootUrl);
  const discovered = await discoverExternalLinks();
  let linkRegistry;
  try { linkRegistry = JSON.parse(await readFile(registryUrl, 'utf8')); } catch { linkRegistry = null; }
  if (refresh) {
    linkRegistry = await refreshLinks({ discovered, previous: linkRegistry, today });
    await writeFile(registryUrl, `${JSON.stringify(linkRegistry, null, 2)}\n`);
  }
  if (!linkRegistry) throw new Error('Missing governance/external-links.json. Run npm run governance:refresh-links.');

  const [linkSchema, telemetry, ledger, workflows] = await Promise.all([
    readJson('governance/schemas/external-links.schema.json'),
    readJson('governance/telemetry-contracts.json'),
    readJson('governance/roadmap-renames.json'),
    loadWorkflowRegistry(),
  ]);
  const errors = [
    ...(linkSchema.$schema === 'https://json-schema.org/draft/2020-12/schema' && linkSchema.properties?.links
      ? []
      : ['external-links: schema document is missing Draft 2020-12 link definitions']),
    ...validateLinkRegistry({ discovered, registry: linkRegistry, today }),
    ...validateTelemetryContracts(telemetry),
    ...(await validateRenameLedger({ ledger, today })),
    ...validateWorkflows(workflows, telemetry),
  ];
  if (errors.length) throw new Error(`Governance validation failed:\n- ${errors.join('\n- ')}`);
  return { links: linkRegistry.links.length, workflows: workflows.length, claims: ledger.claims.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const refresh = process.argv.includes('--refresh-links');
  validateGovernance({ refresh })
    .then(result => console.log(`Governance validation passed: ${result.links} links, ${result.workflows} workflows, ${result.claims} roadmap claims.`))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
