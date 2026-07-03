import { basename } from 'node:path';

const ANSI_ESCAPE = /\u001b\[[0-9;]*m/g;

export function enforcePerFileLineFloors(results, floors, label = 'Per-file line coverage') {
  for (const [path, floor] of Object.entries(floors)) {
    const result = results.find(candidate => candidate.path === path);
    if (!result) throw new Error(`${label} report is missing configured file ${path}`);
    if (!Number.isFinite(result.percent)) throw new Error(`${label} for ${path} is not a finite percentage`);
    if (result.percent < floor) {
      throw new Error(`${label} failed: ${path} is ${result.percent.toFixed(2)}%, below its ${floor}% floor`);
    }
  }
}

export function parseNodeCoverageReport(output, targetPaths) {
  const targetsByName = new Map(targetPaths.map(path => [basename(path), path]));
  const results = [];
  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.replace(ANSI_ESCAPE, '').replace(/^\s*[ℹ#]\s*/, '');
    const match = line.match(/^([^|]+?)\s*\|\s*([\d.]+)\s*\|/);
    if (!match) continue;
    const name = match[1].trim();
    const path = targetsByName.get(name);
    if (path) results.push({ path, percent: Number.parseFloat(match[2]) });
  }
  return results;
}
