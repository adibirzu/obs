import { sep } from 'node:path';

const blockedDirectories = new Set(['.git', '.github', '.idea', '.vscode', '.aws', '.oci', 'node_modules']);
const blockedNames = new Set(['.DS_Store', '.npmrc', '.yarnrc', '.pypirc', '.netrc', 'Thumbs.db', 'desktop.ini', 'credentials', 'credentials.json', 'secrets.json']);
const posix = value => value.split(sep).join('/');

export function isReleasePathAllowed(path) {
  const segments = posix(path).split('/').filter(Boolean);
  const name = segments.at(-1) ?? '';
  if (segments.some(segment => blockedDirectories.has(segment))) return false;
  if (blockedNames.has(name) || name === '.env' || name.startsWith('.env.')) return false;
  if (name.startsWith('._') || /(?:\.bkp|\.bak|\.orig|\.rej|\.swp|\.swo|~)$/i.test(name)) return false;
  return true;
}
