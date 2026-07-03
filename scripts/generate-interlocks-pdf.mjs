import { readFile, writeFile } from 'node:fs/promises';
import { selectDiagrams } from './interlock-pdf-selection.mjs';

const exportUrl = 'https://convert.diagrams.net/node/export';
const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('assets/interlocks/catalog.json', root), 'utf8'));
const requestedIds = process.argv.slice(2);
const diagrams = selectDiagrams(catalog.diagrams, requestedIds);

async function exportPoster(diagram) {
  const source = new URL(`assets/diagrams/interlocks-documented/${diagram.id}-documented.drawio`, root);
  const destination = new URL(`assets/diagrams/interlocks-documented/${diagram.id}-documented.pdf`, root);
  const form = new URLSearchParams({
    format: 'pdf',
    filename: `${diagram.id}-documented.pdf`,
    bg: '#ffffff',
    base64: '0',
    embedXml: '0',
    scale: '1',
    border: '0',
    crop: '0',
    shadows: '0',
    xml: await readFile(source, 'utf8'),
  });
  const response = await fetch(exportUrl, {
    method: 'POST',
    headers: {
      Origin: 'https://app.diagrams.net',
      Referer: 'https://app.diagrams.net/',
      Accept: 'application/pdf',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form,
    signal: AbortSignal.timeout(120_000),
  });
  const pdf = Buffer.from(await response.arrayBuffer());

  if (!response.ok || !pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new Error(`${diagram.id}: Draw.io PDF export failed (${response.status})`);
  }

  await writeFile(destination, pdf);
  return { id: diagram.id, bytes: pdf.length };
}

for (const diagram of diagrams) {
  const { id, bytes } = await exportPoster(diagram);
  console.log(`${id}: ${bytes} byte vector PDF`);
}
