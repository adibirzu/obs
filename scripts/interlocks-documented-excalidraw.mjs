const CANVAS = Object.freeze({ width: 3000, height: 4243 });
const COLORS = Object.freeze({
  navy: '#102A43',
  blue: '#145CA8',
  blueTint: '#EEF6FF',
  blueLine: '#8CB7E8',
  green: '#256D3F',
  greenTint: '#F0F8F2',
  greenLine: '#90C49F',
  ink: '#182230',
  muted: '#52606D',
  stoneTint: '#F7F6F4',
  stoneLine: '#C8C4BF',
  white: '#FFFFFF',
  workflow: '#6A3D9A',
});

const CONTROL_PLANE_ORDER = Object.freeze([
  'monitoring', 'logging', 'events', 'alarms', 'notifications', 'announcements',
  'logging-analytics', 'apm', 'stack-monitoring', 'operations-insights', 'resource-analytics', 'database-management',
  'cloud-advisor', 'cost-analysis', 'limits-quotas-budgets', 'tenancy-explorer', 'organization-management',
]);

const GLYPHS = Object.freeze({
  monitoring: 'M', logging: 'L', events: 'E', alarms: '!', notifications: 'N', announcements: 'A',
  'logging-analytics': 'LA', apm: 'AP', 'stack-monitoring': 'SM', 'operations-insights': 'OI',
  'resource-analytics': 'RA', 'database-management': 'DB', 'cloud-advisor': 'CA', 'cost-analysis': '$',
  'limits-quotas-budgets': 'LQ', 'tenancy-explorer': 'TE', 'organization-management': 'OM',
});

const shorten = (value, limit) => value.length <= limit ? value : `${value.slice(0, limit - 1).trimEnd()}…`;
const sourceIdFor = (catalog, serviceId) => {
  const index = catalog.services.findIndex(({ id }) => id === serviceId);
  return index < 0 ? 'DOC-00' : `DOC-${String(index + 1).padStart(2, '0')}`;
};

function baseElement(id, type, x, y, width, height, index) {
  return {
    id, type, x, y, width, height, angle: 0, strokeColor: COLORS.ink,
    backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 2,
    strokeStyle: 'solid', roughness: 0, opacity: 100, groupIds: [], frameId: null,
    roundness: type === 'rectangle' ? { type: 3 } : null,
    seed: 43000 + index * 7919, versionNonce: 71000 + index * 104729,
    version: 1, isDeleted: false, boundElements: null, updated: 1, link: null, locked: false,
  };
}

function addRectangle(elements, id, x, y, width, height, strokeColor, backgroundColor, link = null, strokeWidth = 2) {
  const element = baseElement(id, 'rectangle', x, y, width, height, elements.length);
  Object.assign(element, { strokeColor, backgroundColor, link, strokeWidth });
  elements.push(element);
  return element;
}

function addText(elements, id, text, x, y, width, height, fontSize = 18, color = COLORS.ink, textAlign = 'left') {
  const element = baseElement(id, 'text', x, y, width, height, elements.length);
  Object.assign(element, {
    strokeColor: color, text, fontSize, fontFamily: 5, textAlign,
    verticalAlign: 'middle', containerId: null, originalText: text, autoResize: false,
    lineHeight: 1.25, baseline: Math.round(fontSize * 0.8),
  });
  elements.push(element);
  return element;
}

function addHeader(elements, id, title, x, y, width, height, color) {
  addRectangle(elements, `${id}-box`, x, y, width, height, color, color, null, 1);
  addText(elements, `${id}-text`, title, x + 14, y + 8, width - 28, height - 16, 20, COLORS.white, 'center');
}

function addDensePanel(elements, id, group, x, y, width, height, color, tint, index) {
  addRectangle(elements, `${id}-box`, x, y, width, height, color, tint, null, 1.5);
  addText(elements, `${id}-title`, `${index + 1}. ${group.title.toUpperCase()}`, x + 16, y + 10, width - 32, 34, 17, color);
  const midpoint = Math.ceil(group.items.length / 2);
  const left = group.items.slice(0, midpoint).map((item) => `• ${item}`).join('\n');
  const right = group.items.slice(midpoint).map((item) => `• ${item}`).join('\n');
  const bodyHeight = Math.max(44, height - 94);
  addText(elements, `${id}-items-a`, left, x + 18, y + 50, (width - 48) / 2, bodyHeight, 12.5, COLORS.ink);
  addText(elements, `${id}-items-b`, right, x + width / 2 + 6, y + 50, (width - 48) / 2, bodyHeight, 12.5, COLORS.ink);
  addText(elements, `${id}-signals`, `Signals · ${(group.signals ?? []).join(' · ')}`, x + 18, y + height - 38, width - 36, 28, 11.5, color);
}

function addLane(elements, id, records, x, y, width, height, color, reverse = false) {
  const gap = 12;
  const recordHeight = (height - gap * (records.length - 1)) / records.length;
  records.forEach((group, groupIndex) => {
    const labels = (group.signals ?? ['dashboard', 'alarm', 'evidence']).slice(0, 3);
    const startY = y + groupIndex * (recordHeight + gap) + Math.max(50, (recordHeight - labels.length * 36 - (labels.length - 1) * 9) / 2);
    labels.forEach((label, labelIndex) => {
      const chipY = startY + labelIndex * 45;
      addRectangle(elements, `${id}-${groupIndex}-${labelIndex}-box`, x + 8, chipY, width - 16, 36, color, COLORS.white, null, 1);
      addText(elements, `${id}-${groupIndex}-${labelIndex}-text`, reverse ? `${shorten(label, 20)}  →` : `→  ${shorten(label, 20)}`, x + 15, chipY + 4, width - 30, 28, 11, color, 'center');
    });
  });
}

function addServiceGroups(elements, catalog, diagram, x, y, width, height) {
  const byId = new Map(catalog.services.map((service) => [service.id, service]));
  const services = CONTROL_PLANE_ORDER.map((id) => byId.get(id)).filter(Boolean);
  const categories = ['Core observability', 'Advanced analytics', 'Governance and optimization'];
  const groups = categories.map((category) => ({ category, services: services.filter((service) => service.category === category) }));
  const gap = 12;
  const groupHeight = (height - gap * (groups.length - 1)) / groups.length;

  groups.forEach((group, groupIndex) => {
    const groupY = y + groupIndex * (groupHeight + gap);
    addRectangle(elements, `${diagram.id}-control-${groupIndex}-box`, x, groupY, width, groupHeight, COLORS.blueLine, COLORS.blueTint, null, 1.5);
    addText(elements, `${diagram.id}-control-${groupIndex}-title`, `${String.fromCharCode(65 + groupIndex)}. ${group.category.toUpperCase()}`, x + 16, groupY + 10, width - 32, 34, 17, COLORS.blue);
    const serviceGap = 7;
    const serviceHeight = (groupHeight - 58 - serviceGap * (group.services.length - 1)) / group.services.length;
    group.services.forEach((service, serviceIndex) => {
      const serviceY = groupY + 50 + serviceIndex * (serviceHeight + serviceGap);
      const sourceId = sourceIdFor(catalog, service.id);
      addRectangle(elements, `${diagram.id}-service-${service.id}-box`, x + 14, serviceY, width - 28, serviceHeight, COLORS.blueLine, COLORS.white, service.docs, 1.25);
      addRectangle(elements, `${diagram.id}-service-${service.id}-glyph`, x + 28, serviceY + (serviceHeight - 40) / 2, 40, 40, COLORS.blue, COLORS.blue, service.docs, 1);
      addText(elements, `${diagram.id}-service-${service.id}-glyph-text`, GLYPHS[service.id] ?? service.id.slice(0, 2).toUpperCase(), x + 31, serviceY + (serviceHeight - 34) / 2, 34, 34, 12, COLORS.white, 'center');
      addText(elements, `${diagram.id}-service-${service.id}-name`, service.name, x + 82, serviceY + 7, width - 270, 25, 14.5, COLORS.navy);
      addText(elements, `${diagram.id}-service-${service.id}-summary`, shorten(service.summary, 112), x + 82, serviceY + 34, width - 118, Math.max(24, serviceHeight - 41), 11.5, COLORS.muted);
      addRectangle(elements, `${diagram.id}-service-${service.id}-doc-box`, x + width - 166, serviceY + 7, 132, 24, COLORS.blue, COLORS.blue, service.docs, 1);
      addText(elements, `${diagram.id}-service-${service.id}-doc-text`, `${sourceId} ↗`, x + width - 158, serviceY + 9, 116, 20, 10.5, COLORS.white, 'center');
    });
  });
}

function addExamples(elements, diagram, pipelines, y) {
  addHeader(elements, `${diagram.id}-examples-header`, 'INTERLOCK EXAMPLES · REFERENCE ARCHITECTURE INFERENCE', 60, y, 2880, 58, diagram.accent);
  const gap = 14;
  const width = (2880 - gap * (diagram.examples.length - 1)) / diagram.examples.length;
  diagram.examples.forEach((example, index) => {
    const x = 60 + index * (width + gap);
    addRectangle(elements, `${diagram.id}-example-${index}-box`, x, y + 72, width, 360, diagram.accent, COLORS.white, null, 1.5);
    addText(elements, `${diagram.id}-example-${index}-title`, `${index + 1}. ${example.toUpperCase()}`, x + 16, y + 88, width - 32, 52, 16, diagram.accent, 'center');
    const steps = pipelines?.[index] ?? ['Source signal', 'Collect evidence', 'Correlate context', 'Alert owner', 'Action and evidence'];
    steps.slice(0, 5).forEach((step, stepIndex) => {
      const stepY = y + 152 + stepIndex * 51;
      addRectangle(elements, `${diagram.id}-example-${index}-step-${stepIndex}-box`, x + 18, stepY, width - 36, 40, stepIndex === 2 ? COLORS.workflow : diagram.accent, stepIndex === 2 ? '#F7F2FC' : COLORS.white, null, 1);
      addText(elements, `${diagram.id}-example-${index}-step-${stepIndex}-text`, `${stepIndex + 1}  ${shorten(step, 34)}`, x + 28, stepY + 5, width - 56, 30, 12, COLORS.ink, 'center');
    });
  });
}

function addReferencePanels(elements, diagram, y) {
  const gap = 16;
  const width = (2880 - gap * 3) / 4;
  const panels = [
    ['HOW IT WORKS', ['Collect domain signals', 'Normalize and enrich context', 'Correlate services and changes', 'Alert accountable owners', 'Validate operational action']],
    ['KEY COMPONENTS', ['Foundation services', 'Observability control plane', 'Automation and integrations', 'Governance context', 'Outcome dashboards']],
    ['REFERENCE OPERATING LOOP', diagram.workflows],
    ['INTERLOCK OUTCOMES', diagram.outcomeGroups.flatMap((group) => group.items).slice(0, 8)],
  ];
  panels.forEach(([title, items], index) => {
    const x = 60 + index * (width + gap);
    const color = index === 2 ? COLORS.workflow : COLORS.navy;
    addRectangle(elements, `${diagram.id}-reference-${index}-box`, x, y, width, 370, color, index === 2 ? '#F7F2FC' : COLORS.stoneTint, null, 1.5);
    addText(elements, `${diagram.id}-reference-${index}-title`, title, x + 18, y + 16, width - 36, 36, 18, color);
    addText(elements, `${diagram.id}-reference-${index}-body`, items.slice(0, 9).map((item, itemIndex) => `${index === 2 ? `${itemIndex + 1}.` : '✓'} ${item}`).join('\n'), x + 22, y + 64, width - 44, 286, 13.5, index === 2 ? COLORS.workflow : COLORS.ink);
  });
}

function addEvidenceAndSources(elements, catalog, diagram, y) {
  addHeader(elements, `${diagram.id}-evidence-header`, 'SIGNAL TYPES, EVIDENCE & OFFICIAL DOCUMENTATION', 60, y, 2880, 56, COLORS.navy);
  const evidence = [
    ['METRICS', 'health · latency · utilization · capacity'],
    ['LOGS & FINDINGS', 'service · custom · traffic · security'],
    ['EVENTS & CHANGES', 'lifecycle · policy · configuration · drift'],
    ['DIAGNOSTICS', 'path · topology · traces · root cause'],
    ['ACTIONS & EVIDENCE', 'alarms · reports · runbooks · validation'],
  ];
  const gap = 14;
  const width = (2880 - gap * 4) / 5;
  evidence.forEach(([title, body], index) => {
    const x = 60 + index * (width + gap);
    const color = diagram.legend[index % diagram.legend.length].color;
    addRectangle(elements, `${diagram.id}-evidence-${index}-box`, x, y + 70, width, 132, color, COLORS.white, null, 1.25);
    addText(elements, `${diagram.id}-evidence-${index}-title`, title, x + 16, y + 84, width - 32, 34, 17, color, 'center');
    addText(elements, `${diagram.id}-evidence-${index}-body`, body, x + 16, y + 124, width - 32, 58, 12.5, COLORS.ink, 'center');
  });

  addText(elements, `${diagram.id}-sources-title`, 'OFFICIAL SERVICE SOURCES · click any DOC card', 60, y + 218, 2880, 34, 15, COLORS.blue, 'center');
  const byId = new Map(catalog.services.map((service) => [service.id, service]));
  const services = diagram.serviceRefs.map((serviceId) => byId.get(serviceId)).filter(Boolean);
  const columns = 11;
  const chipGap = 10;
  const chipWidth = (2880 - chipGap * (columns - 1)) / columns;
  services.forEach((service, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = 60 + column * (chipWidth + chipGap);
    const chipY = y + 258 + row * 66;
    const sourceId = sourceIdFor(catalog, service.id);
    addRectangle(elements, `${diagram.id}-source-doc-${service.id}-box`, x, chipY, chipWidth, 56, COLORS.blueLine, COLORS.white, service.docs, 1);
    addText(elements, `${diagram.id}-source-doc-${service.id}-text`, `${sourceId} · ${shorten(service.name, 22)} ↗`, x + 8, chipY + 7, chipWidth - 16, 42, 10.5, COLORS.blue, 'center');
  });
}

export function buildDocumentedExcalidrawPoster(catalog, diagram, pipelines = []) {
  const elements = [];
  addText(elements, `${diagram.id}-documented-title`, diagram.title, 80, 34, 2840, 72, 42, COLORS.navy, 'center');
  addText(elements, `${diagram.id}-documented-subtitle`, diagram.subtitle, 140, 112, 2720, 52, 20, COLORS.blue, 'center');
  addRectangle(elements, `${diagram.id}-purpose-box`, 60, 182, 2880, 142, COLORS.stoneLine, COLORS.white, null, 1.5);
  addText(elements, `${diagram.id}-purpose-label`, 'PURPOSE', 86, 200, 150, 34, 16, COLORS.blue);
  addText(elements, `${diagram.id}-purpose-text`, diagram.purpose, 240, 198, 2660, 106, 16.5, COLORS.ink);
  addRectangle(elements, `${diagram.id}-basis-box`, 60, 342, 2880, 52, COLORS.blueLine, '#F4F8FC', null, 1);
  addText(elements, `${diagram.id}-basis-text`, 'OFFICIAL ORACLE DOCUMENTATION · DOC badges open primary sources     |     REFERENCE ARCHITECTURE INFERENCE · interlock flows are independent design guidance, not product guarantees', 78, 349, 2844, 38, 13.5, COLORS.navy, 'center');

  addHeader(elements, `${diagram.id}-source-header`, 'OCI FOUNDATION & SIGNAL SOURCES', 60, 420, 770, 72, diagram.accent);
  addHeader(elements, `${diagram.id}-signal-header`, 'TELEMETRY & SIGNAL FLOW', 840, 420, 180, 72, diagram.accent);
  addHeader(elements, `${diagram.id}-control-header`, 'OCI OBSERVABILITY & MANAGEMENT CONTROL PLANE', 1030, 420, 940, 72, COLORS.blue);
  addHeader(elements, `${diagram.id}-action-header`, 'INSIGHTS & ACTIONS FLOW', 1980, 420, 180, 72, COLORS.green);
  addHeader(elements, `${diagram.id}-outcome-header`, 'OPERATIONS, GOVERNANCE & ENGINEERING OUTCOMES', 2170, 420, 770, 72, COLORS.green);

  const stackY = 510;
  const stackHeight = 2000;
  const sourceGap = 12;
  const sourceHeight = (stackHeight - sourceGap * (diagram.sourceGroups.length - 1)) / diagram.sourceGroups.length;
  diagram.sourceGroups.forEach((group, index) => addDensePanel(elements, `${diagram.id}-source-${index}`, group, 60, stackY + index * (sourceHeight + sourceGap), 770, sourceHeight, diagram.accent, '#FFFCF5', index));
  addLane(elements, `${diagram.id}-signal-lane`, diagram.sourceGroups, 840, stackY, 180, stackHeight, diagram.accent);
  addServiceGroups(elements, catalog, diagram, 1030, stackY, 940, stackHeight);
  addLane(elements, `${diagram.id}-action-lane`, diagram.outcomeGroups, 1980, stackY, 180, stackHeight, COLORS.green, true);
  const outcomeGap = 12;
  const outcomeHeight = (stackHeight - outcomeGap * (diagram.outcomeGroups.length - 1)) / diagram.outcomeGroups.length;
  diagram.outcomeGroups.forEach((group, index) => addDensePanel(elements, `${diagram.id}-outcome-${index}`, group, 2170, stackY + index * (outcomeHeight + outcomeGap), 770, outcomeHeight, COLORS.green, COLORS.greenTint, index));

  addRectangle(elements, `${diagram.id}-correlation-box`, 60, 2530, 2880, 64, COLORS.stoneLine, COLORS.stoneTint, null, 1);
  addText(elements, `${diagram.id}-correlation-text`, 'CROSS-DOMAIN CORRELATION · identity · network · security · workload · topology · ownership · cost · lifecycle', 80, 2540, 2840, 44, 15, COLORS.navy, 'center');
  addExamples(elements, diagram, pipelines, 2612);
  addReferencePanels(elements, diagram, 3064);
  addEvidenceAndSources(elements, catalog, diagram, 3452);
  addText(elements, `${diagram.id}-footer`, 'DOCUMENTED EDITION · 3000 × 4243 editable vector poster · official sources verified 2026-06-30 · independent community reference', 60, 4166, 2880, 44, 14, COLORS.muted, 'center');

  return {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements,
    appState: {
      viewBackgroundColor: '#ffffff',
      exportBackground: true,
      gridSize: 20,
      name: `${diagram.title} — Documented Edition`,
    },
    files: {},
  };
}

export { CANVAS as DOCUMENTED_EXCALIDRAW_CANVAS };
