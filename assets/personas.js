/* =========================================================================
   Persona + Industry entry point.
   Lets a visitor start from "who am I / what industry" rather than from the
   product list, then tailors the recommended levels, services, and lens.
   Self-contained; integrates with guide.js via window.__obsLens (default
   inspector lens) and by scrolling/clicking into the finder + ladder.
   ========================================================================= */
(() => {
  "use strict";
  const P = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pic" aria-hidden="true">${p}</svg>`;
  const I = {
    exec: P('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    platform: P('<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>'),
    sre: P('<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>'),
    dba: P('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>'),
    security: P('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'),
    dev: P('<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>'),
    ai: P('<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>'),
    operator: P('<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>'),
    // industries
    bank: P('<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>'),
    telco: P('<path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" x2="12.01" y1="20" y2="20"/>'),
    health: P('<path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2z"/>'),
    public: P('<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>'),
    retail: P('<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>'),
    isv: P('<path d="M16 16.66A5 5 0 0 0 12.66 14H6a4 4 0 1 1 .92-7.89A5 5 0 0 1 17 8a4.5 4.5 0 0 1-1 8.66"/><path d="m12 12 4 4-4 4"/><path d="M12 20V12"/>'),
  };

  const LVL = {
    L0: { label: "L0 · Govern and land", color: "var(--l0)", anchor: "#lvl-L0" },
    L1: { label: "L1 · See and alert", color: "var(--l1)", anchor: "#lvl-L1" },
    L2: { label: "L2 · Diagnose deep", color: "var(--l2)", anchor: "#lvl-L2" },
    L3: { label: "L3 · Correlate and automate", color: "var(--l3)", anchor: "#lvl-L3" },
    L4: { label: "L4 · Observe and govern AI", color: "var(--l4)", anchor: "#lvl-L4" },
    L5: { label: "L5 · Operate multitenancy", color: "var(--l5)", anchor: "#multitenancy" },
  };

  const PERSONAS = [
    { id: "exec", icon: "exec", name: "Executive / service owner", lens: 0, levels: ["L0","L1","L4"],
      summary: "Cares about business service health, SLAs, MTTR, and cost — not individual metrics.",
      identifies: "Executive dashboards, SLO/SLA status, incident volume and trends, capacity and cost risk.",
      uses: "Reads service-level dashboards to see whether business services are healthy and where reliability investment should go.",
      services: ["Management Dashboards", "Monitoring", "Ops Insights"] },
    { id: "platform", icon: "platform", name: "Platform engineer / cloud architect", lens: 1, levels: ["L0","L1","L2","L3","L5"],
      summary: "Designs the observability foundation, the IAM scoping, and how it scales across the estate.",
      identifies: "Compartment and IAM model, the observability hub, connectors, private endpoints, the Landing Zone add-on.",
      uses: "Stands up the governed foundation, defines observability teams and policies, and makes the model scale by environment, project, and tenant.",
      services: ["Observability compartment & IAM", "Connector Hub", "Management Agent", "Monitoring"] },
    { id: "sre", icon: "sre", name: "SRE / operations (NOC)", lens: 2, levels: ["L1","L2","L3"],
      summary: "Runs the platform day to day — detection, triage, and incident response.",
      identifies: "Active alarms, traces, correlated logs, service topology, the incident queue.",
      uses: "Pivots from an alarm to the trace to the logs to the database signal to find root cause and reduce MTTR.",
      services: ["Monitoring", "APM", "Logging", "Log Analytics", "Notifications"] },
    { id: "dba", icon: "dba", name: "DBA / database team", lens: 2, levels: ["L2"],
      summary: "Owns database health, SQL performance, and capacity across the fleet.",
      identifies: "Performance Hub, top SQL, wait events, sessions, capacity forecasts, Data Guard state.",
      uses: "Diagnoses live performance with Database Management and plans capacity with Ops Insights across the database fleet.",
      services: ["Database Management", "Ops Insights", "Management Agent"] },
    { id: "security", icon: "security", name: "Security / SOC / governance", lens: 1, levels: ["L0","L2","L4"],
      summary: "Owns audit, threat detection, compliance, and Zero Trust for agents.",
      identifies: "Audit events, high-risk changes, MITRE-mapped detections, sensitive-log patterns, the Zero Trust decision ledger.",
      uses: "Investigates with Log Analytics (ML detections), routes via Connector Hub to the SIEM, and governs AI agents with Zero Trust.",
      services: ["Audit", "Log Analytics", "Cloud Guard Instance Security", "Connector Hub"] },
    { id: "dev", icon: "dev", name: "Developer / application team", lens: 2, levels: ["L1","L3"],
      summary: "Owns application performance, user experience, and release quality.",
      identifies: "Distributed traces, service topology, real-user sessions, error rates, structured application logs.",
      uses: "Instruments with OpenTelemetry, follows a trace end to end, and correlates spans to logs to fix latency and errors.",
      services: ["APM", "APM RUM", "Logging", "Monitoring"] },
    { id: "ai", icon: "ai", name: "AI / ML engineer", lens: 1, levels: ["L4"],
      summary: "Builds and operates AI agents — and must see, judge, and improve them safely.",
      identifies: "Agent span trees (invoke_agent, execute_tool, chat), token and cost metrics, quality and drift scores.",
      uses: "Traces agents with OpenTelemetry GenAI, evaluates output with LLM-as-a-judge, and evolves under gated control with Zero Trust.",
      services: ["APM + OpenTelemetry", "Generative AI (judge)", "Logging Analytics", "Data Science"] },
    { id: "operator", icon: "operator", name: "Operator / ISV (multitenancy)", lens: 1, levels: ["L0","L5"],
      summary: "Runs observability for many tenants — Alloy, DRCC, or a multitenant SaaS platform.",
      identifies: "Per-tenant observability, an operator-level cross-tenant view, isolation boundaries, and aggregate fleet health.",
      uses: "Replicates the governed per-tenant model and aggregates at the operator level for cross-tenant SLOs, capacity, and chargeback.",
      services: ["Observability compartment & IAM", "Connector Hub", "Ops Insights", "Management Dashboards"] },
  ];

  const INDUSTRIES = [
    { id: "finserv", icon: "bank", name: "Financial services", pattern: "dbc",
      focus: "Database-centric, low MTTR, and heavy audit and resilience obligations (DORA, PCI).",
      emphasis: ["L2 database depth", "L0 audit and governance", "fast L1 → L3 correlation"] },
    { id: "telco", icon: "telco", name: "Telecommunications", pattern: "oke",
      focus: "Cloud-native scale, network visibility, and often multitenant operator platforms.",
      emphasis: ["L3 tracing on OKE", "L5 multitenancy", "open-source fan-out"] },
    { id: "healthcare", icon: "health", name: "Healthcare", pattern: "apps",
      focus: "Sensitive data, compliance, and reliability across Oracle applications and databases.",
      emphasis: ["L0 governance", "L2 database", "L2 security detections"] },
    { id: "public", icon: "public", name: "Public sector", pattern: "hybrid",
      focus: "Sovereignty (often DRCC), strong audit, and hybrid estates.",
      emphasis: ["L0 audit", "L5 dedicated-region operation", "hybrid collection"] },
    { id: "retail", icon: "retail", name: "Retail / e-commerce", pattern: "trad",
      focus: "Peak-season scale, user experience, and capacity planning.",
      emphasis: ["L3 APM and RUM", "L1 alarms", "L2 capacity"] },
    { id: "isv", icon: "isv", name: "ISV / SaaS", pattern: "agentic",
      focus: "Multitenant isolation, per-customer SLOs, and operator-scale aggregation.",
      emphasis: ["L5 multitenancy", "L4 AI agents", "L0 per-tenant governance"] },
  ];

  // Expose for guide.js (inspector "relevant to" chips + persona-aware nav)
  window.OBS_PERSONAS = PERSONAS.map((p) => ({ id: p.id, name: p.name, levels: p.levels, lens: p.lens }));

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let chosen = { persona: null, industry: null };

  function lvlChip(k) {
    const l = LVL[k]; if (!l) return "";
    return `<a class="lvlchip" href="${l.anchor}" style="--lv:${l.color}"><span class="dot"></span>${l.label}</a>`;
  }

  function buildSelector() {
    const pHost = $("#personaPick"), iHost = $("#industryPick");
    if (pHost) pHost.innerHTML = PERSONAS.map((p) =>
      `<button class="pickchip" type="button" data-persona="${p.id}">${I[p.icon]}<span>${p.name}</span></button>`).join("");
    if (iHost) iHost.innerHTML = INDUSTRIES.map((d) =>
      `<button class="pickchip" type="button" data-industry="${d.id}">${I[d.icon]}<span>${d.name}</span></button>`).join("");
    $$("#personaPick .pickchip").forEach((b) => b.addEventListener("click", () => { chosen.persona = b.dataset.persona; mark(); render(); }));
    $$("#industryPick .pickchip").forEach((b) => b.addEventListener("click", () => { chosen.industry = b.dataset.industry; mark(); render(); }));
  }
  function mark() {
    $$("#personaPick .pickchip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.persona === chosen.persona));
    $$("#industryPick .pickchip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.industry === chosen.industry));
  }

  function render() {
    const res = $("#startResult"); if (!res) return;
    const p = PERSONAS.find((x) => x.id === chosen.persona);
    const d = INDUSTRIES.find((x) => x.id === chosen.industry);
    if (!p && !d) { res.classList.remove("show"); return; }
    window.__obsLens = p ? p.lens : 0;     // default inspector lens for guide.js
    const lensName = ["Executive", "Architect", "Practitioner"][p ? p.lens : 0];
    const levels = [...new Set([...(p ? p.levels : []), ...(d ? d.emphasis.map(matchLevel).filter(Boolean) : [])])];
    const lead = p && d
      ? `<b>${p.name}</b> · <b>${d.name}</b>`
      : p ? `<b>${p.name}</b>` : `<b>${d.name}</b>`;
    res.innerHTML = `
      <p class="start__lead">${lead}, start here:</p>
      ${p ? `<p class="start__line">${p.uses} Your default lens is <b>${lensName}</b>.</p>` : ""}
      ${d ? `<p class="start__line">Industry focus — ${d.focus}</p>` : ""}
      <div class="start__levels">${levels.map(lvlChip).join("")}</div>
      ${p ? `<div class="start__svc"><span class="start__k">You'll mostly look at</span> ${p.services.map((s) => `<span class="tag">${s}</span>`).join("")}</div>` : ""}
      <div class="start__cta">
        ${d ? `<button class="linkbtn" id="startToFinder" type="button" data-uc="${d.pattern}">See the ${d.name} use-case path ${arrow()}</button>` : ""}
        ${p ? `<a class="linkbtn" href="#personas">How your persona uses the data ${arrow()}</a>` : ""}
      </div>`;
    res.classList.add("show");
    const f = $("#startToFinder");
    if (f) f.addEventListener("click", () => {
      const uc = document.querySelector(`.uc[data-uc="${f.dataset.uc}"]`);
      if (uc) { uc.click(); uc.scrollIntoView({ behavior: "smooth", block: "center" }); }
    });
  }
  const arrow = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pic" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
  function matchLevel(s) { const m = s.match(/\bL[0-5]\b/); return m ? m[0] : null; }

  function buildPersonaView() {
    const host = $("#personaGrid"); if (!host) return;
    host.innerHTML = PERSONAS.map((p) => `
      <article class="pcard" data-lens="${p.lens}">
        <div class="pcard__top"><span class="pcard__ic">${I[p.icon]}</span><div><h3>${p.name}</h3><span class="pcard__lens">Default lens · ${["Executive","Architect","Practitioner"][p.lens]}</span></div></div>
        <p class="pcard__sum">${p.summary}</p>
        <div class="pcard__levels">${p.levels.map((k) => `<span class="lvltag" style="--lv:${LVL[k].color}">${k}</span>`).join("")}</div>
        <dl class="pcard__dl">
          <dt>Identifies</dt><dd>${p.identifies}</dd>
          <dt>Uses it to</dt><dd>${p.uses}</dd>
        </dl>
        <div class="pcard__svc">${p.services.map((s) => `<span class="tag">${s}</span>`).join("")}</div>
      </article>`).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildSelector();
    buildPersonaView();
  });
})();
