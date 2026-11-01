/* Independent architecture guidance; integrations require configuration. */
(function () {
  'use strict';
  function freeze(value) {
    Object.values(value).forEach(child => { if (child && typeof child === 'object') freeze(child); });
    return Object.freeze(value);
  }
  const data = freeze({
  "mappings": {
    "hub": {
      "role": "Agent hub",
      "oci": "OCI Generative AI Agents",
      "oss": "None specified",
      "observes": "Agent orchestration and telemetry boundaries."
    },
    "traces": {
      "role": "Traces",
      "oci": "OCI APM",
      "oss": "OpenTelemetry → Grafana Tempo / Jaeger",
      "observes": "Distributed spans, tool calls and end-to-end latency."
    },
    "evaluation": {
      "role": "Evaluation",
      "oci": "None specified",
      "oss": "Langfuse / Arize Phoenix",
      "observes": "Groundedness, relevance, coherence and safety evaluations."
    },
    "metrics": {
      "role": "Metrics",
      "oci": "OCI Monitoring",
      "oss": "Prometheus + Grafana",
      "observes": "Latency, token consumption and success/error rates."
    },
    "platform": {
      "role": "Platform",
      "oci": "OCI Logging, Monitoring, APM",
      "oss": "None specified",
      "observes": "Logs, metrics and traces across the operating platform."
    },
    "alerting": {
      "role": "Alerting",
      "oci": "OCI Notifications",
      "oss": "Alertmanager",
      "observes": "Threshold breaches, evaluation drift and response routing."
    },
    "governance": {
      "role": "Governance",
      "oci": "OCI Cloud Guard, Data Safe, IAM",
      "oss": "None specified",
      "observes": "Security posture, data protection and access policies."
    },
    "audit": {
      "role": "Audit",
      "oci": "OCI Audit",
      "oss": "None specified",
      "observes": "Service API activity and administrative changes."
    }
  },
  "inputs": [
    {
      "id": "knowledge",
      "label": "Knowledge Retrieval",
      "mapping": "traces",
      "observes": "Retrieval spans and Object Storage access.",
      "sub": "Object Storage"
    },
    {
      "id": "mcp",
      "label": "MCP Tools",
      "mapping": "traces",
      "observes": "MCP tool calls and dependencies.",
      "sub": "Object Storage · Autonomous DB · Functions"
    },
    {
      "id": "apis",
      "label": "APIs",
      "mapping": "traces",
      "observes": "API requests, failures and timing.",
      "sub": "API Gateway"
    },
    {
      "id": "databases",
      "label": "Databases",
      "mapping": "traces",
      "observes": "Database dependency spans.",
      "sub": "Autonomous Database"
    },
    {
      "id": "services",
      "label": "OCI Services",
      "mapping": "platform",
      "observes": "Service telemetry and operational context.",
      "sub": ""
    }
  ],
  "hub": {
    "id": "agent",
    "label": "OCI Generative AI Agent",
    "mapping": "hub",
    "observes": "Agent execution, orchestration and correlated telemetry.",
    "sub": ""
  },
  "ring": [
    {
      "id": "tracing",
      "label": "Distributed Tracing",
      "mapping": "traces",
      "observes": "Agent spans and parent-child relationships.",
      "sub": ""
    },
    {
      "id": "tool-calls",
      "label": "Tool Call Monitoring",
      "mapping": "traces",
      "observes": "Tool invocation timing and errors.",
      "sub": ""
    },
    {
      "id": "latency",
      "label": "Latency Metrics",
      "mapping": "metrics",
      "observes": "Request duration and latency distributions.",
      "sub": ""
    },
    {
      "id": "tokens",
      "label": "Token Consumption",
      "mapping": "metrics",
      "observes": "Token usage across agent runs.",
      "sub": ""
    },
    {
      "id": "rates",
      "label": "Success/Error Rates",
      "mapping": "metrics",
      "observes": "Successful and failed run counts.",
      "sub": ""
    },
    {
      "id": "evaluations",
      "label": "Agent Evaluations",
      "mapping": "evaluation",
      "observes": "Response quality and evaluator results.",
      "sub": ""
    },
    {
      "id": "safety",
      "label": "Safety Signals",
      "mapping": "governance",
      "observes": "Policy findings and safety evaluation signals; configure evaluators separately.",
      "sub": ""
    },
    {
      "id": "telemetry",
      "label": "Telemetry Collection",
      "mapping": "platform",
      "observes": "Correlated logs, metrics and traces.",
      "sub": ""
    }
  ],
  "tools": [
    {
      "id": "trace-viewer",
      "label": "Trace Viewer",
      "mapping": "traces",
      "observes": "Span waterfalls and dependencies.",
      "sub": "Grafana Tempo / Jaeger"
    },
    {
      "id": "agent-evaluation",
      "label": "Agent Evaluation",
      "mapping": "evaluation",
      "observes": "Evaluation results and datasets.",
      "sub": "Langfuse / Arize Phoenix"
    },
    {
      "id": "quality",
      "label": "Quality Metrics",
      "mapping": "metrics",
      "observes": "Latency, usage and error trends.",
      "sub": "Prometheus + Grafana"
    },
    {
      "id": "observability",
      "label": "OCI Observability",
      "mapping": "platform",
      "observes": "Platform operations and signal correlation.",
      "sub": "Logging · Monitoring · APM"
    }
  ],
  "bottom": [
    {
      "id": "alerts",
      "label": "Alerting & Monitoring",
      "mapping": "alerting",
      "observes": "Threshold and drift notifications.",
      "sub": "OCI Notifications + Alertmanager"
    },
    {
      "id": "timeline",
      "label": "Trace Timeline",
      "mapping": "traces",
      "observes": "Ordered spans within an agent run.",
      "sub": "OpenTelemetry spans"
    },
    {
      "id": "compliance",
      "label": "Governance & Compliance",
      "mapping": "governance",
      "observes": "Security posture, data protection and access.",
      "sub": "Cloud Guard · Data Safe · IAM"
    },
    {
      "id": "audit-trail",
      "label": "Audit Trail",
      "mapping": "audit",
      "observes": "Service API audit events.",
      "sub": "OCI Audit"
    },
    {
      "id": "health",
      "label": "Health Overview",
      "mapping": "metrics",
      "observes": "Aggregate success, latency and errors.",
      "sub": "Operational signals"
    }
  ],
  "badges": [
    "OpenTelemetry Compatible",
    "OCI APM Integration",
    "Prometheus & Grafana",
    "Real-time Telemetry",
    "Production Ready",
    "Secure by Design"
  ]
});
  const panel = document.getElementById('ai-starter-kit');
  if (!panel || !window.d3) return;
  const d3 = window.d3;
  const detail = document.getElementById('ai-kit-detail');
  const chart = d3.select('#ai-kit-chart');
  const svg = chart.append('svg').attr('viewBox', '0 0 1200 600')
    .attr('aria-label', 'Agent inputs flow into an OCI agent, through its observability layer to analysis tools');
  svg.append('text').attr('x', 20).attr('y', 34).attr('class', 'ai-kit__heading').text('Agent Inputs & Tools');
  svg.append('text').attr('x', 600).attr('y', 34).attr('text-anchor', 'middle').attr('class', 'ai-kit__heading').text('Observability Layer');
  svg.append('text').attr('x', 970).attr('y', 34).attr('class', 'ai-kit__heading').text('Inspect & understand');
  svg.append('circle').attr('cx', 600).attr('cy', 304).attr('r', 204).attr('class', 'ai-kit__orbit');
  svg.append('defs').append('marker').attr('id', 'ai-kit-arrow').attr('viewBox', '0 0 8 8')
    .attr('refX', 8).attr('refY', 4).attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
    .append('path').attr('d', 'M0,0 L8,4 L0,8 Z').attr('class', 'ai-kit__arrow');
  const positions = new Map();
  data.inputs.forEach((node, i) => positions.set(node.id, { x: 140, y: 115 + i * 96, w: 252, h: 80 }));
  positions.set(data.hub.id, { x: 600, y: 304, w: 210, h: 100 });
  data.ring.forEach((node, i) => {
    const angle = -Math.PI / 2 + i * Math.PI / 4;
    positions.set(node.id, { x: 600 + Math.cos(angle) * 220, y: 304 + Math.sin(angle) * 204, w: 164, h: 64 });
  });
  data.tools.forEach((node, i) => positions.set(node.id, { x: 1060, y: 142 + i * 112, w: 252, h: 90 }));
  const nodes = [...data.inputs, data.hub, ...data.ring, ...data.tools];
  const links = nodes.filter(node => node !== data.hub).map(node => ({
    source: data.inputs.includes(node) ? node.id : data.hub.id,
    target: data.inputs.includes(node) ? data.hub.id : node.id,
    mapping: node.mapping
  }));
  const paths = svg.append('g').attr('aria-hidden', 'true').selectAll('path').data(links).join('path')
    .attr('class', 'ai-kit__link').attr('marker-end', 'url(#ai-kit-arrow)').attr('d', link => {
      const a = positions.get(link.source), b = positions.get(link.target);
      const dx = b.x - a.x, dy = b.y - a.y;
      const start = Math.min(a.w / 2 / Math.abs(dx), a.h / 2 / Math.abs(dy));
      const end = Math.min(b.w / 2 / Math.abs(dx), b.h / 2 / Math.abs(dy));
      const x1 = a.x + dx * start, y1 = a.y + dy * start;
      const x2 = b.x - dx * end, y2 = b.y - dy * end;
      return `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`;
    });
  function select(node) {
    panel.querySelectorAll('[data-kit-node]').forEach(element => element.setAttribute('aria-pressed', String(element.dataset.kitNode === node?.id)));
    paths.classed('is-connected', link => Boolean(node && (node.id === data.hub.id || link.source === node.id || link.target === node.id || link.mapping === node.mapping)));
    detail.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = node ? node.label : 'Explore the observability path';
    detail.append(heading);
    if (!node) {
      const prompt = document.createElement('p');
      prompt.textContent = 'Select a node to compare OCI services and open-source tools. Escape clears the selection.';
      detail.append(prompt);
      return;
    }
    const mapping = data.mappings[node.mapping];
    const role = document.createElement('p');
    role.textContent = `Role: ${mapping.role}. ${node.sub ? node.sub + '. ' : ''}Observes: ${node.observes}`;
    detail.append(role);
    const columns = document.createElement('dl');
    columns.className = 'ai-kit__mapping';
    for (const [label, value] of [['OCI', mapping.oci], ['Open source', mapping.oss]]) {
      const column = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value === 'None specified' ? 'No tool specified in this mapping' : value;
      column.append(term, description);
      columns.append(column);
    }
    detail.append(columns);
  }
  function bind(selection) {
    return selection.attr('data-kit-node', node => node.id).attr('tabindex', 0).attr('role', 'button')
      .attr('aria-label', node => `Explore ${node.label}`).attr('aria-controls', 'ai-kit-detail')
      .attr('aria-describedby', 'ai-kit-help').attr('aria-pressed', 'false')
      .on('mouseenter', (_event, node) => select(node)).on('focus', (_event, node) => select(node))
      .on('click', (_event, node) => select(node)).on('keydown', (event, node) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(node); }
      });
  }
  const groups = bind(svg.append('g').selectAll('g').data(nodes).join('g').attr('class', node => `ai-kit__node${node === data.hub ? ' ai-kit__hub' : ''}`)
    .attr('transform', node => { const p = positions.get(node.id); return `translate(${p.x},${p.y})`; }));
  groups.append('rect').attr('x', node => -positions.get(node.id).w / 2).attr('y', node => -positions.get(node.id).h / 2)
    .attr('width', node => positions.get(node.id).w).attr('height', node => positions.get(node.id).h).attr('rx', 10);
  groups.each(function (node) {
    const group = d3.select(this);
    const words = node.label.split(' ');
    const split = Math.ceil(words.length / 2);
    [words.slice(0, split).join(' '), words.slice(split).join(' ')].forEach((line, index) => {
      group.append('text').attr('text-anchor', 'middle').attr('y', index * 19 - 7).text(line);
    });
    if (node.sub) {
      const lines = node.sub.length > 32 ? [node.sub.slice(0, node.sub.indexOf(' · ')), node.sub.slice(node.sub.indexOf(' · ') + 3)] : [node.sub];
      lines.forEach((line, index) => group.append('text').attr('class', 'ai-kit__subtitle')
        .attr('text-anchor', 'middle').attr('y', 25 + index * 14).text(line));
    }
  });
  bind(d3.select('#ai-kit-bottom').selectAll('button').data(data.bottom).join('button').attr('type', 'button').attr('class', 'ai-kit__card'))
    .each(function (node) {
      d3.select(this).append('strong').text(node.label);
      d3.select(this).append('span').text(node.sub);
    });
  d3.select('#ai-kit-badges').selectAll('li').data(data.badges).join('li').text(badge => badge);
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') select(null); });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function syncMotion() { panel.dataset.reducedMotion = String(motion.matches); }
  syncMotion();
  motion.addEventListener('change', syncMotion);
  select(null);
  document.getElementById('ai-kit-fallback').hidden = true;
  document.getElementById('ai-kit-interactive').hidden = false;
}());
