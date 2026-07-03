import { posix } from 'node:path';

export const REQUIRED_SURFACE_PATHS = Object.freeze([
  'index.html',
  'launchpad.html',
  'interlocks.html',
  'interlock-detail.html',
]);

function isNormalizedProjectPath(path) {
  if (typeof path !== 'string' || !path || path !== path.trim()) return false;
  if (path.startsWith('/') || path.includes('\\') || /[?#\u0000-\u001f]/.test(path)) return false;
  if (/^[a-z][a-z\d+.-]*:/i.test(path)) return false;
  let decoded;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return false;
  }
  if (decoded !== path) return false;
  const segments = path.split('/');
  if (segments.some(segment => !segment || segment === '.' || segment === '..')) return false;
  return posix.normalize(path) === path;
}

function validateEntry(entry) {
  if (!isNormalizedProjectPath(entry?.path)) {
    throw new Error(`Deployment manifest path must be a normalized project-relative path: ${String(entry?.path)}`);
  }
  if (!Number.isSafeInteger(entry.bytes) || entry.bytes < 0 || !/^[a-f0-9]{64}$/.test(entry.sha256)) {
    throw new Error(`Deployment manifest entry lacks valid bytes or SHA-256 metadata: ${entry.path}`);
  }
}

export function buildVerificationEntries(manifest, requiredPdfCount, requiredPaths = REQUIRED_SURFACE_PATHS) {
  if (!Array.isArray(manifest?.files)) throw new Error('Deployment manifest must contain a files array');
  const entries = manifest.files;
  entries.forEach(validateEntry);
  const paths = entries.map(file => file.path);
  if (new Set(paths).size !== paths.length) throw new Error('Deployment manifest contains duplicate paths');
  const pdfs = entries.filter(entry => entry.path.toLowerCase().endsWith('.pdf')).sort((left, right) => left.path.localeCompare(right.path));
  if (pdfs.length !== requiredPdfCount) {
    throw new Error(`Deployment manifest must contain ${requiredPdfCount} PDFs; found ${pdfs.length}`);
  }
  if (!Array.isArray(requiredPaths)) throw new Error('Deployment policy requiredPaths must be an array');
  const surfacePaths = [...new Set([...REQUIRED_SURFACE_PATHS, ...requiredPaths])];
  const surfaces = surfacePaths.map(path => {
    if (!isNormalizedProjectPath(path)) throw new Error(`Deployment policy required path is not normalized: ${path}`);
    const entry = entries.find(candidate => candidate.path === path);
    if (!entry) throw new Error(`Deployment manifest is missing required surface: ${path}`);
    return entry;
  });
  return [...surfaces, ...pdfs];
}

export const buildVerificationPaths = (manifest, requiredPdfCount, requiredPaths) =>
  buildVerificationEntries(manifest, requiredPdfCount, requiredPaths).map(entry => entry.path);
