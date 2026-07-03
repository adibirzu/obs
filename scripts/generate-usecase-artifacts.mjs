import { mkdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
await import(new URL('../assets/interlocks/workflow-governance.js', import.meta.url));
await import(new URL('../assets/interlocks/network-drilldowns.js', import.meta.url));
await import(new URL('../assets/interlocks/domain-drilldowns.js', import.meta.url));

const catalog = {
  network: globalThis.NETWORK_DRILLDOWNS,
  ...globalThis.DOMAIN_DRILLDOWNS,
};
const catalogMetadata = JSON.parse(await readFile(new URL('../assets/interlocks/catalog.json', import.meta.url), 'utf8')).meta;
const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : `${catalogMetadata.updated}T00:00:00.000Z`;
const output = new URL('../assets/diagrams/usecases/', import.meta.url);

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
}

function textCell(id, value, x, y, width, height, style = '') {
  return `<mxCell id="${id}" value="${escapeXml(value)}" style="${style}" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`;
}

function box(id, title, values, x, color) {
  const rows = values.map((value) => `• ${value}`).join('<br>');
  return textCell(id, `<b>${title}</b><br><br>${rows}`, x, 290, 380, 210, `rounded=1;arcSize=10;whiteSpace=wrap;html=1;strokeColor=${color};fillColor=#FFFFFF;fontColor=#102A43;align=left;verticalAlign=top;spacing=18;fontSize=16;`);
}

function arrow(id, source, target) {
  return `<mxCell id="${id}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeWidth=2;strokeColor=#145CA8;" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry"/></mxCell>`;
}

function buildDrawio(domain, item) {
  const cells = [
    textCell('title', `${domain.toUpperCase()} INTERLOCK · ${item.title}`, 70, 55, 1260, 46, 'html=1;strokeColor=none;fillColor=none;fontSize=28;fontStyle=1;fontColor=#102A43;align=left;'),
    textCell('trigger', `Trigger · ${item.trigger}`, 70, 118, 1260, 48, 'html=1;strokeColor=none;fillColor=none;fontSize=15;fontColor=#52616B;align=left;'),
    box('sources', 'SOURCE EVIDENCE', item.sources, 70, '#C79200'),
    box('services', 'OBSERVABILITY HANDOFF', item.services, 510, '#145CA8'),
    box('outcome', 'OPERATIONAL OUTCOME', [item.outcome], 950, '#256D3F'),
    arrow('source-to-services', 'sources', 'services'),
    arrow('services-to-outcome', 'services', 'outcome'),
    textCell('steps', `<b>GUIDED RESPONSE</b><br><br>${item.steps.map((step, index) => `${index + 1}. ${step}`).join('<br><br>')}`, 70, 555, 1260, 240, 'rounded=1;arcSize=10;whiteSpace=wrap;html=1;strokeColor=#102A43;fillColor=#FFFFFF;fontColor=#102A43;align=left;verticalAlign=top;spacing=18;fontSize=16;'),
    textCell('prerequisites', `<b>SYSTEM PREREQUISITES</b><br><br>${item.prerequisites.map(value => `• ${value}`).join('<br>')}`, 70, 815, 610, 210, 'rounded=1;arcSize=10;whiteSpace=wrap;html=1;strokeColor=#52616B;fillColor=#FFFFFF;fontColor=#102A43;align=left;verticalAlign=top;spacing=18;fontSize=14;'),
    textCell('correlation', `<b>DISTRIBUTED CORRELATION KEYS</b><br><br>${item.correlationKeys.join(' · ')}`, 700, 815, 630, 100, 'rounded=1;arcSize=10;whiteSpace=wrap;html=1;strokeColor=#145CA8;fillColor=#FFFFFF;fontColor=#102A43;align=left;verticalAlign=top;spacing=18;fontSize=14;'),
    textCell('empty-result', `<b>EMPTY-RESULT CAVEAT</b><br><br>${item.emptyResult}`, 700, 935, 630, 90, 'rounded=1;arcSize=10;whiteSpace=wrap;html=1;strokeColor=#C79200;fillColor=#FFFDF5;fontColor=#102A43;align=left;verticalAlign=top;spacing=18;fontSize=14;'),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?><mxfile host="app.diagrams.net" type="device"><diagram id="${escapeXml(`${domain}-${item.id}`)}" name="${escapeXml(item.title)}"><mxGraphModel dx="1400" dy="1060" grid="1" gridSize="10" page="1" pageWidth="1400" pageHeight="1060"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells.join('')}</root></mxGraphModel></diagram></mxfile>`;
}

function textElement(id, text, x, y, width, height, fontSize = 20, color = '#102A43') {
  return { id, type: 'text', x, y, width, height, angle: 0, strokeColor: color, backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, opacity: 100, groupIds: [], frameId: null, index: null, roundness: null, seed: 1, version: 1, versionNonce: 1, isDeleted: false, boundElements: null, updated: 1, link: null, locked: false, text, fontSize, fontFamily: 5, textAlign: 'left', verticalAlign: 'top', containerId: null, originalText: text, autoResize: true, lineHeight: 1.25 };
}

function rectangle(id, x, y, width, height, color) {
  return { id, type: 'rectangle', x, y, width, height, angle: 0, strokeColor: color, backgroundColor: '#ffffff', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, opacity: 100, groupIds: [], frameId: null, index: null, roundness: { type: 3 }, seed: 1, version: 1, versionNonce: 1, isDeleted: false, boundElements: null, updated: 1, link: null, locked: false };
}

function buildExcalidraw(domain, item) {
  const columns = [
    ['SOURCE EVIDENCE', item.sources, 70, '#C79200'],
    ['OBSERVABILITY HANDOFF', item.services, 510, '#145CA8'],
    ['OPERATIONAL OUTCOME', [item.outcome], 950, '#256D3F'],
  ];
  const elements = [
    textElement('title', `${domain.toUpperCase()} INTERLOCK\n${item.title}`, 70, 55, 1260, 70, 28),
    textElement('trigger', `Trigger · ${item.trigger}`, 70, 140, 1260, 42, 15, '#52616B'),
  ];
  columns.forEach(([title, values, x, color], index) => {
    elements.push(rectangle(`box-${index}`, x, 290, 380, 210, color));
    elements.push(textElement(`heading-${index}`, title, x + 18, 312, 340, 26, 16, color));
    elements.push(textElement(`values-${index}`, values.map((value) => `• ${value}`).join('\n\n'), x + 18, 355, 340, 125, 14));
  });
  elements.push(rectangle('steps-box', 70, 555, 1260, 240, '#102A43'));
  elements.push(textElement('steps', `GUIDED RESPONSE\n\n${item.steps.map((step, index) => `${index + 1}. ${step}`).join('\n\n')}`, 95, 580, 1200, 190, 16));
  elements.push(rectangle('prerequisites-box', 70, 815, 610, 210, '#52616B'));
  elements.push(textElement('prerequisites', `SYSTEM PREREQUISITES\n\n${item.prerequisites.map(value => `• ${value}`).join('\n')}`, 90, 835, 570, 170, 14));
  elements.push(rectangle('correlation-box', 700, 815, 630, 100, '#145CA8'));
  elements.push(textElement('correlation', `DISTRIBUTED CORRELATION KEYS\n\n${item.correlationKeys.join(' · ')}`, 720, 835, 590, 70, 14));
  elements.push(rectangle('empty-result-box', 700, 935, 630, 90, '#C79200'));
  elements.push(textElement('empty-result', `EMPTY-RESULT CAVEAT\n\n${item.emptyResult}`, 720, 950, 590, 65, 13));
  return { type: 'excalidraw', version: 2, source: 'https://excalidraw.com', elements, appState: { viewBackgroundColor: '#ffffff', exportBackground: true, name: `${item.title} — ${domain}` }, files: {} };
}

await mkdir(output, { recursive: true });
const artifacts = [];
for (const [domain, useCases] of Object.entries(catalog)) {
  const directory = new URL(`${domain}/`, output);
  await mkdir(directory, { recursive: true });
  for (const item of useCases) {
    await Promise.all([
      writeFile(new URL(`${item.id}.drawio`, directory), buildDrawio(domain, item), 'utf8'),
      writeFile(new URL(`${item.id}.excalidraw`, directory), `${JSON.stringify(buildExcalidraw(domain, item), null, 2)}\n`, 'utf8'),
    ]);
    artifacts.push({ domain, id: item.id });
  }
}
await writeFile(new URL('manifest.json', output), `${JSON.stringify({ generatedAt, artifacts }, null, 2)}\n`, 'utf8');
console.log(`Generated ${artifacts.length} editable workflow artifact pairs.`);
