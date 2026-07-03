import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { buildDocumentedExcalidrawPoster } from './interlocks-documented-excalidraw.mjs';

const PAGE = { width: 2400, height: 3394, margin: 50 };
const DRAWIO_SCALE = 1.25;
const OUTPUT_PAGE = { width: 3000, height: 4243 };
const COLORS = {
  navy: '#102A43', blue: '#145CA8', blueTint: '#EEF6FF', blueLine: '#8CB7E8',
  green: '#256D3F', greenTint: '#F0F8F2', greenLine: '#90C49F',
  stone: '#5F5B57', stoneTint: '#F7F6F4', stoneLine: '#C8C4BF',
  ink: '#182230', muted: '#52606D', white: '#FFFFFF', workflow: '#6A3D9A',
};

const esc = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;');

const textLines = (items, limit = items.length) => items.slice(0, limit).map((item) => `• ${item}`).join('&#xa;');
const scaled = (value) => Math.round(value * DRAWIO_SCALE * 100) / 100;
const scaleStyle = (style) => style
  .replace(/(fontSize|spacing|spacingTop|spacingLeft|spacingRight|strokeWidth)=([0-9.]+)/g, (_, key, value) => `${key}=${scaled(Number(value))}`);

class Graph {
  constructor(pageId) {
    this.pageId = pageId;
    this.cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
    this.sequence = 0;
  }

  id(prefix) {
    this.sequence += 1;
    return `${this.pageId}-${prefix}-${this.sequence}`;
  }

  vertex({ id = this.id('v'), value = '', x, y, w, h, style, link, tooltip }) {
    const linkAttribute = link ? ` link="${esc(link)}"` : '';
    const tooltipAttribute = tooltip ? ` tooltip="${esc(tooltip)}"` : '';
    this.cells.push(`<mxCell id="${esc(id)}" value="${esc(value)}" style="${scaleStyle(style)}" vertex="1" parent="1"${linkAttribute}${tooltipAttribute}><mxGeometry x="${scaled(x)}" y="${scaled(y)}" width="${scaled(w)}" height="${scaled(h)}" as="geometry"/></mxCell>`);
    return id;
  }

  edge({ id = this.id('e'), source, target, value = '', color = COLORS.blue, dashed = false }) {
    const style = `edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeWidth=2;strokeColor=${color};fontColor=${color};fontSize=11;labelBackgroundColor=#FFFFFF;${dashed ? 'dashed=1;' : ''}`;
    this.cells.push(`<mxCell id="${esc(id)}" value="${esc(value)}" style="${scaleStyle(style)}" edge="1" parent="1" source="${esc(source)}" target="${esc(target)}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
    return id;
  }

  xml() {
    return this.cells.join('');
  }
}

const styles = {
  title: `text;html=1;align=center;verticalAlign=middle;fontFamily=Georgia;fontStyle=1;fontSize=46;fontColor=${COLORS.navy};whiteSpace=wrap;`,
  subtitle: `text;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=21;fontColor=${COLORS.blue};whiteSpace=wrap;`,
  purpose: `rounded=1;arcSize=8;whiteSpace=wrap;html=1;align=left;verticalAlign=middle;spacing=18;fontFamily=Arial;fontSize=16;fontColor=${COLORS.ink};fillColor=#FFFFFF;strokeColor=${COLORS.stoneLine};strokeWidth=1.5;`,
  header: (fill) => `rounded=1;arcSize=8;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=20;fontColor=#FFFFFF;fillColor=${fill};strokeColor=${fill};`,
  panel: (fill, stroke, font = COLORS.ink) => `rounded=1;arcSize=6;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingTop=42;spacingLeft=16;spacingRight=14;fontFamily=Arial;fontSize=15;fontColor=${font};fillColor=${fill};strokeColor=${stroke};strokeWidth=1.5;`,
  panelTitle: (color) => `text;html=1;align=left;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=17;fontColor=${color};whiteSpace=wrap;`,
  service: `rounded=1;arcSize=7;whiteSpace=wrap;html=1;align=left;verticalAlign=middle;spacingLeft=16;spacingRight=12;fontFamily=Arial;fontStyle=1;fontSize=15;fontColor=${COLORS.navy};fillColor=#FFFFFF;strokeColor=${COLORS.blueLine};strokeWidth=1.4;`,
  note: `text;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontSize=14;fontColor=${COLORS.muted};whiteSpace=wrap;`,
};

function addHeader(graph, diagram) {
  graph.vertex({ value: diagram.title, x: PAGE.margin, y: 30, w: PAGE.width - PAGE.margin * 2, h: 68, style: styles.title });
  graph.vertex({ value: diagram.subtitle, x: 100, y: 100, w: PAGE.width - 200, h: 48, style: styles.subtitle });

  const legendW = (PAGE.width - PAGE.margin * 2 - 10 * (diagram.legend.length - 1)) / diagram.legend.length;
  diagram.legend.forEach((item, index) => {
    graph.vertex({
      value: item.label, x: PAGE.margin + index * (legendW + 10), y: 160, w: legendW, h: 54,
      style: `rounded=1;arcSize=8;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=11;fontColor=${COLORS.ink};fillColor=#FFFFFF;strokeColor=${item.color};strokeWidth=2;`,
    });
  });
  graph.vertex({ value: `PURPOSE  ·  ${diagram.purpose}`, x: PAGE.margin, y: 230, w: PAGE.width - PAGE.margin * 2, h: 82, style: styles.purpose });
}

function addColumnHeader(graph, value, x, y, w, fill) {
  return graph.vertex({ value, x, y, w, h: 64, style: styles.header(fill) });
}

function addGroupStack(graph, groups, { x, y, w, h, fill, stroke, titleColor }) {
  const gap = 12;
  const itemH = (h - gap * (groups.length - 1)) / groups.length;
  const ids = [];
  groups.forEach((group, index) => {
    const top = y + index * (itemH + gap);
    const id = graph.vertex({ value: `${textLines(group.items, 5)}${group.signals ? `&#xa;&#xa;Signals · ${group.signals.join(' · ')}` : ''}`, x, y: top, w, h: itemH, style: styles.panel(fill, stroke) });
    graph.vertex({ value: `${index + 1}. ${group.title}`, x: x + 12, y: top + 7, w: w - 24, h: 28, style: styles.panelTitle(titleColor) });
    ids.push(id);
  });
  return ids;
}

function centralServices(catalog, diagram) {
  const byId = new Map(catalog.services.map((service) => [service.id, service]));
  const controlPlaneOrder = [
    'monitoring', 'logging', 'events', 'alarms', 'notifications', 'announcements',
    'logging-analytics', 'apm', 'stack-monitoring', 'operations-insights', 'resource-analytics', 'database-management',
    'cloud-advisor', 'cost-analysis', 'limits-quotas-budgets', 'tenancy-explorer', 'organization-management',
  ];
  return controlPlaneOrder.map((id) => byId.get(id)).filter(Boolean);
}

function addControlPlane(graph, catalog, diagram, { x, y, w, h }) {
  const services = centralServices(catalog, diagram);
  const gap = 9;
  const serviceH = Math.min(68, (h - gap * (services.length - 1)) / services.length);
  const ids = [];
  services.forEach((service, index) => {
    const top = y + index * (serviceH + gap);
    const id = graph.vertex({ value: `${service.name}&#xa;${service.summary}`, x, y: top, w, h: serviceH, style: styles.service });
    ids.push(id);
  });
  return ids;
}

function addWorkflow(graph, diagram, y) {
  graph.vertex({ value: 'REFERENCE OPERATING LOOP', x: PAGE.margin, y, w: PAGE.width - PAGE.margin * 2, h: 44, style: styles.header(COLORS.navy) });
  const gap = 12;
  const w = (PAGE.width - PAGE.margin * 2 - gap * (diagram.workflows.length - 1)) / diagram.workflows.length;
  const ids = diagram.workflows.map((workflow, index) => graph.vertex({
    value: `${index + 1}&#xa;${workflow.toUpperCase()}`,
    x: PAGE.margin + index * (w + gap), y: y + 58, w, h: 92,
    style: `ellipse;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=12;fontColor=#FFFFFF;fillColor=${index % 2 ? COLORS.workflow : COLORS.blue};strokeColor=#FFFFFF;strokeWidth=3;`,
  }));
  ids.slice(0, -1).forEach((id, index) => graph.edge({ source: id, target: ids[index + 1], color: diagram.accent }));
}

function addExamples(graph, diagram, y) {
  graph.vertex({ value: 'INTERLOCK EXAMPLES', x: PAGE.margin, y, w: PAGE.width - PAGE.margin * 2, h: 44, style: styles.header(diagram.accent) });
  const gap = 14;
  const w = (PAGE.width - PAGE.margin * 2 - gap * (diagram.examples.length - 1)) / diagram.examples.length;
  diagram.examples.forEach((example, index) => {
    graph.vertex({ value: `${index + 1}. ${example}&#xa;&#xa;Signal → correlate → alert → action → evidence`, x: PAGE.margin + index * (w + gap), y: y + 58, w, h: 112, style: styles.panel('#FFFFFF', diagram.accent) });
  });
}

function addBottomPanels(graph, diagram, y) {
  const gap = 16;
  const w = (PAGE.width - PAGE.margin * 2 - gap * 3) / 4;
  const panels = [
    ['HOW IT WORKS', 'Collect domain telemetry → normalize signals → correlate context → alert accountable owners → validate the response.'],
    ['KEY CONTEXT', 'Time · resource · compartment · tenancy · region · tags · owner · service · environment · business unit'],
    ['DESIGN PRINCIPLES', 'Observable from day one · least privilege · standard schemas · actionable alerts · evidence by design · owned runbooks'],
    ['DELIVERED OUTCOME', diagram.outcomeGroups.flatMap((group) => group.items).slice(0, 5).join(' · ')],
  ];
  panels.forEach(([title, body], index) => {
    const x = PAGE.margin + index * (w + gap);
    graph.vertex({ value: body, x, y, w, h: 176, style: styles.panel(COLORS.stoneTint, COLORS.stoneLine) });
    graph.vertex({ value: title, x: x + 12, y: y + 8, w: w - 24, h: 28, style: styles.panelTitle(COLORS.navy) });
  });
}

const compactCellStyle = (stroke, fill = '#FFFFFF', color = COLORS.ink, align = 'left') => `rounded=1;arcSize=5;whiteSpace=wrap;html=1;align=${align};verticalAlign=middle;spacingLeft=10;spacingRight=8;fontFamily=Arial;fontSize=14;fontColor=${color};fillColor=${fill};strokeColor=${stroke};strokeWidth=1;`;
const shorten = (value, limit) => value.length <= limit ? value : `${value.slice(0, limit - 1).trimEnd()}…`;
const SERVICE_GLYPHS = Object.freeze({
  monitoring: 'M', logging: 'L', events: 'E', alarms: '!', notifications: 'N', announcements: 'A',
  'logging-analytics': 'LA', apm: 'AP', 'stack-monitoring': 'ST', 'operations-insights': 'OI',
  'resource-analytics': 'RA', 'database-management': 'DB', 'cloud-advisor': 'CA', 'cost-analysis': '$',
  'limits-quotas-budgets': 'LQ', 'tenancy-explorer': 'TE', 'organization-management': 'OM',
});
const serviceGlyph = (id) => SERVICE_GLYPHS[id] ?? id.slice(0, 2).toUpperCase();
const sourceIdFor = (catalog, serviceId) => {
  const index = catalog.services.findIndex(({ id }) => id === serviceId);
  return index < 0 ? 'DOC-00' : `DOC-${String(index + 1).padStart(2, '0')}`;
};

const SUPPLEMENTAL_SOURCES = Object.freeze([
  { id: 'REF-01', title: 'Monitoring Overview', officialUrl: 'https://docs.oracle.com/en-us/iaas/Content/Monitoring/Concepts/monitoringoverview.htm' },
  { id: 'REF-02', title: 'Custom Logs', officialUrl: 'https://docs.oracle.com/en-us/iaas/Content/Logging/Concepts/custom_logs.htm' },
  { id: 'REF-03', title: 'Connector Hub Overview', officialUrl: 'https://docs.oracle.com/en-us/iaas/Content/connector-hub/overview.htm' },
  { id: 'REF-04', title: 'VCN Flow Logs', officialUrl: 'https://docs.oracle.com/iaas/Content/Network/Concepts/vcn-flow-logs.htm' },
  { id: 'REF-05', title: 'Security Zones Overview', officialUrl: 'https://docs.oracle.com/en-us/iaas/Content/security-zone/using/security-zones.htm' },
  { id: 'REF-06', title: 'OCI Landing Zones Overview', officialUrl: 'https://docs.oracle.com/en-us/iaas/Content/cloud-adoption-framework/oci-landing-zones-overview.htm' },
  { id: 'REF-07', title: 'Budgets', officialUrl: 'https://docs.oracle.com/en-us/iaas/Content/Billing/Concepts/budgetsoverview.htm' },
  { id: 'REF-08', title: 'Available Compartment Quotas', officialUrl: 'https://docs.oracle.com/en-us/iaas/Content/Quotas/Concepts/resourcequotas_topic-Available_Quotas_by_Service.htm' },
]);

export function buildDocumentationRegister(catalog, { verifiedOn = new Date().toISOString().slice(0, 10), linkRegistry = null } = {}) {
  const linkMetadata = new Map((linkRegistry?.links ?? []).map(link => [link.url, link]));
  const verification = url => {
    const link = linkMetadata.get(url);
    return link ? { httpStatus: link.statusCode, lastChecked: link.lastChecked } : {};
  };
  const sources = catalog.services.map((service, index) => ({
    id: `DOC-${String(index + 1).padStart(2, '0')}`,
    serviceId: service.id,
    serviceName: service.name,
    claimType: 'documented-service-capability',
    officialUrl: service.docs,
    documentedCapability: service.summary,
    architecturalInference: service.interlock,
    ...verification(service.docs),
    verifiedOn,
  }));
  const sourceIdsByService = new Map(sources.map(({ serviceId, id }) => [serviceId, id]));
  const diagramPatterns = catalog.diagrams.map((diagram) => ({
    diagramId: diagram.id,
    title: diagram.title,
    claimType: 'reference-architecture-inference',
    statement: diagram.purpose,
    sourceIds: diagram.serviceRefs.map((serviceId) => sourceIdsByService.get(serviceId)).filter(Boolean),
  }));

  return {
    schemaVersion: '1.0.0',
    edition: 'documented',
    verifiedOn,
    authority: 'Oracle Cloud Infrastructure documentation on docs.oracle.com and oracle.com',
    methodology: {
      documentedFacts: 'Service names and capability summaries are paraphrased from the linked official Oracle documentation.',
      architecturalInference: 'Interlock arrows, operating loops, outcomes, and implementation recommendations are independent reference-architecture inferences, not Oracle product guarantees.',
      maintenance: 'Recheck source URLs and service behavior before production design decisions because OCI capabilities and availability can change.',
    },
    sources,
    supplementalSources: SUPPLEMENTAL_SOURCES.map((source) => ({ ...source, ...verification(source.url), verifiedOn })),
    diagramPatterns,
  };
}

function addPosterHeader(graph, diagram, { documented = false } = {}) {
  graph.vertex({ value: diagram.title, x: PAGE.margin, y: 24, w: PAGE.width - PAGE.margin * 2, h: 76, style: styles.title });
  graph.vertex({ value: diagram.subtitle, x: 120, y: 102, w: PAGE.width - 240, h: 48, style: styles.subtitle });
  const legendGap = 10;
  const legendW = (PAGE.width - PAGE.margin * 2 - legendGap * (diagram.legend.length - 1)) / diagram.legend.length;
  diagram.legend.forEach((item, index) => {
    const x = PAGE.margin + index * (legendW + legendGap);
    graph.vertex({ value: '', x, y: 162, w: legendW, h: 62, style: `rounded=1;arcSize=5;html=1;fillColor=#FFFFFF;strokeColor=${item.color};strokeWidth=2;` });
    graph.vertex({ value: '', x: x + 14, y: 184, w: 18, h: 18, style: `rounded=0;html=1;fillColor=${item.color};strokeColor=${item.color};strokeWidth=1;` });
    graph.vertex({ value: item.label, x: x + 42, y: 170, w: legendW - 54, h: 46, style: `text;html=1;align=left;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=14;fontColor=${COLORS.ink};whiteSpace=wrap;` });
  });
  graph.vertex({ value: `PURPOSE  ·  ${diagram.purpose}`, x: PAGE.margin, y: 238, w: PAGE.width - PAGE.margin * 2, h: 104, style: styles.purpose });
  if (documented) {
    graph.vertex({
      value: 'OFFICIAL ORACLE DOCUMENTATION  ·  DOC badges open primary sources  ·  REFERENCE ARCHITECTURE INFERENCE  ·  interlock flows are independent design guidance, not product guarantees',
      x: PAGE.margin, y: 352, w: PAGE.width - PAGE.margin * 2, h: 36,
      style: `rounded=1;arcSize=5;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=12;fontColor=${COLORS.navy};fillColor=#F4F8FC;strokeColor=${COLORS.blueLine};strokeWidth=1;`,
      tooltip: 'Documentation register: assets/interlocks/documentation-sources.json',
    });
  }
}

function addDenseGroupStack(graph, groups, { x, y, w, h, fill, stroke, titleColor }) {
  const gap = 12;
  const groupH = (h - gap * (groups.length - 1)) / groups.length;
  return groups.map((group, groupIndex) => {
    const top = y + groupIndex * (groupH + gap);
    const panelId = graph.vertex({ value: '', x, y: top, w, h: groupH, style: styles.panel(fill, stroke) });
    graph.vertex({ value: `${groupIndex + 1}. ${group.title.toUpperCase()}`, x: x + 14, y: top + 8, w: w - 28, h: 34, style: styles.panelTitle(titleColor) });
    const items = group.items.slice(0, 12);
    const columns = items.length > 5 ? 2 : 1;
    const rows = Math.ceil(items.length / columns);
    const itemGap = 6;
    const itemW = (w - 28 - itemGap * (columns - 1)) / columns;
    const itemH = Math.max(22, Math.min(48, (groupH - 62 - itemGap * Math.max(0, rows - 1)) / Math.max(1, rows)));
    items.forEach((item, itemIndex) => {
      const column = itemIndex % columns;
      const row = Math.floor(itemIndex / columns);
      const itemX = x + 14 + column * (itemW + itemGap);
      const itemY = top + 48 + row * (itemH + itemGap);
      graph.vertex({
        value: '', x: itemX, y: itemY, w: itemW, h: itemH,
        style: compactCellStyle(stroke, '#FFFFFF'),
      });
      const iconSize = Math.min(15, Math.max(10, itemH - 8));
      graph.vertex({
        value: '', x: itemX + 7, y: itemY + (itemH - iconSize) / 2, w: iconSize, h: iconSize,
        style: `ellipse;html=1;fillColor=${stroke};strokeColor=${stroke};strokeWidth=1;`,
      });
      graph.vertex({
        value: item, x: itemX + 28, y: itemY + 1, w: itemW - 34, h: itemH - 2,
        style: `text;html=1;align=left;verticalAlign=middle;fontFamily=Arial;fontSize=13;fontColor=${COLORS.ink};whiteSpace=wrap;`,
      });
    });
    return { id: panelId, top, h: groupH, group };
  });
}

function addControlPlaneDense(graph, catalog, diagram, { x, y, w, h, documented = false }) {
  const services = centralServices(catalog, diagram);
  const categories = ['Core observability', 'Advanced analytics', 'Governance and optimization'];
  const groups = categories.map((category) => ({ category, services: services.filter((service) => service.category === category) })).filter(({ services: entries }) => entries.length);
  const gap = 12;
  const groupH = (h - gap * (groups.length - 1)) / groups.length;
  const ids = [];
  groups.forEach(({ category, services: entries }, groupIndex) => {
    const top = y + groupIndex * (groupH + gap);
    graph.vertex({ value: '', x, y: top, w, h: groupH, style: styles.panel(COLORS.blueTint, COLORS.blueLine) });
    graph.vertex({ value: `${String.fromCharCode(65 + groupIndex)}. ${category.toUpperCase()}`, x: x + 14, y: top + 8, w: w - 28, h: 34, style: styles.panelTitle(COLORS.blue) });
    const serviceGap = 7;
    const serviceH = Math.min(84, (groupH - 54 - serviceGap * (entries.length - 1)) / entries.length);
    entries.forEach((service, serviceIndex) => {
      const serviceTop = top + 48 + serviceIndex * (serviceH + serviceGap);
      const sourceId = sourceIdFor(catalog, service.id);
      const id = graph.vertex({
        value: '', x: x + 14, y: serviceTop, w: w - 28, h: serviceH, style: styles.service,
        link: documented ? service.docs : undefined,
        tooltip: documented ? `${sourceId} · Official Oracle documentation · ${service.summary}` : undefined,
      });
      graph.vertex({
        id: `${diagram.id}-service-icon-${service.id}`,
        value: serviceGlyph(service.id), x: x + 26, y: serviceTop + Math.max(9, (serviceH - 38) / 2), w: 38, h: 38,
        style: `ellipse;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=13;fontColor=#FFFFFF;fillColor=${COLORS.blue};strokeColor=${COLORS.blue};strokeWidth=1;`,
      });
      graph.vertex({
        value: service.name, x: x + 76, y: serviceTop + 7, w: documented ? w - 178 : w - 108, h: 24,
        style: `text;html=1;align=left;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=15;fontColor=${COLORS.navy};whiteSpace=wrap;`,
      });
      if (documented) {
        graph.vertex({
          value: `${sourceId} ↗`, x: x + w - 86, y: serviceTop + 7, w: 60, h: 22,
          style: `rounded=1;arcSize=6;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=10;fontColor=#FFFFFF;fillColor=${COLORS.blue};strokeColor=${COLORS.blue};strokeWidth=1;`,
          link: service.docs,
          tooltip: `Open official Oracle documentation for ${service.name}`,
        });
      }
      graph.vertex({
        value: shorten(service.summary, 96), x: x + 76, y: serviceTop + 31, w: w - 108, h: Math.max(25, serviceH - 37),
        style: `text;html=1;align=left;verticalAlign=top;fontFamily=Arial;fontSize=12;fontColor=${COLORS.muted};whiteSpace=wrap;`,
      });
      ids.push(id);
    });
  });
  return ids;
}

function addSignalLane(graph, records, { x, w, title, color, reverse = false }) {
  graph.vertex({ value: title, x, y: 402, w, h: 62, style: styles.header(color) });
  const chips = [];
  records.forEach((record, recordIndex) => {
    const labels = (record.group.signals ?? ['dashboard', 'alarm', 'evidence']).slice(0, 3);
    const chipH = 34;
    const start = record.top + Math.max(50, (record.h - labels.length * chipH - (labels.length - 1) * 10) / 2);
    labels.forEach((label, labelIndex) => {
      const chip = graph.vertex({
        value: reverse ? `${label}  →` : `→  ${label}`, x: x + 6, y: start + labelIndex * (chipH + 10), w: w - 12, h: chipH,
        style: compactCellStyle(color, '#FFFFFF', color, 'center'),
      });
      chips.push(chip);
    });
  });
  return chips;
}

const EXAMPLE_PIPELINES = Object.freeze({
  network: [
    ['Load Balancer metrics', 'OCI Monitoring', 'Monitoring Alarms', 'OCI Notifications', 'NetOps response'],
    ['VPN / circuit state', 'OCI Monitoring', 'Tunnel alarm', 'Incident routing', 'Connectivity recovery'],
    ['Firewall / WAF logs', 'OCI Logging', 'Log Analytics', 'SecOps investigation', 'Policy evidence'],
    ['Path Analyzer / VTAP', 'Route diagnostics', 'Topology context', 'Operations dashboard', 'Validated remediation'],
    ['Network resource change', 'OCI Events', 'Functions / runbook', 'Post-change validation', 'Ticket and audit trail'],
  ],
  security: [
    ['Cloud Guard finding', 'OCI Events / Logging', 'Alarms and analytics', 'SecOps response', 'Remediation evidence'],
    ['IAM policy change', 'OCI Audit', 'Log Analytics', 'Governance review', 'Validated policy state'],
    ['Firewall / WAF logs', 'OCI Logging', 'Threat correlation', 'Incident response', 'Control evidence'],
    ['Vulnerability finding', 'Monitoring / Logging', 'Risk prioritization', 'Remediation workflow', 'Rescan validation'],
    ['Certificate lifecycle', 'Expiry event', 'OCI Alarm', 'Renewal runbook', 'Crypto readiness'],
  ],
  'iam-governance': [
    ['IAM policy change', 'OCI Audit event', 'Log Analytics', 'Governance alert', 'Compliance evidence'],
    ['Access review signal', 'Access Governance', 'Privilege analysis', 'Owner certification', 'Review evidence'],
    ['Compartment / tag drift', 'Resource inventory', 'Policy validation', 'Owner ticket', 'Baseline restored'],
    ['Budget / quota signal', 'Cost and limit telemetry', 'Threshold alarm', 'FinOps notification', 'Capacity decision'],
    ['Organization change', 'Tenancy metadata', 'Governance report', 'Executive review', 'Operating-model evidence'],
  ],
  'landing-zone': [
    ['Landing-zone blueprint', 'Baseline telemetry', 'Observability services', 'Readiness dashboard', 'Deployment evidence'],
    ['Terraform deployment', 'Audit / event signals', 'Drift analytics', 'Validation alarm', 'Baseline correction'],
    ['Network hub / DNS', 'Metrics and logs', 'Health alarms', 'Network readiness', 'Validated connectivity'],
    ['Workload onboarding', 'Telemetry inheritance', 'Service ownership', 'Production dashboard', 'Readiness evidence'],
    ['Sovereignty guardrail', 'Audit and policy state', 'Control validation', 'Compliance report', 'Evidence package'],
  ],
  'operations-lifecycle': [
    ['Service health signal', 'Metrics and logs', 'OCI Alarm', 'ITSM / ChatOps', 'Operations response'],
    ['Patch status', 'OS Management Hub', 'Compliance alarm', 'Fleet workflow', 'Patch evidence'],
    ['DR readiness signal', 'Replication health', 'Readiness alarm', 'DR runbook', 'Recovery evidence'],
    ['Cost / usage signal', 'Cost Analysis', 'Budget or quota alert', 'FinOps review', 'Optimization action'],
    ['Carbon / delivery signal', 'Operational telemetry', 'Trend insight', 'Owner notification', 'Sustainability report'],
  ],
});

function addInterlockExamplesDense(graph, diagram, y) {
  graph.vertex({ value: 'INTERLOCK EXAMPLES', x: PAGE.margin, y, w: PAGE.width - PAGE.margin * 2, h: 52, style: styles.header(diagram.accent) });
  const gap = 14;
  const w = (PAGE.width - PAGE.margin * 2 - gap * (diagram.examples.length - 1)) / diagram.examples.length;
  diagram.examples.forEach((example, index) => {
    const x = PAGE.margin + index * (w + gap);
    graph.vertex({ value: '', x, y: y + 66, w, h: 286, style: styles.panel('#FFFFFF', diagram.accent) });
    graph.vertex({ value: `${index + 1}. ${example.toUpperCase()}`, x: x + 14, y: y + 78, w: w - 28, h: 48, style: styles.panelTitle(diagram.accent) });
    const steps = EXAMPLE_PIPELINES[diagram.id]?.[index] ?? ['Source signal', 'OCI observability', 'Alarm / insight', 'Operational action', 'Evidence / outcome'];
    steps.forEach((step, stepIndex) => graph.vertex({
      value: `${stepIndex + 1}  ${step}`, x: x + 18, y: y + 136 + stepIndex * 39, w: w - 36, h: 31,
      style: compactCellStyle(stepIndex === 2 ? COLORS.workflow : diagram.accent, stepIndex === 2 ? '#F7F2FC' : '#FFFFFF', COLORS.ink, 'center'),
    }));
  });
}

function addReferencePanelsDense(graph, diagram, y, height = 410) {
  const gap = 16;
  const w = (PAGE.width - PAGE.margin * 2 - gap * 3) / 4;
  const panels = [
    ['HOW IT WORKS', ['Collect domain signals', 'Normalize and enrich context', 'Correlate services and changes', 'Alert accountable owners', 'Validate operational action']],
    ['KEY COMPONENTS', ['Foundation services', 'Observability control plane', 'Automation and integrations', 'Governance context', 'Outcome dashboards']],
    ['REFERENCE OPERATING MODEL', diagram.workflows],
    ['INTERLOCK OUTCOMES', diagram.outcomeGroups.flatMap((group) => group.items).slice(0, 8)],
  ];
  panels.forEach(([title, items], index) => {
    const x = PAGE.margin + index * (w + gap);
    graph.vertex({ value: '', x, y, w, h: height, style: styles.panel(index === 2 ? '#F7F2FC' : COLORS.stoneTint, index === 2 ? COLORS.workflow : COLORS.stoneLine) });
    graph.vertex({ value: title, x: x + 14, y: y + 12, w: w - 28, h: 40, style: styles.panelTitle(index === 2 ? COLORS.workflow : COLORS.navy) });
    items.slice(0, 9).forEach((item, itemIndex) => graph.vertex({
      value: index === 2 ? `${itemIndex + 1}. ${item}` : `✓ ${item}`,
      x: x + 18, y: y + 60 + itemIndex * Math.min(38, (height - 72) / Math.max(1, Math.min(9, items.length))), w: w - 36, h: Math.min(31, (height - 78) / Math.max(1, Math.min(9, items.length))),
      style: compactCellStyle(index === 2 ? COLORS.workflow : COLORS.stoneLine, '#FFFFFF', index === 2 ? COLORS.workflow : COLORS.ink),
    }));
  });
}

function addSignalEvidenceBand(graph, diagram, y, { documented = false } = {}) {
  graph.vertex({ value: documented ? 'SIGNAL TYPES & EVIDENCE  ·  DOCUMENTED CAPABILITIES + LABELED ARCHITECTURE INFERENCES' : 'SIGNAL TYPES & EVIDENCE', x: PAGE.margin, y, w: PAGE.width - PAGE.margin * 2, h: 48, style: styles.header(COLORS.navy) });
  const cards = [
    ['METRICS', 'health · latency · utilization · capacity'],
    ['LOGS & FINDINGS', 'audit · traffic · threat · workload'],
    ['EVENTS & CHANGES', 'lifecycle · policy · configuration · drift'],
    ['DIAGNOSTICS', 'path · topology · traces · root cause'],
    ['EVIDENCE & ACTIONS', 'alarms · reports · runbooks · remediation'],
  ];
  const gap = 14;
  const w = (PAGE.width - PAGE.margin * 2 - gap * 4) / 5;
  cards.forEach(([title, body], index) => {
    const color = diagram.legend[index % diagram.legend.length].color;
    const x = PAGE.margin + index * (w + gap);
    graph.vertex({ value: '', x, y: y + 58, w, h: 124, style: styles.panel('#FFFFFF', color) });
    graph.vertex({ value: `${title}&#xa;${body}`, x: x + 14, y: y + 70, w: w - 28, h: 94, style: styles.panelTitle(color) });
  });
}

function addDocumentationSourceChips(graph, catalog, diagram, y) {
  const byId = new Map(catalog.services.map((service) => [service.id, service]));
  const services = diagram.serviceRefs.map((serviceId) => byId.get(serviceId)).filter(Boolean);
  const columns = 17;
  const gap = 5;
  const width = (PAGE.width - PAGE.margin * 2 - gap * (columns - 1)) / columns;
  services.forEach((service, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const sourceId = sourceIdFor(catalog, service.id);
    graph.vertex({
      value: `${sourceId} · ${shorten(service.name, 17)}`,
      x: PAGE.margin + column * (width + gap), y: y + row * 31, w: width, h: 27,
      style: `rounded=1;arcSize=5;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontSize=8.5;fontColor=${COLORS.blue};fillColor=#FFFFFF;strokeColor=${COLORS.blueLine};strokeWidth=1;`,
      link: service.docs,
      tooltip: `Open ${sourceId}: official Oracle documentation for ${service.name}`,
    });
  });
}

function foundationTitle(diagram) {
  if (diagram.id === 'operations-lifecycle') return 'OCI OPERATIONS ADVISORY & LIFECYCLE FOUNDATION';
  if (diagram.id === 'landing-zone') return 'OCI LANDING ZONE DESIGN FOUNDATION';
  if (diagram.id === 'iam-governance') return 'OCI IAM & GOVERNANCE FOUNDATION';
  if (diagram.id === 'security') return 'OCI CLOUD SECURITY FOUNDATION';
  return 'OCI CLOUD NETWORK FOUNDATION';
}

function buildInterlockPage(catalog, diagram, { documented = false } = {}) {
  const graph = new Graph(diagram.id);
  addPosterHeader(graph, diagram, { documented });
  const leftX = 50;
  const leftW = 650;
  const signalX = 712;
  const laneW = 156;
  const centerX = 880;
  const centerW = 640;
  const insightX = 1532;
  const rightX = 1700;
  const rightW = 650;
  const headerY = 402;
  addColumnHeader(graph, foundationTitle(diagram), leftX, headerY, leftW, diagram.accent);
  addColumnHeader(graph, 'OCI OBSERVABILITY & MANAGEMENT CONTROL PLANE', centerX, headerY, centerW, COLORS.blue);
  addColumnHeader(graph, 'OPERATIONS, GOVERNANCE & ENGINEERING OUTCOMES', rightX, headerY, rightW, COLORS.green);

  const stackY = 480;
  const stackH = 1680;
  const sourceRecords = addDenseGroupStack(graph, diagram.sourceGroups, { x: leftX, y: stackY, w: leftW, h: stackH, fill: '#FFFCF5', stroke: diagram.accent, titleColor: diagram.accent });
  const serviceIds = addControlPlaneDense(graph, catalog, diagram, { x: centerX, y: stackY, w: centerW, h: stackH, documented });
  const outcomeRecords = addDenseGroupStack(graph, diagram.outcomeGroups, { x: rightX, y: stackY, w: rightW, h: stackH, fill: COLORS.greenTint, stroke: COLORS.greenLine, titleColor: COLORS.green });
  addSignalLane(graph, sourceRecords, { x: signalX, w: laneW, title: 'TELEMETRY & SIGNAL FLOW', color: diagram.accent });
  addSignalLane(graph, outcomeRecords, { x: insightX, w: laneW, title: 'INSIGHTS & ACTIONS FLOW', color: COLORS.green, reverse: true });

  graph.vertex({ value: 'CROSS-DOMAIN CORRELATION  ·  identity  ·  network  ·  security  ·  workload  ·  topology  ·  ownership  ·  cost  ·  lifecycle', x: PAGE.margin, y: 2180, w: PAGE.width - PAGE.margin * 2, h: 64, style: styles.purpose });
  addInterlockExamplesDense(graph, diagram, 2270);
  addReferencePanelsDense(graph, diagram, 2650);
  addSignalEvidenceBand(graph, diagram, 3080, { documented });
  if (documented) addDocumentationSourceChips(graph, catalog, diagram, 3274);
  graph.vertex({ value: documented ? 'DOCUMENTED EDITION · Editable vector poster · DOC badges open official Oracle sources · interlock flows are independent reference-architecture inferences · source register: assets/interlocks/documentation-sources.json' : 'Editable vector poster · 3000 × 4243 A-series 4K canvas · generated from assets/interlocks/catalog.json · independent community reference', x: PAGE.margin, y: 3352, w: PAGE.width - PAGE.margin * 2, h: 26, style: styles.note });
  return graph.xml();
}

function buildEndToEndPage(catalog, diagram, { documented = false } = {}) {
  const graph = new Graph(diagram.id);
  addPosterHeader(graph, diagram, { documented });
  const gap = 14;
  graph.vertex({ value: 'LAYER 1  ·  OCI CLOUD FOUNDATION DOMAINS', x: PAGE.margin, y: 390, w: PAGE.width - PAGE.margin * 2, h: 54, style: styles.header(COLORS.navy) });
  const domainW = (PAGE.width - PAGE.margin * 2 - gap * 5) / 6;
  const domainIds = [];
  diagram.sourceGroups.forEach((group, index) => {
    const x = PAGE.margin + index * (domainW + gap);
    const color = diagram.legend[index % diagram.legend.length].color;
    const panel = graph.vertex({ value: '', x, y: 458, w: domainW, h: 590, style: styles.panel(index === 4 ? COLORS.blueTint : '#FFFFFF', color) });
    domainIds.push(panel);
    graph.vertex({ value: `${index + 1}. ${group.title.toUpperCase()}`, x: x + 12, y: 470, w: domainW - 24, h: 54, style: styles.panelTitle(color) });
    group.items.slice(0, 6).forEach((item, itemIndex) => graph.vertex({
      value: `• ${item}`, x: x + 14, y: 536 + itemIndex * 58, w: domainW - 28, h: 48,
      style: compactCellStyle(color, '#FFFFFF'),
    }));
    graph.vertex({ value: `Signals&#xa;${group.signals.join(' · ')}`, x: x + 14, y: 900, w: domainW - 28, h: 126, style: compactCellStyle(color, COLORS.stoneTint, color) });
  });

  graph.vertex({ value: 'LAYER 2  ·  TELEMETRY AND SIGNAL FABRIC', x: PAGE.margin, y: 1074, w: PAGE.width - PAGE.margin * 2, h: 54, style: styles.header('#4A5568') });
  const signals = ['Metrics', 'Logs', 'Events', 'Traces', 'Security findings', 'Diagnostics', 'Governance', 'Cost & capacity', 'Lifecycle', 'Compliance evidence'];
  const signalW = (PAGE.width - PAGE.margin * 2 - gap * 9) / 10;
  const signalIds = signals.map((signal, index) => graph.vertex({
    value: `${signal.toUpperCase()}&#xa;service and operational evidence`, x: PAGE.margin + index * (signalW + gap), y: 1142, w: signalW, h: 150,
    style: compactCellStyle(diagram.legend[index % diagram.legend.length].color, index % 2 ? '#FFFFFF' : COLORS.stoneTint, COLORS.ink, 'center'),
  }));
  domainIds.forEach((id, index) => graph.vertex({
    value: '↓', x: PAGE.margin + index * (domainW + gap) + domainW / 2 - 12, y: 1048, w: 24, h: 24,
    style: `text;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=18;fontColor=${diagram.legend[index].color};`,
  }));

  graph.vertex({ value: 'LAYER 3  ·  OCI OBSERVABILITY & MANAGEMENT CONTROL PLANE', x: PAGE.margin, y: 1320, w: PAGE.width - PAGE.margin * 2, h: 54, style: styles.header(COLORS.blue) });
  const services = centralServices(catalog, diagram);
  const categoryGroups = ['Core observability', 'Advanced analytics', 'Governance and optimization'].map((category) => ({ category, services: services.filter((service) => service.category === category) }));
  const controlW = (PAGE.width - PAGE.margin * 2 - gap * 2) / 3;
  const controlIds = [];
  categoryGroups.forEach((group, groupIndex) => {
    const x = PAGE.margin + groupIndex * (controlW + gap);
    graph.vertex({ value: '', x, y: 1388, w: controlW, h: 600, style: styles.panel(COLORS.blueTint, COLORS.blueLine) });
    graph.vertex({ value: `${String.fromCharCode(65 + groupIndex)}. ${group.category.toUpperCase()}`, x: x + 14, y: 1400, w: controlW - 28, h: 38, style: styles.panelTitle(COLORS.blue) });
    group.services.forEach((service, serviceIndex) => {
      const serviceTop = 1450 + serviceIndex * 84;
      const sourceId = sourceIdFor(catalog, service.id);
      const id = graph.vertex({
        value: '', x: x + 16, y: serviceTop, w: controlW - 32, h: 72, style: styles.service,
        link: documented ? service.docs : undefined,
        tooltip: documented ? `${sourceId} · Official Oracle documentation · ${service.summary}` : undefined,
      });
      graph.vertex({
        id: `${diagram.id}-service-icon-${service.id}`,
        value: serviceGlyph(service.id), x: x + 28, y: serviceTop + 17, w: 38, h: 38,
        style: `ellipse;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=13;fontColor=#FFFFFF;fillColor=${COLORS.blue};strokeColor=${COLORS.blue};strokeWidth=1;`,
      });
      graph.vertex({ value: service.name, x: x + 78, y: serviceTop + 8, w: documented ? controlW - 184 : controlW - 108, h: 25, style: `text;html=1;align=left;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=14;fontColor=${COLORS.navy};whiteSpace=wrap;` });
      if (documented) {
        graph.vertex({
          value: `${sourceId} ↗`, x: x + controlW - 86, y: serviceTop + 8, w: 58, h: 22,
          style: `rounded=1;arcSize=6;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=10;fontColor=#FFFFFF;fillColor=${COLORS.blue};strokeColor=${COLORS.blue};strokeWidth=1;`,
          link: service.docs,
          tooltip: `Open official Oracle documentation for ${service.name}`,
        });
      }
      graph.vertex({ value: service.signals.join(' · '), x: x + 78, y: serviceTop + 36, w: controlW - 108, h: 24, style: `text;html=1;align=left;verticalAlign=middle;fontFamily=Arial;fontSize=12;fontColor=${COLORS.muted};whiteSpace=wrap;` });
      controlIds.push(id);
    });
  });
  signalIds.forEach((id, index) => graph.vertex({
    value: '↓', x: PAGE.margin + index * (signalW + gap) + signalW / 2 - 12, y: 1293, w: 24, h: 24,
    style: `text;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=18;fontColor=${COLORS.blue};`,
  }));

  graph.vertex({ value: 'LAYER 4  ·  REFERENCE OPERATING MODEL WORKFLOWS', x: PAGE.margin, y: 2016, w: PAGE.width - PAGE.margin * 2, h: 54, style: styles.header(COLORS.workflow) });
  const workflowW = (PAGE.width - PAGE.margin * 2 - gap * (diagram.workflows.length - 1)) / diagram.workflows.length;
  const workflowIds = diagram.workflows.map((workflow, index) => graph.vertex({
    value: `${index + 1}&#xa;${workflow.toUpperCase()}&#xa;signal → accountable action`, x: PAGE.margin + index * (workflowW + gap), y: 2084, w: workflowW, h: 190,
    style: compactCellStyle(index % 2 ? COLORS.workflow : COLORS.blue, index % 2 ? '#F7F2FC' : COLORS.blueTint, COLORS.ink, 'center'),
  }));
  workflowIds.slice(0, -1).forEach((id, index) => graph.vertex({
    value: '→', x: PAGE.margin + (index + 1) * workflowW + index * gap, y: 2160, w: gap, h: 28,
    style: `text;html=1;align=center;verticalAlign=middle;fontFamily=Arial;fontStyle=1;fontSize=16;fontColor=${COLORS.workflow};`,
  }));
  graph.vertex({ value: 'WORKFLOW AUTOMATION & INTEGRATION  ·  Events · Functions · Connector Hub · ITSM · ChatOps · SIEM/SOAR · CI/CD · approvals · notifications', x: PAGE.margin, y: 2292, w: PAGE.width - PAGE.margin * 2, h: 62, style: styles.purpose });

  graph.vertex({ value: 'LAYER 5  ·  OPERATIONS, GOVERNANCE AND BUSINESS OUTCOMES', x: PAGE.margin, y: 2380, w: PAGE.width - PAGE.margin * 2, h: 54, style: styles.header(COLORS.green) });
  const outcomeW = (PAGE.width - PAGE.margin * 2 - gap * 3) / 4;
  diagram.outcomeGroups.forEach((group, index) => {
    const x = PAGE.margin + (index % 4) * (outcomeW + gap);
    const y = 2448 + Math.floor(index / 4) * 270;
    graph.vertex({ value: '', x, y, w: outcomeW, h: 252, style: styles.panel(COLORS.greenTint, COLORS.greenLine) });
    graph.vertex({ value: `${index + 1}. ${group.title.toUpperCase()}`, x: x + 12, y: y + 10, w: outcomeW - 24, h: 38, style: styles.panelTitle(COLORS.green) });
    group.items.slice(0, 5).forEach((item, itemIndex) => graph.vertex({ value: `✓ ${item}`, x: x + 16, y: y + 54 + itemIndex * 37, w: outcomeW - 32, h: 30, style: compactCellStyle(COLORS.greenLine, '#FFFFFF') }));
  });

  addReferencePanelsDense(graph, diagram, 2990, documented ? 230 : 340);
  if (documented) addDocumentationSourceChips(graph, catalog, diagram, 3232);
  graph.vertex({ value: documented ? 'DOCUMENTED EDITION · Editable vector poster · DOC badges open official Oracle sources · interlock flows are independent reference-architecture inferences · source register: assets/interlocks/documentation-sources.json' : 'Editable vector poster · 3000 × 4243 A-series 4K canvas · generated from assets/interlocks/catalog.json · independent community reference', x: PAGE.margin, y: 3352, w: PAGE.width - PAGE.margin * 2, h: 26, style: styles.note });
  return graph.xml();
}

export function buildDrawio(catalog, { modified = new Date().toISOString() } = {}) {
  const diagrams = catalog.diagrams.map((diagram) => drawioDiagram(catalog, diagram)).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="app.diagrams.net" modified="${esc(modified)}" agent="OCI Observability Atlas generator" version="24.7.17" type="device" compressed="false">${diagrams}</mxfile>\n`;
}

export function buildDocumentedDrawio(catalog, { modified = new Date().toISOString() } = {}) {
  const diagrams = catalog.diagrams.map((diagram) => drawioDiagram(catalog, diagram, { documented: true })).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="app.diagrams.net" modified="${esc(modified)}" agent="OCI Observability Atlas documented-edition generator" version="24.7.17" type="device" compressed="false">${diagrams}</mxfile>\n`;
}

function drawioDiagram(catalog, diagram, { documented = false } = {}) {
  const body = diagram.id === 'end-to-end' ? buildEndToEndPage(catalog, diagram, { documented }) : buildInterlockPage(catalog, diagram, { documented });
  return `<diagram id="${esc(diagram.id)}" name="${esc(diagram.sheetName)}"><mxGraphModel dx="${OUTPUT_PAGE.width}" dy="${OUTPUT_PAGE.height}" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${OUTPUT_PAGE.width}" pageHeight="${OUTPUT_PAGE.height}" math="0" shadow="0" background="#FFFFFF"><root>${body}</root></mxGraphModel></diagram>`;
}

export function buildStandaloneDrawio(catalog, diagram, { modified = new Date().toISOString() } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="app.diagrams.net" modified="${esc(modified)}" agent="OCI Observability Atlas generator" version="24.7.17" type="device" compressed="false">${drawioDiagram(catalog, diagram)}</mxfile>\n`;
}

export function buildDocumentedStandaloneDrawio(catalog, diagram, { modified = new Date().toISOString() } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="app.diagrams.net" modified="${esc(modified)}" agent="OCI Observability Atlas documented-edition generator" version="24.7.17" type="device" compressed="false">${drawioDiagram(catalog, diagram, { documented: true })}</mxfile>\n`;
}

function excalidrawBase(id, type, x, y, width, height, index) {
  return {
    id, type, x, y, width, height, angle: 0, strokeColor: COLORS.ink,
    backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 2,
    strokeStyle: 'solid', roughness: 1, opacity: 100, groupIds: [], frameId: null,
    roundness: type === 'rectangle' ? { type: 3 } : null,
    seed: 1000 + index * 7919, versionNonce: 2000 + index * 104729,
    version: 1, isDeleted: false, boundElements: null, updated: 1, link: null, locked: false,
  };
}

function excalidrawRectangle(elements, id, x, y, width, height, strokeColor, backgroundColor, link = null) {
  const item = excalidrawBase(id, 'rectangle', x, y, width, height, elements.length);
  item.strokeColor = strokeColor;
  item.backgroundColor = backgroundColor;
  item.link = link;
  elements.push(item);
  return item;
}

function excalidrawText(elements, id, value, x, y, width, height, fontSize = 18, color = COLORS.ink, textAlign = 'left') {
  const item = excalidrawBase(id, 'text', x, y, width, height, elements.length);
  Object.assign(item, {
    strokeColor: color, text: value, fontSize, fontFamily: 5, textAlign,
    verticalAlign: 'middle', containerId: null, originalText: value, autoResize: false,
    lineHeight: 1.25, baseline: Math.round(fontSize * 0.8),
  });
  elements.push(item);
}

function excalidrawArrow(elements, id, x, y, width, height, color) {
  const item = excalidrawBase(id, 'arrow', x, y, width, height, elements.length);
  Object.assign(item, {
    strokeColor: color, points: [[0, 0], [width, height]], lastCommittedPoint: null,
    startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: 'arrow',
    elbowed: false,
  });
  elements.push(item);
}

function excalidrawCard(elements, id, title, items, x, y, width, height, color, tint) {
  excalidrawRectangle(elements, `${id}-box`, x, y, width, height, color, tint);
  excalidrawText(elements, `${id}-title`, title, x + 18, y + 14, width - 36, 30, 19, color);
  excalidrawText(elements, `${id}-body`, items.slice(0, 5).map((item) => `• ${item}`).join('\n'), x + 18, y + 52, width - 36, height - 64, 16, COLORS.ink);
}

export function buildExcalidraw(catalog, diagram) {
  const elements = [];
  excalidrawText(elements, `${diagram.id}-title`, diagram.title, 70, 34, 1544, 58, 34, COLORS.navy, 'center');
  excalidrawText(elements, `${diagram.id}-subtitle`, diagram.subtitle, 110, 102, 1464, 48, 18, COLORS.blue, 'center');
  excalidrawCard(elements, `${diagram.id}-purpose`, 'PURPOSE', [diagram.purpose], 70, 170, 1544, 112, COLORS.stone, COLORS.stoneTint);

  const columns = [
    { id: 'sources', title: 'FOUNDATION & SIGNAL SOURCES', x: 70, color: diagram.accent, tint: '#FFFCF5' },
    { id: 'control', title: 'OBSERVABILITY CONTROL PLANE', x: 617, color: COLORS.blue, tint: COLORS.blueTint },
    { id: 'outcomes', title: 'OPERATIONS & GOVERNANCE OUTCOMES', x: 1164, color: COLORS.green, tint: COLORS.greenTint },
  ];
  columns.forEach((column) => {
    excalidrawRectangle(elements, `${diagram.id}-${column.id}-header`, column.x, 320, 450, 64, column.color, column.color);
    excalidrawText(elements, `${diagram.id}-${column.id}-header-text`, column.title, column.x + 16, 333, 418, 36, 18, COLORS.white, 'center');
  });

  const sourceHeight = Math.min(206, 1050 / diagram.sourceGroups.length);
  diagram.sourceGroups.forEach((group, index) => {
    excalidrawCard(elements, `${diagram.id}-source-${index}`, group.title, group.items, 70, 410 + index * (sourceHeight + 12), 450, sourceHeight, diagram.accent, '#FFFCF5');
  });

  const services = diagram.serviceRefs.map((id) => catalog.services.find((service) => service.id === id)).filter(Boolean).slice(0, 12);
  const serviceHeight = Math.min(84, 1050 / services.length);
  services.forEach((service, index) => {
    const y = 410 + index * (serviceHeight + 7);
    excalidrawRectangle(elements, `${diagram.id}-service-${index}-box`, 617, y, 450, serviceHeight, COLORS.blueLine, COLORS.white);
    excalidrawText(elements, `${diagram.id}-service-${index}-text`, service.name, 635, y + 10, 414, serviceHeight - 20, 17, COLORS.navy);
  });

  const outcomeHeight = Math.min(206, 1050 / diagram.outcomeGroups.length);
  diagram.outcomeGroups.forEach((group, index) => {
    excalidrawCard(elements, `${diagram.id}-outcome-${index}`, group.title, group.items, 1164, 410 + index * (outcomeHeight + 12), 450, outcomeHeight, COLORS.green, COLORS.greenTint);
  });
  excalidrawArrow(elements, `${diagram.id}-flow-in`, 530, 790, 72, 0, diagram.accent);
  excalidrawArrow(elements, `${diagram.id}-flow-out`, 1077, 790, 72, 0, COLORS.green);

  excalidrawRectangle(elements, `${diagram.id}-workflow-box`, 70, 1580, 1544, 260, COLORS.workflow, '#F7F2FC');
  excalidrawText(elements, `${diagram.id}-workflow-title`, 'REFERENCE OPERATING LOOP', 92, 1596, 1500, 34, 19, COLORS.workflow);
  const workflowWidth = (1480 - 14 * (diagram.workflows.length - 1)) / diagram.workflows.length;
  diagram.workflows.forEach((workflow, index) => {
    const x = 102 + index * (workflowWidth + 14);
    excalidrawRectangle(elements, `${diagram.id}-workflow-${index}-box`, x, 1660, workflowWidth, 124, COLORS.workflow, COLORS.white);
    excalidrawText(elements, `${diagram.id}-workflow-${index}-text`, `${index + 1}. ${workflow}`, x + 10, 1674, workflowWidth - 20, 96, 16, COLORS.workflow, 'center');
  });

  excalidrawCard(elements, `${diagram.id}-examples`, 'INTERLOCK EXAMPLES', diagram.examples, 70, 1880, 760, 300, diagram.accent, COLORS.white);
  excalidrawCard(elements, `${diagram.id}-context`, 'CROSS-DOMAIN CONTEXT', ['Identity', 'Network', 'Security', 'Topology and ownership', 'Cost and lifecycle'], 854, 1880, 760, 300, COLORS.navy, COLORS.stoneTint);
  excalidrawText(elements, `${diagram.id}-footer`, 'Editable poster · generated from assets/interlocks/catalog.json · independent community reference', 70, 2280, 1544, 34, 16, COLORS.muted, 'center');

  return {
    type: 'excalidraw', version: 2, source: 'https://excalidraw.com', elements,
    appState: { viewBackgroundColor: '#ffffff', gridSize: 20, name: diagram.title }, files: {},
  };
}

export function buildDocumentedExcalidraw(catalog, diagram) {
  return buildDocumentedExcalidrawPoster(catalog, diagram, EXAMPLE_PIPELINES[diagram.id]);
}

export function buildCatalogScript(catalog) {
  return `globalThis.INTERLOCK_CATALOG = Object.freeze(${JSON.stringify(catalog)});\n`;
}

async function main() {
  const catalogUrl = new URL('../assets/interlocks/catalog.json', import.meta.url);
  const catalog = JSON.parse(await readFile(catalogUrl, 'utf8'));
  const sourceModified = process.env.SOURCE_DATE_EPOCH
    ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
    : `${catalog.meta.updated}T00:00:00.000Z`;
  const catalogScriptUrl = new URL('../assets/interlocks/catalog-data.js', import.meta.url);
  const edition = process.argv.find((argument) => argument.startsWith('--edition='))?.split('=')[1] ?? 'infographic';

  if (edition === 'documented') {
    const outputUrl = new URL('../assets/diagrams/oci-observability-service-interlocks-documented.drawio', import.meta.url);
    const artifactDirectory = new URL('../assets/diagrams/interlocks-documented/', import.meta.url);
    const documentationRegisterUrl = new URL('../assets/interlocks/documentation-sources.json', import.meta.url);
    const linkRegistry = JSON.parse(await readFile(new URL('../governance/external-links.json', import.meta.url), 'utf8'));
    const documentedModified = process.env.SOURCE_DATE_EPOCH
      ? sourceModified
      : `${linkRegistry.checkedAt}T00:00:00.000Z`;
    await mkdir(artifactDirectory, { recursive: true });
    await Promise.all([
      writeFile(outputUrl, buildDocumentedDrawio(catalog, { modified: documentedModified }), 'utf8'),
      writeFile(catalogScriptUrl, buildCatalogScript(catalog), 'utf8'),
      writeFile(documentationRegisterUrl, `${JSON.stringify(buildDocumentationRegister(catalog, { linkRegistry, verifiedOn: linkRegistry.checkedAt }), null, 2)}\n`, 'utf8'),
      ...catalog.diagrams.flatMap((diagram) => [
        writeFile(new URL(`${diagram.id}-documented.drawio`, artifactDirectory), buildDocumentedStandaloneDrawio(catalog, diagram, { modified: documentedModified }), 'utf8'),
        writeFile(new URL(`${diagram.id}-documented.excalidraw`, artifactDirectory), `${JSON.stringify(buildDocumentedExcalidraw(catalog, diagram), null, 2)}\n`, 'utf8'),
      ]),
    ]);
    process.stdout.write(`Generated documented workbook ${fileURLToPath(outputUrl)}, source register, and ${catalog.diagrams.length * 2} standalone editable artifacts\n`);
    return;
  }

  if (edition !== 'infographic') throw new Error(`Unsupported interlock edition: ${edition}`);
  const outputUrl = new URL('../assets/diagrams/oci-observability-service-interlocks-infographic.drawio', import.meta.url);
  const artifactDirectory = new URL('../assets/diagrams/interlocks-infographic/', import.meta.url);
  await mkdir(artifactDirectory, { recursive: true });
  await Promise.all([
    writeFile(outputUrl, buildDrawio(catalog, { modified: sourceModified }), 'utf8'),
    writeFile(catalogScriptUrl, buildCatalogScript(catalog), 'utf8'),
    ...catalog.diagrams.flatMap((diagram) => [
    writeFile(new URL(`${diagram.id}.drawio`, artifactDirectory), buildStandaloneDrawio(catalog, diagram, { modified: sourceModified }), 'utf8'),
    writeFile(new URL(`${diagram.id}.excalidraw`, artifactDirectory), `${JSON.stringify(buildExcalidraw(catalog, diagram), null, 2)}\n`, 'utf8'),
    ]),
  ]);
  process.stdout.write(`Generated infographic workbook ${fileURLToPath(outputUrl)} plus ${catalog.diagrams.length * 2} standalone editable artifacts\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
