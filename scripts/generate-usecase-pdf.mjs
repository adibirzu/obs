import { mkdir, writeFile } from 'node:fs/promises';

await import(new URL('../assets/interlocks/workflow-governance.js', import.meta.url));
await import(new URL('../assets/interlocks/network-drilldowns.js', import.meta.url));
await import(new URL('../assets/interlocks/domain-drilldowns.js', import.meta.url));

const catalog = { network: globalThis.NETWORK_DRILLDOWNS, ...globalThis.DOMAIN_DRILLDOWNS };
const output = new URL('../assets/diagrams/usecases/', import.meta.url);

function escapePdf(value) {
  return String(value).replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7E]/g, '?');
}

function wrap(value, width = 48) {
  const words = String(value).split(/\s+/);
  return words.reduce((lines, word) => {
    const current = lines.at(-1);
    if (`${current} ${word}`.trim().length > width) return [...lines, word];
    return [...lines.slice(0, -1), `${current} ${word}`.trim()];
  }, ['']);
}

function roundedRect(x, y, width, height, radius, stroke, fill = null) {
  const control = radius * 0.5522847498;
  const commands = [
    `${x + radius} ${y} m`, `${x + width - radius} ${y} l`, `${x + width - radius + control} ${y} ${x + width} ${y + radius - control} ${x + width} ${y + radius} c`,
    `${x + width} ${y + height - radius} l`, `${x + width} ${y + height - radius + control} ${x + width - radius + control} ${y + height} ${x + width - radius} ${y + height} c`,
    `${x + radius} ${y + height} l`, `${x + radius - control} ${y + height} ${x} ${y + height - radius + control} ${x} ${y + height - radius} c`,
    `${x} ${y + radius} l`, `${x} ${y + radius - control} ${x + radius - control} ${y} ${x + radius} ${y} c`,
  ].join(' ');
  return `q ${stroke} RG 2 w${fill ? ` ${fill} rg` : ''} ${commands} ${fill ? 'B' : 'S'} Q`;
}

function section(title, values, x, color, baseY = 810) {
  const content = [`q ${color} RG 2 w 1 1 1 rg ${x} ${baseY} 380 190 re B Q`, `BT /F2 14 Tf ${color} rg ${x + 16} ${baseY + 162} Td (${escapePdf(title)}) Tj ET`];
  let y = baseY + 132;
  values.flatMap((value) => wrap(value, 38)).forEach((line) => {
    content.push(`BT /F1 12 Tf 0.06 0.16 0.26 rg ${x + 18} ${y} Td (${escapePdf(line)}) Tj ET`);
    y -= 17;
  });
  return content;
}

function governanceSection(title, values, { x, y, width, height, color, wrapAt = 72 }) {
  const content = [
    `q ${color} RG 2 w 1 1 1 rg ${x} ${y} ${width} ${height} re B Q`,
    `BT /F2 13 Tf ${color} rg ${x + 18} ${y + height - 28} Td (${escapePdf(title)}) Tj ET`,
  ];
  let lineY = y + height - 58;
  values.flatMap(value => wrap(value, wrapAt)).forEach(line => {
    content.push(`BT /F1 11 Tf 0.06 0.16 0.26 rg ${x + 18} ${lineY} Td (${escapePdf(line)}) Tj ET`);
    lineY -= 15;
  });
  return content;
}

function buildPdf(domain, item) {
  const content = [
    '0.96 0.96 0.96 rg 0 0 1400 1200 re f',
    'BT /F2 28 Tf 0.06 0.16 0.26 rg 70 1140 Td (' + escapePdf(`${domain.toUpperCase()} INTERLOCK - ${item.title}`) + ') Tj ET',
    'BT /F1 15 Tf 0.32 0.38 0.43 rg 70 1100 Td (' + escapePdf(`Trigger: ${item.trigger}`) + ') Tj ET',
    ...section('SOURCE EVIDENCE', item.sources, 70, '0.78 0.57 0'),
    ...section('OBSERVABILITY HANDOFF', item.services, 510, '0.08 0.36 0.66'),
    ...section('OPERATIONAL OUTCOME', [item.outcome], 950, '0.15 0.43 0.25'),
    'q 0.08 0.36 0.66 RG 2 w 450 905 m 490 905 l S 490 905 m 480 912 l S 490 905 m 480 898 l S Q',
    'q 0.08 0.36 0.66 RG 2 w 890 905 m 930 905 l S 930 905 m 920 912 l S 930 905 m 920 898 l S Q',
    'q 0.06 0.16 0.26 RG 2 w 1 1 1 rg 70 480 1260 270 re B Q',
    'BT /F2 14 Tf 0.06 0.16 0.26 rg 90 720 Td (GUIDED RESPONSE) Tj ET',
    ...governanceSection('SYSTEM PREREQUISITES', item.prerequisites.map(value => `- ${value}`), { x: 70, y: 60, width: 610, height: 380, color: '0.32 0.38 0.43', wrapAt: 76 }),
    ...governanceSection('DISTRIBUTED CORRELATION KEYS', [item.correlationKeys.join(' | ')], { x: 700, y: 260, width: 630, height: 180, color: '0.08 0.36 0.66', wrapAt: 84 }),
    ...governanceSection('EMPTY-RESULT CAVEAT', [item.emptyResult], { x: 700, y: 60, width: 630, height: 180, color: '0.78 0.57 0', wrapAt: 84 }),
  ];
  let y = 688;
  item.steps.flatMap((step, index) => wrap(`${index + 1}. ${step}`, 120)).forEach((line) => {
    content.push(`BT /F1 15 Tf 0.06 0.16 0.26 rg 95 ${y} Td (${escapePdf(line)}) Tj ET`);
    y -= 25;
  });
  const stream = content.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 1400 1200] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.7\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

for (const [domain, useCases] of Object.entries(catalog)) {
  const directory = new URL(`${domain}/`, output);
  await mkdir(directory, { recursive: true });
  await Promise.all(useCases.map((item) => writeFile(new URL(`${item.id}.pdf`, directory), buildPdf(domain, item))));
}
console.log('Generated 60 vector workflow PDFs.');
