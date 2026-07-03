import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { selectDiagrams } from './interlock-pdf-selection.mjs';

const EXPORT_URL = 'https://convert.diagrams.net/node/export';
const PDF_EXPORT_ATTEMPTS = 3;
const PDF_EXPORT_TIMEOUT_MS = 45_000;
const PDF_RETRY_DELAY_MS = 1_500;
const root = new URL('../', import.meta.url);
const delay = milliseconds => new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));

async function cancelResponse(response) {
  if (response?.body && !response.bodyUsed && typeof response.body.cancel === 'function') {
    await response.body.cancel().catch(() => {});
  }
}

function assertPositiveInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${label} must be a positive integer`);
}

function exportForm(diagram, xml) {
  return new URLSearchParams({
    format: 'pdf',
    filename: `${diagram.id}-documented.pdf`,
    bg: '#ffffff',
    base64: '0',
    embedXml: '0',
    scale: '1',
    border: '0',
    crop: '0',
    shadows: '0',
    xml,
  });
}

export async function exportPoster(diagram, {
  fetchImpl = fetch,
  readFileImpl = readFile,
  writeFileImpl = writeFile,
  attempts = PDF_EXPORT_ATTEMPTS,
  timeoutMs = PDF_EXPORT_TIMEOUT_MS,
  retryDelayMs = PDF_RETRY_DELAY_MS,
  delayImpl = delay,
  onRetry = () => {},
} = {}) {
  assertPositiveInteger(attempts, 'PDF export attempts');
  assertPositiveInteger(timeoutMs, 'PDF export timeout');
  const source = new URL(`assets/diagrams/interlocks-documented/${diagram.id}-documented.drawio`, root);
  const destination = new URL(`assets/diagrams/interlocks-documented/${diagram.id}-documented.pdf`, root);
  const form = exportForm(diagram, await readFileImpl(source, 'utf8'));
  let lastError;
  let pdf;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response;
    try {
      response = await fetchImpl(EXPORT_URL, {
        method: 'POST',
        headers: {
          Origin: 'https://app.diagrams.net',
          Referer: 'https://app.diagrams.net/',
          Accept: 'application/pdf',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: form,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        throw new Error(`conversion endpoint returned HTTP ${response.status}`);
      }
      pdf = Buffer.from(await response.arrayBuffer());
      if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
        throw new Error('conversion endpoint returned a non-PDF payload');
      }
      break;
    } catch (error) {
      await cancelResponse(response);
      pdf = undefined;
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < attempts) {
        onRetry(`${diagram.id}: PDF export attempt ${attempt}/${attempts} failed: ${lastError.message}`);
        await delayImpl(retryDelayMs);
      }
    }
  }

  if (!pdf) {
    throw new Error(`${diagram.id}: Draw.io PDF export failed after ${attempts} attempts: ${lastError?.message || 'unknown error'}`, {
      cause: lastError,
    });
  }
  await writeFileImpl(destination, pdf);
  return { id: diagram.id, bytes: pdf.length };
}

export async function main() {
  const catalog = JSON.parse(await readFile(new URL('assets/interlocks/catalog.json', root), 'utf8'));
  const diagrams = selectDiagrams(catalog.diagrams, process.argv.slice(2));
  for (const diagram of diagrams) {
    const { id, bytes } = await exportPoster(diagram, { onRetry: message => console.warn(message) });
    console.log(`${id}: ${bytes} byte vector PDF`);
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
