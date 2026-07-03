import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(new URL('../', import.meta.url).pathname);
const textExtensions = new Set(['.css', '.drawio', '.excalidraw', '.excalidrawlib', '.html', '.js', '.json', '.md', '.mjs', '.sh', '.svg', '.toml', '.txt', '.xml', '.yaml', '.yml']);
const excludedFixtures = new Set(['scripts/redact-gate.mjs', 'tests/pipeline.test.mjs']);
export const patterns = Object.freeze([
  { id: 'private-key', label: 'PRIVATE KEY material', regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
  { id: 'github-token', label: 'GitHub token', regex: /\b(?:ghp_|gho_|ghu_|ghs_|github_pat_)[A-Za-z0-9_]{20,}\b/g },
  { id: 'internal-service-key', label: 'APM data key or internal service token', regex: /\bisk_[a-f0-9]{40}\b/g },
  { id: 'bearer-token', label: 'Bearer token', regex: /\bBearer\s+(?!<|\$\{)[A-Za-z0-9._~+/-]{20,}/g },
  { id: 'assigned-secret', label: 'assigned API key, password, secret, or token', regex: /\b(?:api[_-]?key|password|private[_-]?key|secret|token)\s*[:=]\s*["'](?!<|\$\{)[^"']{12,}["']/gi },
  { id: 'oci-ocid', label: 'un-redacted OCI OCID proprietary identifier', regex: /\bocid1\.(?:tenancy|compartment|instance|cluster|networksecuritygroup|loadbalancer|subnet|vnic|bootvolume|loganalytics[a-z]*|user)\.oc1\.[a-z-]*\.[a-z0-9]{20,}\b/gi },
  { id: 'oci-namespace', label: 'OCI namespace proprietary identifier', regex: /\b(?:ocir_namespace|registry_namespace|tenancy_namespace|apm_domain_id|la_namespace)[ \t]*[:=][ \t]*["']?(?!<|\$\{)[a-z0-9]{10,32}\b/gi },
  { id: 'oci-infrastructure-token', label: 'bare OCI namespace or infrastructure token', regex: /(?<![-%])\b(?=[a-z0-9]*[a-z])(?=[a-z0-9]*\d)(?:[a-z0-9]{12}|[a-z0-9]{26})\b(?!-)/g },
  { id: 'public-topology', label: 'public topology address', regex: /(?:\b(?:(?:public|load_balancer|jumphost|control_plane|worker_node)[a-z_-]*_ip|endpoint)[ \t]*[:=][ \t]*["']?(?!<|\$\{|10\.|127\.|192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)(?:\d{1,3}\.){3}\d{1,3}\b|\b(?:130[.]61|161[.]153|144[.]24|129[.]153|141[.]147|82[.]77|109[.]166)[.]\d{1,3}[.]\d{1,3}\b)/gi },
  { id: 'private-topology', label: 'private topology address', regex: /(?:\b(?:(?:private|load_balancer|jumphost|control_plane|worker_node)[a-z_-]*_ip|endpoint)[ \t]*[:=][ \t]*["']?(?!<|\$\{)10\.(?:\d{1,3}\.){2}\d{1,3}\b|\b10[.](?:42[.]\d{1,3}|0[.]10)[.]\d{1,3}\b)/gi },
  { id: 'oci-fingerprint', label: 'OCI API key fingerprint', regex: /\b(?:[a-f0-9]{2}:){15}[a-f0-9]{2}\b/gi },
  { id: 'personal-path', label: 'personal email embedded in a filesystem path', regex: /(?:\/Users\/|\/home\/)[^\s"']*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}[^\s"']*/g },
]);

export function isTextLikePath(path) {
  return textExtensions.has(extname(path).toLowerCase());
}

export function repositoryFiles() {
  const result = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ls-files failed: ${result.stderr.trim()}`);
  return [...new Set(result.stdout.split('\n').filter(Boolean))]
    .filter(path => isTextLikePath(path) && !excludedFixtures.has(path))
    .sort();
}

export function scanText(path, text) {
  const findings = [];
  const lineOffsets = [0];
  for (let index = 0; index < text.length; index += 1) if (text[index] === '\n') lineOffsets.push(index + 1);
  const lineFor = offset => {
    let low = 0;
    let high = lineOffsets.length;
    while (low + 1 < high) {
      const middle = Math.floor((low + high) / 2);
      if (lineOffsets[middle] <= offset) low = middle;
      else high = middle;
    }
    return low + 1;
  };
  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    for (const match of text.matchAll(pattern.regex)) findings.push({ path, line: lineFor(match.index), rule: pattern.id, label: pattern.label });
  }
  return findings;
}

async function main() {
  const files = repositoryFiles();
  const findings = [];
  for (const path of files) {
    let text;
    try { text = await readFile(resolve(root, path), 'utf8'); } catch { continue; }
    findings.push(...scanText(path, text));
  }

  if (findings.length) {
    console.error('Repository redaction gate failed. Matched values are suppressed:');
    for (const finding of findings) console.error(`- ${finding.path}:${finding.line} [${finding.rule}] ${finding.label}`);
    process.exitCode = 1;
  } else {
    console.log(`Repository redaction gate passed: ${files.length} text files scanned; no secrets or proprietary identifiers detected.`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
