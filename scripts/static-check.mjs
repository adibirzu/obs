import { readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { extname, relative, resolve, sep } from 'node:path';

const root = resolve(new URL('../', import.meta.url).pathname);
const excluded = ['.git', '.impeccable', '.playwright-cli', 'assets/diagrams', 'assets/redwood', 'dist', 'node_modules'];
const sourceExtensions = new Set(['.css', '.html', '.js', '.json', '.md', '.mjs', '.sh', '.yaml', '.yml']);
const errors = [];

const posix = value => value.split(sep).join('/');

async function collect(directory = root) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name);
    const local = posix(relative(root, absolute));
    if (entry.isDirectory()) {
      if (excluded.some(prefix => local === prefix || local.startsWith(`${prefix}/`))) continue;
      files.push(...await collect(absolute));
    } else if (entry.isFile() && sourceExtensions.has(extname(entry.name))) files.push({ absolute, local });
  }
  return files;
}

function checkCommand(label, command, args, file) {
  const result = spawnSync(command, [...args, file.absolute], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) errors.push(`${file.local}: ${label}: ${(result.stderr || result.stdout).trim()}`);
}

function checkHtml(file, text) {
  const ids = [...text.matchAll(/\sid=["']([^"']+)["']/g)].map(([, id]) => id);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) errors.push(`${file.local}: duplicate id ${duplicateIds.join(', ')}`);
  for (const match of text.matchAll(/<img\b[^>]*>/gi)) if (!/\balt=["'][^"']*["']/i.test(match[0])) errors.push(`${file.local}: image missing alt text`);
  for (const match of text.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
    if (/\brel=["'][^"']*\bopener\b[^"']*["']/i.test(match[0]) && !/\bnoopener\b/i.test(match[0])) errors.push(`${file.local}: target="_blank" explicitly enables opener`);
  }
  if (/\son[a-z]+\s*=/i.test(text)) errors.push(`${file.local}: inline event handler bypasses static analysis`);
}

function checkCss(file, text) {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(['"])(?:\\.|(?!\1)[^\\])*\1/g, '');
  let depth = 0;
  for (const character of clean) {
    if (character === '{') depth += 1;
    if (character === '}') depth -= 1;
    if (depth < 0) break;
  }
  if (depth !== 0) errors.push(`${file.local}: unbalanced CSS braces`);
}

function checkYaml(file, text) {
  if (/\t/.test(text)) errors.push(`${file.local}: yaml contains tab indentation`);
  if (/^<{7}|^={7}|^>{7}/m.test(text)) errors.push(`${file.local}: yaml contains merge-conflict markers`);
  for (const [index, line] of text.split('\n').entries()) {
    const indentation = line.match(/^ */)?.[0].length ?? 0;
    if (indentation % 2 !== 0) errors.push(`${file.local}:${index + 1}: yaml indentation must use two-space increments`);
  }
}

const files = await collect();
for (const file of files) {
  const text = await readFile(file.absolute, 'utf8');
  const extension = extname(file.local);
  if (['.js', '.mjs'].includes(extension)) {
    checkCommand('node --check failed', process.execPath, ['--check'], file);
    if (/\beval\s*\(|\bnew\s+Function\s*\(/.test(text)) errors.push(`${file.local}: dynamic code execution is prohibited`);
  } else if (extension === '.json') {
    try { JSON.parse(text); } catch (error) { errors.push(`${file.local}: JSON.parse failed: ${error.message}`); }
  } else if (extension === '.sh') {
    checkCommand('bash -n failed', 'bash', ['-n'], file);
  } else if (extension === '.html') checkHtml(file, text);
  else if (extension === '.css') checkCss(file, text);
  else if (['.yaml', '.yml'].includes(extension)) checkYaml(file, text);
}

for (const file of files) {
  if (!(await stat(file.absolute)).isFile()) errors.push(`${file.local}: source disappeared during static analysis`);
}

if (errors.length) {
  console.error(`Static analysis failed:\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Static analysis passed for ${files.length} JavaScript, JSON, shell, HTML, CSS, Markdown, and yaml source files.`);
}
