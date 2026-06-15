/* =========================================================================
   OCI Observability Atlas — guide.js
   Component data, icons, finder, slide-over inspector, lens toggles.
   ========================================================================= */
(() => {
  "use strict";

  /* ---- Inline SVG icon set (stroke = currentColor) ---- */
  const I = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICON = {
    iam:    I(`<circle cx="12" cy="8" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/><path d="M18 4l2 1.2v2.4L18 9l-2-1.4V5.2z"/>`),
    tag:    I(`<path d="M3 3h7l11 11-7 7L3 10z"/><circle cx="7.5" cy="7.5" r="1.4"/>`),
    vault:  I(`<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="3.2"/><path d="M12 8.8v-1M12 16.2v-1M8.8 12h-1M16.2 12h-1"/>`),
    audit:  I(`<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12l2 2 4-4"/>`),
    metric: I(`<path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 16l3.5-4.5L14 14l4-6"/>`),
    log:    I(`<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>`),
    bell:   I(`<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/>`),
    event:  I(`<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>`),
    db:     I(`<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>`),
    insight:I(`<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M11 8v3l2 2"/>`),
    analyze:I(`<path d="M4 4h16v12H4z"/><path d="M4 20h16"/><path d="M8 11l2-2 2 2 3-3"/>`),
    agent:  I(`<rect x="7" y="3" width="10" height="7" rx="1.5"/><path d="M12 10v4"/><rect x="4" y="14" width="7" height="7" rx="1.5"/><rect x="13" y="14" width="7" height="7" rx="1.5"/>`),
    apm:    I(`<circle cx="6" cy="7" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7.5 8.5 11 16M16.5 8.5 13 16M8 7h8"/>`),
    hub:    I(`<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="4" r="1.8"/><circle cx="4" cy="18" r="1.8"/><circle cx="20" cy="18" r="1.8"/><path d="M12 6.5v3M10.2 13.3 5.4 16.6M13.8 13.3l4.8 3.3"/>`),
    ai:     I(`<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M18.4 5.6l-2 2M7.6 16.4l-2 2"/><circle cx="12" cy="12" r="3.4"/>`),
    leaf:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13z"/><path d="M5 19c4-6 7-8 10-9"/></svg>`,
    check:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  };

  /* ---- Level metadata ---- */
  const LEVELS = {
    L0: { color: "var(--l0)", label: "L0 · Govern & Land" },
    L1: { color: "var(--l1)", label: "L1 · See & Alert" },
    L2: { color: "var(--l2)", label: "L2 · Diagnose Deep" },
    L3: { color: "var(--l3)", label: "L3 · Correlate & Automate" },
  };

  /* ---- Component catalog (the OCI O&M services) ---- */
  const C = {
    iam: {
      level: "L0", icon: "iam", name: "Observability Compartment & IAM",
      tagline: "A governed home for shared telemetry, with least-privilege roles.",
      lz: "Extends the Landing Zone compartment topology with a dedicated <b>observability</b> compartment and policy set. Drop it in after the core LZ exists — no rebuild required.",
      exec: ["<b>Why it matters:</b> separation of duties and a single owned home for dashboards, logs, connectors and notifications.", "Reduces audit findings and shadow monitoring."],
      arch: ["Central observability compartment / platform boundary.", "Groups: <b>obs-platform-admins, obs-readers, obs-log-admins, obs-apm-admins, dbobs-admins, security-audit-readers, automation-operators</b>.", "Least privilege; no single broad admin group."],
      prac: ["Policy snippet scopes log + monitoring read across the tenancy for readers."],
      code: { lang: "OCI IAM policy", body: `Allow group obs-readers to read metrics in tenancy
Allow group obs-readers to read log-content in tenancy
Allow group obs-log-admins to manage log-groups in compartment observability
Allow group obs-platform-admins to manage alarms in compartment observability
Allow group automation-operators to use fn-function in compartment observability` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Identity/home.htm",
    },
    tag: {
      level: "L0", icon: "tag", name: "Tagging & Naming Standards",
      tagline: "The correlation backbone — every signal traceable to a business service.",
      lz: "Define tag namespaces/defaults as a Landing Zone add-on so every later resource inherits them automatically.",
      exec: ["<b>Why it matters:</b> connects technical signals to business services, owners and cost.", "Drives alarm severity, retention and showback."],
      arch: ["Standard tags: <b>business_service, environment, criticality, owner, cost_center, data_classification, observability_tier</b>.", "Apply via tag defaults at compartment level."],
      prac: ["Use defined tags + tag defaults so resources are tagged on creation."],
      code: { lang: "Tag defaults", body: `# Defined tag namespace: Observability
business_service   = customer-portal     # service-level grouping
environment        = prod                 # prod | preprod | test | dev
criticality        = tier-1               # tier-0..tier-3 -> alarm severity
observability_tier = enhanced             # baseline | enhanced | critical` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Tagging/home.htm",
    },
    vault: {
      level: "L0", icon: "vault", name: "OCI Vault & Secrets",
      tagline: "Credentials for DBM, APM, agents and automation — never inline.",
      lz: "Vault is a standard Landing Zone security service; add an observability key + secret scope for monitoring credentials.",
      exec: ["<b>Why it matters:</b> protects monitoring credentials and supports compliance."],
      arch: ["Secret ownership, rotation cadence, break-glass and audit review.", "Separate read-only monitoring vs diagnostic vs admin credentials."],
      prac: ["DBM and Management Agent pull monitoring passwords from Vault secrets by OCID."],
      code: { lang: "OCI CLI", body: `oci vault secret create-base64 \\
  --compartment-id $OBS_CMPT \\
  --secret-name dbsnmp-monitoring \\
  --vault-id $VAULT --key-id $KEY \\
  --secret-content-content $(printf '%s' "$PW" | base64)` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/KeyManagement/home.htm",
    },
    audit: {
      level: "L0", icon: "audit", name: "OCI Audit",
      tagline: "Tenancy-wide API and change visibility, on by default.",
      lz: "Audit is always-on; the add-on is the <b>export + detection</b> layer (Connector Hub to Object Storage / SIEM).",
      exec: ["<b>Why it matters:</b> governance, compliance and forensic investigation of who changed what."],
      arch: ["Restrict who reads Audit data.", "Export when retention exceeds defaults.", "Build detections for high-risk changes: policy, network, key, deletion events."],
      prac: ["Audit logs are queryable in Logging and routable via Connector Hub."],
      code: { lang: "OCL (Log search)", body: `search "audit"
| where data.eventName in ('UpdatePolicy','DeleteVcn','ScheduleKeyDeletion')
| stats count by data.identity.principalName, data.eventName
| sort -count` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Audit/home.htm",
    },
    metric: {
      level: "L1", icon: "metric", name: "OCI Monitoring",
      tagline: "Metrics, MQL queries and actionable alarms — the health foundation.",
      lz: "Add monitoring alarms + dashboards onto any Landing Zone workload after deployment; no agent needed for native OCI metrics.",
      exec: ["<b>Answers:</b> is the service healthy?", "Reduces MTTD with availability, saturation, error-rate and latency alarms."],
      arch: ["Consistent metric namespaces + dimensions.", "Alarm only on actionable conditions; severity by business impact.", "Maintenance suppression; prune noisy alarms from history."],
      prac: ["MQL alarm: fire when average CPU over 1m exceeds 85% for any instance."],
      code: { lang: "MQL", body: `CpuUtilization[1m]{resourceDisplayName =~ "prod-*"}
  .mean() > 85

# Alarm: trigger when 1 datapoint breaches over 5 minutes
# Severity: CRITICAL  ->  topic: prod-critical` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Monitoring/home.htm",
    },
    log: {
      level: "L1", icon: "log", name: "OCI Logging",
      tagline: "Centralized, managed log collection from resources, apps and agents.",
      lz: "Enable service logs + custom log groups as a Landing Zone add-on per compartment.",
      exec: ["<b>Answers:</b> what happened?", "Central, searchable audit + application history."],
      arch: ["Log groups by environment / domain / data classification.", "Structured JSON; include service.name, environment, region, trace.id, correlation.id.", "Separate operational vs sensitive security logs."],
      prac: ["Custom log ingestion via the unified Logging agent config."],
      code: { lang: "Logging agent (JSON)", body: `{
  "source": { "name": "app-logs",
    "paths": ["/var/log/app/*.json"] },
  "logGroupId": "ocid1.loggroup.oc1..app",
  "parser": { "type": "json",
    "fieldTimeKey": "timestamp" }
}` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Logging/home.htm",
    },
    bell: {
      level: "L1", icon: "bell", name: "OCI Notifications",
      tagline: "Topics + subscriptions routing alarms to the right humans and systems.",
      lz: "Stand up severity-based topics as a Landing Zone add-on; wire alarms + events into them later.",
      exec: ["<b>Answers:</b> who needs to act?", "Right alert to the right channel, every time."],
      arch: ["Topics by severity, service and ownership: prod-critical, prod-warning, non-prod, security, capacity.", "Subscriptions: email, HTTPS, PagerDuty, Functions, ITSM."],
      prac: ["Publish an alarm to a topic; ITSM webhook opens an incident."],
      code: { lang: "OCI CLI", body: `oci ons topic create -c $OBS_CMPT --name prod-critical
oci ons subscription create --topic-id $TOPIC \\
  --protocol HTTPS \\
  --subscription-endpoint https://itsm.example.com/oci/incident` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Notification/home.htm",
    },
    event: {
      level: "L1", icon: "event", name: "OCI Events",
      tagline: "React to resource state changes — the trigger layer for automation.",
      lz: "Add event rules per compartment to drive notifications and remediation.",
      exec: ["<b>Answers:</b> what should happen automatically?"],
      arch: ["Route state-change events to Notifications, Functions, Streaming.", "Foundation for event-driven remediation in L3."],
      prac: ["Rule matches a resource event and targets a topic or function."],
      code: { lang: "Event rule (condition)", body: `{
  "eventType": [
    "com.oraclecloud.databaseservice.databasedown"
  ],
  "data": { "compartmentId": "ocid1.compartment.oc1..prod" }
}
# action -> ons-topic: prod-critical` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Events/home.htm",
    },
    db: {
      level: "L2", icon: "db", name: "OCI Database Management",
      tagline: "Fleet monitoring, Performance Hub, SQL, sessions and waits.",
      lz: "A first-class add-on for any Landing Zone with Oracle databases — enable Basic or Full per database after deployment.",
      exec: ["<b>Answers:</b> which database / SQL workload is affected?", "Cuts database troubleshooting time; databases are a first-class domain, not a DBA-only add-on."],
      arch: ["Basic for broad baseline; Full for RAC, Exadata, Data Guard, performance-sensitive DBs.", "Enable per region (no cross-region monitoring).", "Private endpoint or Management Agent; credentials in Vault; Database Groups by service/criticality."],
      prac: ["Enable Diagnostics & Management on a cloud database via CLI."],
      code: { lang: "OCI CLI", body: `oci database database update \\
  --database-id $DB_OCID \\
  --database-management-config '{
     "managementType":"BASIC",
     "managementStatus":"ENABLING" }'` },
      docs: "https://docs.oracle.com/en-us/iaas/database-management/doc/database-management-oracle-databases.html",
    },
    insight: {
      level: "L2", icon: "insight", name: "OCI Ops Insights",
      tagline: "Long-term capacity, forecasting, SQL Insights and AWR analytics.",
      lz: "Add as the capacity-intelligence layer after databases/hosts are onboarded; pairs with Database Management.",
      exec: ["<b>Answers:</b> are we at risk of capacity exhaustion?", "Fewer capacity-related incidents; better rightsizing and forecasting."],
      arch: ["Enable early to collect baselines; review trends monthly.", "CPU/storage/memory/I-O forecasting + exhaustion dates.", "Ops Insights finds trends; Database Management diagnoses now."],
      prac: ["Enable a database for Ops Insights capacity + SQL analytics."],
      code: { lang: "OCI CLI", body: `oci opsi database-insights \\
  enable-database-insight \\
  --resource-type EXTERNAL_PDB \\
  --database-id $DB_OCID \\
  --compartment-id $OBS_CMPT` },
      docs: "https://docs.oracle.com/en-us/iaas/operations-insights/doc/operations-insights.html",
    },
    analyze: {
      level: "L2", icon: "analyze", name: "OCI Log Analytics",
      tagline: "Index, enrich, cluster and correlate logs for root-cause work.",
      lz: "Add the advanced analysis tier when log search alone is not enough; feed it from Logging via Connector Hub.",
      exec: ["<b>Answers:</b> why did it happen?", "Pattern detection, clustering and link analysis across sources."],
      arch: ["Standardize sources, parsers, entities, fields.", "Saved searches for repeated investigations; scheduled searches as detections.", "Version parsing + enrichment logic."],
      prac: ["OCL cluster query surfaces anomalous log signatures."],
      code: { lang: "OCL", body: `* | link span = 1minute Time
  | stats count by 'Log Source', Label
  | cluster t = 0.8
  | where Cluster Sample Count > 50` },
      docs: "https://docs.oracle.com/en-us/iaas/log-analytics/home.htm",
    },
    agent: {
      level: "L2", icon: "agent", name: "Management Agent & Gateway",
      tagline: "Secure collection from external, on-prem and hybrid targets.",
      lz: "Add-on for hybrid Landing Zones: place agents per data center / segment to reach external DBs and hosts.",
      exec: ["<b>Answers:</b> how do external targets reach OCI securely?"],
      arch: ["Agent placement per DC / network segment; Gateway for centralized outbound HTTPS.", "Monitor agent + gateway health; document proxy/firewall/DNS/TLS.", "Feeds Log Analytics, Ops Insights, Database Management."],
      prac: ["Install + register the agent with an install key."],
      code: { lang: "Shell", body: `# Install key downloaded from Management Agents console
./installer.sh -i input.rsp
# input.rsp -> ManagementAgentInstallKey=<KEY>
systemctl status mgmt_agent` },
      docs: "https://docs.oracle.com/en-us/iaas/management-agents/home.htm",
    },
    apm: {
      level: "L3", icon: "apm", name: "OCI APM + OpenTelemetry",
      tagline: "Distributed tracing, service topology, RUM and synthetics.",
      lz: "Add an APM domain per environment as a Landing Zone add-on; instrument workloads with OTel or APM agents.",
      exec: ["<b>Answers:</b> why is the transaction slow and what is the business impact?", "End-to-end visibility, faster root cause, user-experience monitoring."],
      arch: ["APM domains by environment / boundary; standardize service names before onboarding teams.", "OTLP ingest via OpenTelemetry; W3C trace context.", "Correlate traces ↔ logs via trace.id / span.id; synthetics for critical journeys."],
      prac: ["Point the OpenTelemetry SDK at the APM OTLP endpoint with a private data key."],
      code: { lang: "OpenTelemetry (env)", body: `OTEL_EXPORTER_OTLP_ENDPOINT=\\
  https://<apm-domain>.apm-agent.<rgn>.oci.oraclecloud.com/20200101
OTEL_EXPORTER_OTLP_HEADERS=\\
  "Authorization=dataKey <PRIVATE_DATA_KEY>"
OTEL_SERVICE_NAME=checkout-api
OTEL_PROPAGATORS=tracecontext,baggage` },
      docs: "https://docs.oracle.com/iaas/application-performance-monitoring/doc/configure-open-source-tracing-systems.html",
    },
    hub: {
      level: "L3", icon: "hub", name: "OCI Connector Hub",
      tagline: "Move telemetry between Logging, Log Analytics, Object Storage, Streaming, Functions.",
      lz: "Add routing pipelines after logging is in place — archive, SIEM export, log-to-analytics, automation fan-out.",
      exec: ["<b>Answers:</b> how does data get where it is needed?", "Enables archive, SIEM export and operational automation."],
      arch: ["Routes: Logging → Log Analytics / Object Storage / Streaming / Functions.", "Include failure handling + delivery monitoring."],
      prac: ["Service connector moves a log group to Log Analytics."],
      code: { lang: "OCI CLI", body: `oci sch service-connector create \\
  --display-name logs-to-la \\
  --source '{"kind":"logging","logSources":[{"logGroupId":"$LG"}]}' \\
  --target '{"kind":"loggingAnalytics","logGroupId":"$LA_LG"}'` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/connector-hub/home.htm",
    },
    ai: {
      level: "L3", icon: "ai", name: "Advanced Ops & AI",
      tagline: "LogAn clustering, capacity forecasting, GenAI/MCP-assisted operations.",
      lz: "The maturity add-on: layer anomaly detection, forecasting and AI-assisted triage onto a working stack.",
      exec: ["<b>Target state:</b> proactive operations, anomaly detection, predictive analytics, reduced MTTR.", "Business-service SLOs and error budgets."],
      arch: ["LogAn clustering + scheduled detections.", "Ops Insights forecasting feeds capacity reviews.", "GenAI / MCP tooling for assisted investigation over correlated signals."],
      prac: ["Scheduled OCL detection raises an event on anomaly spikes."],
      code: { lang: "OCL (scheduled)", body: `* | where Severity = 'error'
  | timestats count as errs by 'Service'
  | where errs > forecast(errs) * 3
# schedule: every 5m -> Notifications: prod-warning` },
      docs: "https://docs.oracle.com/en-us/iaas/log-analytics/home.htm",
    },
  };

  /* ---- Use-case patterns (the design-guide architecture patterns) ---- */
  const PATTERNS = {
    trad: { name: "Traditional Enterprise App", k: "PATTERN 01",
      desc: "LB, web/app tiers, middleware, Oracle DB, batch and integrations.",
      start: "Start at L1, then make L2 (database) your priority.",
      path: ["metric","log","analyze","db","insight","apm","audit","bell"] },
    dbc: { name: "Oracle Database-Centric", k: "PATTERN 02",
      desc: "Exadata, Autonomous AI DB, Base DB, Data Guard, external on-prem DBs.",
      start: "L2 is the centre of gravity — Database Management + Ops Insights first.",
      path: ["db","insight","metric","log","agent","audit","bell"] },
    oke: { name: "Cloud-Native on OKE", k: "PATTERN 03",
      desc: "Kubernetes, microservices, API Gateway, Streaming, Autonomous AI DB.",
      start: "Pair L1 with L3 tracing early; OpenTelemetry from day one.",
      path: ["apm","metric","log","analyze","db","insight","event","bell","hub"] },
    apps: { name: "Oracle Apps & Middleware", k: "PATTERN 04",
      desc: "EBS, JD Edwards, PeopleSoft, WebLogic, SOA, Fusion Middleware.",
      start: "L1 + L2; add APM where instrumentation is feasible. Stack Monitoring transitional only.",
      path: ["metric","log","analyze","apm","db","insight","agent"] },
    hybrid: { name: "Hybrid Enterprise Estate", k: "PATTERN 05",
      desc: "OCI + on-prem databases & apps, external tools, existing ITSM.",
      start: "Lead with Management Agent / Gateway, then the full stack.",
      path: ["agent","metric","log","analyze","db","insight","event","bell","hub"] },
  };

  document.documentElement.classList.add("js");

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- Build the ladder ---- */
  function buildLadder() {
    const stations = $$(".station");
    stations.forEach((st) => {
      const lv = st.dataset.level;
      st.style.setProperty("--lvl", LEVELS[lv].color);
      const grid = $(".cards", st);
      Object.entries(C).filter(([, c]) => c.level === lv).forEach(([id, c]) => {
        const b = document.createElement("button");
        b.className = "card";
        b.dataset.comp = id;
        b.setAttribute("aria-haspopup", "dialog");
        b.innerHTML = `
          <div class="card__top">
            <span class="card__ic">${ICON[c.icon]}</span>
            <span class="lzbadge">${ICON.leaf}LZ add-on</span>
          </div>
          <h4>${c.name}</h4>
          <p>${c.tagline}</p>
          <div class="card__foot"><span class="card__more">Inspect ↗</span></div>`;
        b.addEventListener("click", () => openInspector(id));
        grid.appendChild(b);
      });
    });
  }

  /* ---- Slide-over inspector ---- */
  const scrim = $("#scrim");
  const insp = $("#inspector");
  let lastFocus = null;

  function lensList(arr) { return `<ul>${arr.map((x) => `<li>${x}</li>`).join("")}</ul>`; }
  function hl(code) {
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(#.*$)/gm, '<span class="c">$1</span>')
      .replace(/(&quot;|&#39;|'|"[^"]*")/g, (m) => m)
      .replace(/\b(Allow|group|to|read|manage|use|in|tenancy|compartment|where|stats|sort|by|link|cluster|search|timestats|as|count)\b/g, '<span class="k">$1</span>');
  }

  function openInspector(id) {
    const c = C[id];
    if (!c) return;
    const lv = LEVELS[c.level];
    insp.style.setProperty("--lvl", lv.color);
    $("#i-ic").innerHTML = ICON[c.icon];
    $("#i-tier").textContent = lv.label;
    $("#i-name").textContent = c.name;
    $("#i-tag").textContent = c.tagline;
    $("#i-lz").innerHTML = c.lz;
    $("#i-exec").innerHTML = lensList(c.exec);
    $("#i-arch").innerHTML = lensList(c.arch);
    const pracHTML = lensList(c.prac) + `
      <div class="codeblock">
        <div class="codeblock__bar">
          <span class="codeblock__lang">${c.code.lang}</span>
          <button class="copybtn" id="i-copy">Copy</button>
        </div>
        <pre><code>${hl(c.code.body)}</code></pre>
      </div>`;
    $("#i-prac").innerHTML = pracHTML;
    $("#i-docs").href = c.docs;
    selectLens(0);

    $("#i-copy").addEventListener("click", (e) => {
      navigator.clipboard?.writeText(c.code.body).then(() => {
        e.target.textContent = "Copied ✓"; e.target.classList.add("ok");
        setTimeout(() => { e.target.textContent = "Copy"; e.target.classList.remove("ok"); }, 1600);
      });
    });

    lastFocus = document.activeElement;
    scrim.classList.add("open");
    insp.classList.add("open");
    insp.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    $("#i-close").focus();
  }

  function closeInspector() {
    scrim.classList.remove("open");
    insp.classList.remove("open");
    insp.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    lastFocus?.focus();
  }

  function selectLens(idx) {
    $$(".lens button").forEach((b, i) => b.setAttribute("aria-selected", i === idx));
    $$(".lenspanel").forEach((p, i) => p.classList.toggle("active", i === idx));
  }

  /* ---- Finder ---- */
  function runFinder(key) {
    const p = PATTERNS[key];
    const res = $("#finderResult");
    $("#fr-name").textContent = p.name;
    $("#fr-start").textContent = p.start;
    const path = $("#fr-path");
    path.innerHTML = "";
    p.path.forEach((id, i) => {
      const c = C[id];
      const chip = document.createElement("button");
      chip.className = "pathchip";
      chip.style.color = LEVELS[c.level].color;
      chip.innerHTML = `<span class="dot"></span><span>${c.name}</span>`;
      chip.addEventListener("click", () => openInspector(id));
      path.appendChild(chip);
      if (i < p.path.length - 1) {
        const a = document.createElement("span");
        a.className = "arrow"; a.textContent = "→";
        path.appendChild(a);
      }
    });
    res.classList.add("show");
    // highlight matching cards in ladder
    const set = new Set(p.path);
    $$(".card").forEach((card) => card.classList.toggle("dim", !set.has(card.dataset.comp)));
    $$(".uc").forEach((u) => u.setAttribute("aria-pressed", u.dataset.uc === key));
    res.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function clearFinder() {
    $$(".card").forEach((card) => card.classList.remove("dim"));
  }

  /* ---- Scroll progress + reveal ---- */
  function scrollFx() {
    const bar = $("#scrollbar");
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.width = pct + "%";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!window.IntersectionObserver) { $$(".reveal").forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((e) => io.observe(e));
  }

  /* ---- Wire up ---- */
  document.addEventListener("DOMContentLoaded", () => {
    buildLadder();
    scrollFx();
    $("#i-close").addEventListener("click", closeInspector);
    scrim.addEventListener("click", closeInspector);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && insp.classList.contains("open")) closeInspector(); });
    $$(".lens button").forEach((b, i) => b.addEventListener("click", () => selectLens(i)));
    $$(".uc").forEach((u) => u.addEventListener("click", () => runFinder(u.dataset.uc)));
    $("#finderClear")?.addEventListener("click", () => {
      clearFinder(); $("#finderResult").classList.remove("show");
      $$(".uc").forEach((u) => u.setAttribute("aria-pressed", "false"));
    });
  });
})();
