/* =========================================================================
   OCI Observability Atlas — guide.js
   Data-driven catalog rendered with Lucide icons (inlined for a
   self-contained, on-brand build per the Redwood icon guidance).
   ========================================================================= */
(() => {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---- Lucide icon paths (verbatim Lucide geometry, 24x24 stroke) ---- */
  const LU = {
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    "tag": '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    "lock": '<rect width="18" height="12" x="3" y="10" rx="2"/><circle cx="12" cy="16" r="1"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
    "file-search": '<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="m9 18-1.5-1.5"/><circle cx="5" cy="14" r="3"/>',
    "activity": '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    "scroll-text": '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    "bell": '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    "zap": '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    "trending-up": '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
    "scan-search": '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/>',
    "server": '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
    "waypoints": '<circle cx="12" cy="4.5" r="2.5"/><path d="m10.2 6.3-3.9 3.9"/><circle cx="4.5" cy="12" r="2.5"/><path d="M7 12h10"/><circle cx="19.5" cy="12" r="2.5"/><path d="m13.8 17.7 3.9-3.9"/><circle cx="12" cy="19.5" r="2.5"/>',
    "workflow": '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    "sparkles": '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    "puzzle": '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 19.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1-.474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L7.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 7.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1 .474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>',
    "layers": '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    "boxes": '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>',
    "cloud": '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "arrow-down": '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    "copy": '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    "compass": '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
    "heart-pulse": '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    "layout-dashboard": '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    "coffee": '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
    "calendar-clock": '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/>',
    "hard-drive": '<line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/>',
    "grid": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    "brain-circuit": '<path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M12 13h4"/><path d="M12 18h6a2 2 0 0 1 2 2v1"/><path d="M12 8h8"/><path d="M16 8V5a2 2 0 0 1 2-2"/><circle cx="16" cy="13" r=".5"/><circle cx="18" cy="3" r=".5"/><circle cx="20" cy="21" r=".5"/><circle cx="20" cy="8" r=".5"/>',
    "flask-conical": '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
    "shield-alert": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    "bot": '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    "git-branch": '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    "database-zap": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 15 21.84"/><path d="M21 5V8"/><path d="M21 12 18 17h4l-3 5"/><path d="M3 12A9 3 0 0 0 14.59 14.87"/>',
    "archive": '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    "route": '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    "gauge": '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    "scale": '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    "shield-half": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 22V2"/>',
  };
  function ic(name) {
    return `<svg class="lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LU[name] || ""}</svg>`;
  }

  const LEVELS = {
    L0: { color: "var(--l0)", tint: "var(--l0-tint)", label: "L0 · Govern and land" },
    L1: { color: "var(--l1)", tint: "var(--l1-tint)", label: "L1 · See and alert" },
    L2: { color: "var(--l2)", tint: "var(--l2-tint)", label: "L2 · Diagnose deep" },
    L3: { color: "var(--l3)", tint: "var(--l3-tint)", label: "L3 · Correlate and automate" },
    L4: { color: "var(--l4)", tint: "var(--l4-tint)", label: "L4 · Observe and govern AI agents" },
  };

  /* ---- Component catalog (OCI Observability & Management services) ---- */
  const C = {
    iam: { level: "L0", icon: "shield-check", name: "Observability compartment and IAM",
      tagline: "A governed home for shared telemetry, with least-privilege roles.",
      lz: "Extends the Landing Zone compartment topology with a dedicated observability compartment and policy set. Add it after the core Landing Zone exists — no rebuild required.",
      exec: ["Separation of duties, and one owned home for dashboards, logs, connectors, and notifications.", "Fewer audit findings and no shadow monitoring."],
      arch: ["A central observability compartment, or platform boundary, for shared resources.", "Groups: <b>obs-platform-admins, obs-readers, obs-log-admins, obs-apm-admins, dbobs-admins, security-audit-readers, automation-operators</b>.", "Least privilege — avoid one broad observability administrator group."],
      prac: ["Scope log and metric reads across the tenancy for the reader group."],
      code: { lang: "OCI IAM policy", body: `Allow group obs-readers to read metrics in tenancy
Allow group obs-readers to read log-content in tenancy
Allow group obs-log-admins to manage log-groups in compartment observability
Allow group obs-platform-admins to manage alarms in compartment observability
Allow group automation-operators to use fn-function in compartment observability` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Identity/home.htm" },
    tag: { level: "L0", icon: "tag", name: "Tagging and naming standards",
      tagline: "The correlation backbone — every signal traceable to a business service.",
      lz: "Define tag namespaces and tag defaults as a Landing Zone add-on, so every resource created afterward inherits them automatically.",
      exec: ["Connects technical signals to business services, owners, and cost.", "Drives alarm severity, retention, and showback."],
      arch: ["Standard tags: <b>business_service, environment, criticality, owner, cost_center, data_classification, observability_tier</b>.", "Apply through tag defaults at the compartment level."],
      prac: ["Use defined tags plus tag defaults so resources are tagged on creation."],
      code: { lang: "Tag defaults", body: `# Defined tag namespace: Observability
business_service   = customer-portal     # service-level grouping
environment        = prod                 # prod | preprod | test | dev
criticality        = tier-1               # tier-0..tier-3 drives severity
observability_tier = enhanced             # baseline | enhanced | critical` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Tagging/home.htm" },
    vault: { level: "L0", icon: "lock", name: "OCI Vault and secrets",
      tagline: "Credentials for Database Management, APM, agents, and automation — never inline.",
      lz: "Vault is a standard Landing Zone security service. Add an observability key and secret scope for monitoring credentials.",
      exec: ["Protects monitoring credentials and supports compliance."],
      arch: ["Define secret ownership, rotation cadence, break-glass, and audit review.", "Separate read-only monitoring, diagnostic, and administrative credentials."],
      prac: ["Database Management and the Management Agent read monitoring passwords from Vault by OCID."],
      code: { lang: "OCI CLI", body: `oci vault secret create-base64 \\
  --compartment-id $OBS_CMPT \\
  --secret-name dbsnmp-monitoring \\
  --vault-id $VAULT --key-id $KEY \\
  --secret-content-content $(printf '%s' "$PW" | base64)` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/KeyManagement/home.htm" },
    audit: { level: "L0", icon: "file-search", name: "OCI Audit",
      tagline: "Tenancy-wide API and change visibility, on by default.",
      lz: "Audit is always on. The add-on is the export and detection layer — Connector Hub to Object Storage or a SIEM.",
      exec: ["Governance, compliance, and forensic investigation of who changed what."],
      arch: ["Restrict who can read Audit data.", "Export when retention exceeds default service behavior.", "Build detections for high-risk changes: policy, network, key, and deletion events."],
      prac: ["Audit records are queryable in Logging and routable through Connector Hub."],
      code: { lang: "Log search (OCL)", body: `search "audit"
| where data.eventName in ('UpdatePolicy','DeleteVcn','ScheduleKeyDeletion')
| stats count by data.identity.principalName, data.eventName
| sort -count` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Audit/home.htm" },
    metric: { level: "L1", icon: "activity", name: "OCI Monitoring",
      tagline: "Metrics, MQL queries, and actionable alarms — the health foundation.",
      lz: "Add alarms and dashboards onto any Landing Zone workload after deployment. Native OCI metrics need no agent.",
      exec: ["Answers the question, is the service healthy?", "Reduces mean time to detect with availability, saturation, error-rate, and latency alarms."],
      arch: ["Use metric namespaces and dimensions consistently.", "Alarm only on actionable conditions; set severity by business impact, not threshold alone.", "Use maintenance suppression, and review alarm history to remove noise."],
      prac: ["This alarm fires when average CPU over one minute exceeds 85 percent on any matching instance."],
      code: { lang: "MQL", body: `CpuUtilization[1m]{resourceDisplayName =~ "prod-*"}
  .mean() > 85

# One datapoint breaching over 5 minutes
# Severity: critical  ->  topic: prod-critical` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Monitoring/home.htm" },
    log: { level: "L1", icon: "scroll-text", name: "OCI Logging",
      tagline: "Centralized, managed log collection from resources, applications, and agents.",
      lz: "Enable service logs and custom log groups as a Landing Zone add-on, per compartment.",
      exec: ["Answers the question, what happened?", "A central, searchable record of events and errors."],
      arch: ["Define log groups by environment, domain, or data classification.", "Use structured JSON; include service.name, environment, region, trace.id, and correlation.id.", "Separate operational logs from sensitive security logs."],
      prac: ["Ingest a custom application log through the unified Logging agent."],
      code: { lang: "Logging agent (JSON)", body: `{
  "source": { "name": "app-logs",
    "paths": ["/var/log/app/*.json"] },
  "logGroupId": "ocid1.loggroup.oc1..app",
  "parser": { "type": "json",
    "fieldTimeKey": "timestamp" }
}` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Logging/home.htm" },
    bell: { level: "L1", icon: "bell", name: "OCI Notifications",
      tagline: "Topics and subscriptions that route alarms to the right people and systems.",
      lz: "Stand up severity-based topics as a Landing Zone add-on, then wire alarms and events into them later.",
      exec: ["Answers the question, who needs to act?", "The right alert reaches the right channel, every time."],
      arch: ["Topics by severity, service, and ownership — prod-critical, prod-warning, non-prod, security, capacity.", "Subscriptions: email, HTTPS, PagerDuty, Functions, ITSM."],
      prac: ["Publish an alarm to a topic; an HTTPS subscription opens an ITSM incident."],
      code: { lang: "OCI CLI", body: `oci ons topic create -c $OBS_CMPT --name prod-critical
oci ons subscription create --topic-id $TOPIC \\
  --protocol HTTPS \\
  --subscription-endpoint https://itsm.example.com/oci/incident` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Notification/home.htm" },
    event: { level: "L1", icon: "zap", name: "OCI Events",
      tagline: "React to resource state changes — the trigger layer for automation.",
      lz: "Add event rules per compartment to drive notifications and remediation.",
      exec: ["Answers the question, what should happen automatically?"],
      arch: ["Route state-change events to Notifications, Functions, or Streaming.", "This is the foundation for event-driven remediation at L3."],
      prac: ["A rule matches a database-down event and targets the critical topic."],
      code: { lang: "Event rule", body: `{
  "eventType": [
    "com.oraclecloud.databaseservice.databasedown"
  ],
  "data": { "compartmentId": "ocid1.compartment.oc1..prod" }
}
# action -> ons-topic: prod-critical` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/Events/home.htm" },
    db: { level: "L2", icon: "database", name: "OCI Database Management",
      tagline: "Fleet monitoring, Performance Hub, SQL, sessions, and wait events.",
      lz: "A first-class add-on for any Landing Zone with Oracle databases. Enable Basic or Full per database, after deployment.",
      exec: ["Answers the question, which database or SQL workload is affected?", "Cuts database troubleshooting time. Databases are a first-class domain, not a DBA-only add-on."],
      arch: ["Basic for broad baseline; Full for RAC, Exadata, Data Guard, and performance-sensitive databases.", "Enable per region — cross-region monitoring is not available.", "Private endpoint or Management Agent; credentials in Vault; Database Groups by service and criticality."],
      prac: ["Enable diagnostics and management on a cloud database."],
      code: { lang: "OCI CLI", body: `oci database database update \\
  --database-id $DB_OCID \\
  --database-management-config '{
     "managementType":"BASIC",
     "managementStatus":"ENABLING" }'` },
      docs: "https://docs.oracle.com/en-us/iaas/database-management/doc/database-management-oracle-databases.html" },
    insight: { level: "L2", icon: "trending-up", name: "OCI Ops Insights",
      tagline: "Long-term capacity, forecasting, SQL Insights, and AWR analytics.",
      lz: "Add the capacity-intelligence layer after databases and hosts are onboarded. It pairs with Database Management.",
      exec: ["Answers the question, are we at risk of capacity exhaustion?", "Fewer capacity-related incidents, and better rightsizing and forecasting."],
      arch: ["Enable early to collect baselines; review trends monthly.", "Forecast CPU, storage, memory, and I/O, with exhaustion dates.", "Ops Insights finds the trend; Database Management diagnoses the moment."],
      prac: ["Enable a database for Ops Insights capacity and SQL analytics."],
      code: { lang: "OCI CLI", body: `oci opsi database-insights \\
  enable-database-insight \\
  --resource-type EXTERNAL_PDB \\
  --database-id $DB_OCID \\
  --compartment-id $OBS_CMPT` },
      docs: "https://docs.oracle.com/en-us/iaas/operations-insights/doc/operations-insights.html" },
    analyze: { level: "L2", icon: "scan-search", name: "OCI Log Analytics",
      tagline: "Index, enrich, cluster, and correlate logs for root-cause work.",
      lz: "Add the advanced analysis tier when log search alone is not enough. Feed it from Logging through Connector Hub.",
      exec: ["Answers the question, why did it happen?", "Pattern detection, clustering, and link analysis across sources."],
      arch: ["Standardize sources, parsers, entities, and fields.", "Saved searches for repeated investigations; scheduled searches as detections.", "Keep parsing and enrichment logic versioned and documented."],
      prac: ["A cluster query surfaces anomalous log signatures."],
      code: { lang: "OCL", body: `* | link span = 1minute Time
  | stats count by 'Log Source', Label
  | cluster t = 0.8
  | where Cluster Sample Count > 50` },
      docs: "https://docs.oracle.com/en-us/iaas/log-analytics/home.htm" },
    agent: { level: "L2", icon: "server", name: "Management Agent and Gateway",
      tagline: "Secure collection from external, on-premises, and hybrid targets.",
      lz: "An add-on for hybrid Landing Zones. Place agents per data center or segment to reach external databases and hosts.",
      exec: ["Answers the question, how do external targets reach OCI securely?", "Three agent types cover OCI, hybrid, and custom-log cases — see the comparison below."],
      arch: ["Three types: <b>Oracle Cloud Agent</b> (preinstalled on OCI compute, the default when it fits), <b>Management Agent</b> (low-latency, hybrid — external and on-premises targets), and <b>Unified Monitoring Agent</b> (fluentd-based custom logs to OCI Logging).", "Place Management Agents per data center or segment; use the Gateway for centralized outbound HTTPS.", "Feeds Logging Analytics, Database Management, Ops Insights, Java Management, and Stack Monitoring. A Helm chart deploys it on OKE as a StatefulSet."],
      prac: ["Install and register the agent with an install key."],
      code: { lang: "Shell", body: `# Install key from the Management Agents console
./installer.sh -i input.rsp
# input.rsp -> ManagementAgentInstallKey=<KEY>
systemctl status mgmt_agent` },
      docs: "https://docs.oracle.com/en-us/iaas/management-agents/home.htm" },
    apm: { level: "L3", icon: "waypoints", name: "OCI APM with OpenTelemetry",
      tagline: "Distributed tracing, service topology, real-user, and synthetic monitoring.",
      lz: "Add an APM domain per environment as a Landing Zone add-on, then instrument workloads with OpenTelemetry or APM agents.",
      exec: ["Answers the questions, why is the transaction slow, and what is the business impact?", "End-to-end visibility, faster root cause, and real-user experience monitoring."],
      arch: ["APM domains by environment or boundary; standardize service names before onboarding teams.", "Ingest OTLP through OpenTelemetry; standardize on W3C trace context.", "Correlate traces with logs through trace.id and span.id; add synthetics for critical journeys."],
      prac: ["Point the OpenTelemetry SDK at the APM OTLP endpoint with a private data key."],
      code: { lang: "OpenTelemetry (env)", body: `OTEL_EXPORTER_OTLP_ENDPOINT=\\
  https://<domain>.apm-agent.<rgn>.oci.oraclecloud.com/20200101
OTEL_EXPORTER_OTLP_HEADERS=\\
  "Authorization=dataKey <PRIVATE_DATA_KEY>"
OTEL_SERVICE_NAME=checkout-api
OTEL_PROPAGATORS=tracecontext,baggage` },
      docs: "https://docs.oracle.com/iaas/application-performance-monitoring/doc/configure-open-source-tracing-systems.html" },
    hub: { level: "L3", icon: "workflow", name: "OCI Connector Hub",
      tagline: "Move telemetry between Logging, Log Analytics, Object Storage, Streaming, and Functions.",
      lz: "Add routing pipelines after logging is in place — archive, SIEM export, log-to-analytics, and automation fan-out.",
      exec: ["Answers the question, how does data get where it is needed?", "Enables archive, SIEM export, and operational automation."],
      arch: ["Routes: Logging to Log Analytics, Object Storage, Streaming, or Functions.", "Include failure handling and delivery monitoring."],
      prac: ["A service connector moves a log group into Log Analytics."],
      code: { lang: "OCI CLI", body: `oci sch service-connector create \\
  --display-name logs-to-la \\
  --source '{"kind":"logging","logSources":[{"logGroupId":"$LG"}]}' \\
  --target '{"kind":"loggingAnalytics","logGroupId":"$LA_LG"}'` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/connector-hub/home.htm" },
    ai: { level: "L3", icon: "sparkles", name: "Advanced operations and AI",
      tagline: "Log Analytics clustering, capacity forecasting, and AI-assisted operations.",
      lz: "The maturity add-on. Layer anomaly detection, forecasting, and AI-assisted triage onto a working stack.",
      exec: ["The target state — proactive operations, anomaly detection, predictive analytics, and reduced mean time to restore.", "Business-service SLOs and error budgets."],
      arch: ["Log Analytics clustering plus scheduled detections.", "Ops Insights forecasting feeds the capacity review cycle.", "AI-assisted investigation works across the correlated signals you built at L1 through L3."],
      prac: ["A scheduled detection raises an event when the error rate exceeds its forecast."],
      code: { lang: "OCL (scheduled)", body: `* | where Severity = 'error'
  | timestats count as errs by 'Service'
  | where errs > forecast(errs) * 3
# schedule: every 5m -> Notifications: prod-warning` },
      docs: "https://docs.oracle.com/en-us/iaas/log-analytics/home.htm" },

    /* --- Additional L1 coverage --- */
    health: { level: "L1", icon: "heart-pulse", name: "OCI Health Checks",
      tagline: "Synthetic availability probes from global vantage points.",
      lz: "Add HTTP, HTTPS, and ping probes as a Landing Zone add-on, with no change to the monitored endpoint.",
      exec: ["Confirms endpoints and journeys are reachable, from the outside in.", "Often the first signal of an outage, and a feed for availability SLOs."],
      arch: ["Vantage points across regions; HTTP, HTTPS, and ping checks.", "Results become metrics and alarms in Monitoring.", "Pair with APM synthetics for full user-journey checks."],
      prac: ["Create an HTTP health check against a public endpoint."],
      code: { lang: "OCI CLI", body: `oci health-checks http-monitor create \\
  --compartment-id $OBS_CMPT --display-name portal-https \\
  --protocol HTTPS --targets '["portal.example.com"]' \\
  --vantage-point-names '["aws-iad","goo-bru"]' \\
  --interval-in-seconds 30` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/HealthChecks/Concepts/healthchecks.htm" },
    dash: { level: "L1", icon: "layout-dashboard", name: "Management and Console Dashboards",
      tagline: "Role-specific views that assemble metrics, logs, and traces.",
      lz: "Build dashboards onto any Landing Zone workload and share saved views per audience.",
      exec: ["One screen per audience — executive, operations, DBA, capacity, security.", "A dashboard without an owner goes stale, so assign one."],
      arch: ["Management Dashboards for cross-service views; Console Dashboards for metric widgets.", "Filter by tags: business_service, environment, criticality.", "Saved searches and widgets, composed per role."],
      prac: ["Dashboards are defined as JSON and can be saved and shared."],
      code: { lang: "Dashboard (JSON)", body: `{
  "displayName": "Operations — prod",
  "widgets": [
    { "type": "METRIC", "query": "CpuUtilization[1m].mean()" },
    { "type": "LOG", "savedSearchId": "ocid1.logsavedsearch..." }
  ]
}` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/ManagementDashboard/home.htm" },

    /* --- Additional L2 coverage --- */
    stack: { level: "L2", icon: "layers", name: "OCI Stack Monitoring",
      tagline: "Full-stack monitoring for application stacks and their hosts.",
      lz: "Add for existing or transitional estates. Documented as deprecated to 23 January 2027 — not a default for net-new designs.",
      exec: ["Health and performance of app servers, databases, and the infrastructure beneath them.", "Use for existing-estate or migration cases, with a documented transition plan."],
      arch: ["Discovers stack resources and their relationships.", "Treat as transitional — prefer Monitoring, APM, and Database Management for net-new.", "Document the deprecation transition plan before the date."],
      prac: ["Enable monitoring on a discovered resource through the Management Agent."],
      code: { lang: "Note", body: `# Stack Monitoring — available until 2026-... (deprecated 2027-01-23)
# Net-new designs: prefer Monitoring + APM + Database Management
# Existing estates: document a transition plan before the date` },
      docs: "https://docs.oracle.com/en-us/iaas/stack-monitoring/home.htm" },
    java: { level: "L2", icon: "coffee", name: "Java Management Service",
      tagline: "Discover, monitor, and patch the Java estate across hosts.",
      lz: "Add through the Management Agent to inventory and govern the Java fleet, after deployment.",
      exec: ["Finds which Java versions run where, what needs updates, and which applications use them.", "Reduces risk from unpatched or unknown Java runtimes."],
      arch: ["Uses the Management Agent and fleets.", "Advanced features: Java Flight Recorder performance and crypto analysis.", "Feed findings into patch and compliance workflows."],
      prac: ["Java usage and inventory are reported per fleet by the agent."],
      code: { lang: "Concept", body: `# Java Management Service
# - discover JDKs + applications via the Management Agent
# - flag versions needing updates or past end of support
# - drill into Java Flight Recorder performance data` },
      docs: "https://docs.oracle.com/en-us/iaas/jms/home.htm" },

    /* --- Additional L3 coverage (manage + automate) --- */
    resched: { level: "L3", icon: "calendar-clock", name: "OCI Resource Scheduler",
      tagline: "Schedule start, stop, and lifecycle actions to cut cost and toil.",
      lz: "Add schedules onto Landing Zone resources after deployment, with no redesign.",
      exec: ["Automatically stops non-production resources off-hours — a direct cost saving.", "Removes manual start and stop toil."],
      arch: ["Schedules act on tagged resource sets.", "Combine with tags such as environment = dev or test.", "Audit scheduled actions through Events and Audit."],
      prac: ["A schedule stops development instances each evening."],
      code: { lang: "Concept", body: `# Resource Scheduler
# action:     STOP_RESOURCE
# resources:  query by tag  environment = dev
# recurrence: FREQ=DAILY;BYHOUR=20   (stop at 20:00)` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/resource-scheduler/home.htm" },
    osmh: { level: "L3", icon: "hard-drive", name: "OS Management Hub",
      tagline: "Operating-system patch, configuration, and lifecycle across the fleet.",
      lz: "Add to manage the OS layer of Landing Zone compute, on OCI and hybrid hosts.",
      exec: ["Keeps the operating-system layer patched and compliant at fleet scale.", "Reduces vulnerability exposure on the hosts agents run on."],
      arch: ["Managed instances grouped into lifecycle stages and software sources.", "Scheduled patch jobs with compliance reporting.", "Pairs with Cloud Guard Instance Security for runtime protection."],
      prac: ["Patch jobs run against a managed-instance group on a schedule."],
      code: { lang: "Concept", body: `# OS Management Hub
# - register managed instances (Management Agent)
# - group by lifecycle stage + software source
# - schedule patch jobs; report compliance` },
      docs: "https://docs.oracle.com/en-us/iaas/osmh/doc/overview.htm" },
    fleet: { level: "L3", icon: "grid", name: "Fleet Application Management",
      tagline: "Fleet-wide application lifecycle and maintenance automation.",
      lz: "Add to standardize patching and maintenance across many applications at once.",
      exec: ["Consistent, scheduled maintenance across large application estates.", "Less drift, and fewer manual change windows."],
      arch: ["Group resources into fleets with runbooks and maintenance definitions.", "Schedule and track lifecycle operations.", "Integrates with the broader O&M signal set."],
      prac: ["Define a fleet and run a scheduled maintenance task across it."],
      code: { lang: "Concept", body: `# Fleet Application Management
# - define a fleet of related resources
# - attach lifecycle / patch runbooks
# - schedule + track maintenance across the fleet` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/fleet-management/home.htm" },

    /* --- L4: AI agent observability + governance --- */
    ai_apm: { level: "L4", icon: "waypoints", name: "Agent tracing — APM and OpenTelemetry",
      tagline: "Every reasoning step, tool call, and model call as a span you can follow.",
      lz: "Add an APM domain per environment, then instrument agents with the OpenTelemetry GenAI conventions.",
      exec: ["Answers, why is the agent slow or wrong, and where in the chain did it go wrong?", "A single trace follows one task across every agent, tool, and model it touches."],
      arch: ["GenAI spans: invoke_agent, invoke_workflow, execute_tool, chat or inference, and retrieval.", "OTLP ingest through the OTel Collector (redact and route); fan out to Tempo at the same time.", "Correlate traces to logs via trace.id and span.id; add synthetic and real-user monitoring."],
      prac: ["Point the OpenTelemetry SDK at the APM OTLP endpoint with a private data key."],
      code: { lang: "OpenTelemetry (env)", body: `OTEL_EXPORTER_OTLP_ENDPOINT=\\
  https://<domain>.apm-agent.<rgn>.oci.oraclecloud.com/20200101
OTEL_EXPORTER_OTLP_HEADERS="Authorization=dataKey <PRIVATE_DATA_KEY>"
OTEL_SERVICE_NAME=triage-agent
# span tree: invoke_agent > execute_tool > chat   (gen_ai.* attributes)` },
      docs: "https://docs.oracle.com/iaas/application-performance-monitoring/doc/configure-open-source-tracing-systems.html" },
    ai_genai: { level: "L4", icon: "brain-circuit", name: "LLM-as-a-judge — Generative AI and guardrails",
      tagline: "A governed model scores agent output for quality and safety, at scale.",
      lz: "Add a private Generative AI endpoint and guardrails; evaluation data never leaves the tenancy trust boundary.",
      exec: ["Answers, is the agent correct, grounded, safe, and within policy?", "Scores quality and safety at a volume humans cannot review alone."],
      arch: ["The judge model is served by OCI Generative AI as a private, governed endpoint.", "Guardrails add deterministic signals — content moderation, prompt-injection, and PII.", "Calibrate: anchor rubrics to human labels, sample verdicts, track judge–human agreement. The judge is itself an agent — govern it under the same Zero Trust."],
      prac: ["The judge scores an output against a rubric; guardrails add the hard checks."],
      code: { lang: "Concept", body: `# LLM-as-a-judge on OCI Generative AI
score = judge(rubric, agent_output, retrieved_context)
guard = guardrails(agent_output)    # moderation / prompt-injection / PII
advance = score >= threshold and guard.safe   # gate the change` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm" },
    ai_logan: { level: "L4", icon: "scan-search", name: "Agent anomaly detection — Logging Analytics",
      tagline: "Machine-learning clustering over agent, broker, and gateway logs.",
      lz: "Feed agent logs from Logging through Connector Hub; detections map to MITRE.",
      exec: ["Surfaces unusual agent behaviour you did not predict — drift and tool-call shifts.", "Detections map to MITRE ATT&CK and MITRE ATLAS, in language the SOC already uses."],
      arch: ["Clustering and anomaly detection on a common timeline, with no hand-written rule.", "Scheduled searches as detections; alert on input-distribution and output-quality drift.", "Pivot from an anomalous APM span to the surrounding log detail."],
      prac: ["A scheduled cluster detection flags a shift in tool-call distribution."],
      code: { lang: "OCL", body: `* | where 'Log Source' = 'Agent Logs'
  | cluster t = 0.8
  | where Anomaly = true
# schedule every 5m -> Notifications: prod-warning   (MITRE ATLAS tagged)` },
      docs: "https://docs.oracle.com/en-us/iaas/log-analytics/home.htm" },
    ai_eval: { level: "L4", icon: "flask-conical", name: "Evaluation jobs — OCI Data Science",
      tagline: "Golden-set scoring and judge calibration, orchestrated as jobs.",
      lz: "Add evaluation jobs against curated datasets; scores land beside the operational metrics.",
      exec: ["Turns 'is the new prompt better?' into a measured comparison.", "Builds the baseline that makes change safe."],
      arch: ["A golden set of representative tasks with known-good outcomes.", "Data Science jobs (or Functions) run the suite; scores write to Logging Analytics.", "Sample judge verdicts for human re-calibration."],
      prac: ["A job scores a candidate against the golden set and writes the results."],
      code: { lang: "Python (eval job)", body: `for case in golden_set:
    out = agent.run(case.input)
    log_analytics.put({
        "case": case.id,
        "correct":  judge(case, out),
        "grounded": grounded(out, case.context),
    })   # scores land beside operational metrics` },
      docs: "https://docs.oracle.com/en-us/iaas/data-science/using/home.htm" },
    ai_loop: { level: "L4", icon: "git-branch", name: "Controlled evolution — Functions and DevOps",
      tagline: "Evaluation gates, shadow-to-canary rollout, and automated rollback.",
      lz: "Add evaluation gates to DevOps pipelines; the feedback-loop logic runs in Functions.",
      exec: ["Lets agents improve without each change becoming a gamble.", "A regression caught in canary is reversed before it spreads."],
      arch: ["The eval gate runs the suite as part of promotion — a regression does not advance.", "Roll out shadow, then canary, then wide, watching live metrics and scores.", "Drift detected by Logging Analytics triggers re-evaluation, rollback, or retraining. Findings can tighten the Zero Trust tool allowlist, not just the prompt."],
      prac: ["The pipeline blocks promotion when the evaluation score regresses."],
      code: { lang: "Pipeline (gate)", body: `evaluate:
  run:  eval-suite --golden golden_set --candidate $BUILD
  gate: score.correct >= baseline and score.grounded >= baseline
  on_fail: block                         # no promotion
  on_pass: rollout shadow -> canary -> wide` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/devops/using/home.htm" },
    ai_cgis: { level: "L4", icon: "shield-alert", name: "Agent host runtime — Cloud Guard Instance Security",
      tagline: "osquery-based runtime protection for the hosts agents run on.",
      lz: "Add to extend Cloud Guard from posture management to workload runtime on agent Compute.",
      exec: ["A compromised agent host can fail in ways the agent never reports.", "Catches suspicious processes, unexpected open ports, and script execution."],
      arch: ["Built on the open-source osquery engine, with Oracle-managed detections and ad-hoc fleet queries.", "Findings surface as Cloud Guard problems and flow into Logging Analytics beside agent telemetry.", "Kubernetes Security Posture Management extends the discipline to OKE."],
      prac: ["Run an ad-hoc osquery across the agent host fleet."],
      code: { lang: "osquery (SQL)", body: `SELECT name, path, cmdline FROM processes
WHERE on_disk = 0;   -- process running from a deleted binary
-- Cloud Guard Instance Security -> problem -> Logging Analytics` },
      docs: "https://docs.oracle.com/en-us/iaas/cloud-guard/using/cgis.htm" },
    ai_agents: { level: "L4", icon: "bot", name: "Observability agents — Generative AI Agents and AI Agent Studio",
      tagline: "Triage and correlation agents that watch with you — governed like any agent.",
      lz: "Add an observability agent with scoped, read-only access to APM, Logging Analytics, and Monitoring.",
      exec: ["AI for observability — an agent gathers spans and logs, maps relationships, and proposes a root cause and next step.", "Low-risk actions run through allowlisted tools; high-risk actions are proposed for human approval."],
      arch: ["Build code-first on OCI Generative AI Agents, or enterprise-grade on Oracle AI Agent Studio with built-in observability and governance.", "Frameworks such as LangGraph, instrumented with OpenTelemetry — the observability agent is itself fully traced.", "Runs under the same Zero Trust scoped identity and decision ledger as any other agent."],
      prac: ["A triage agent correlates an anomaly and drafts an incident summary."],
      code: { lang: "LangGraph (sketch)", body: `graph = StateGraph()
graph.add_node("gather",    read_apm_logging_monitoring)  # read-only, scoped
graph.add_node("correlate", build_service_and_agent_map)
graph.add_node("explain",   call_generative_ai_summary)
# high-risk actions -> human approval via the Zero Trust broker` },
      docs: "https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/home.htm" },
    ai_datasafe: { level: "L4", icon: "shield-half", name: "Database security — Data Safe and SQL Firewall",
      tagline: "Security assessment, activity auditing, and allow-listed SQL for Oracle databases.",
      lz: "Add to govern the databases agents query — assessment, auditing, masking, and SQL allow-listing.",
      exec: ["Answers, what did the agent's SQL actually do to the database?", "Allow-listed SQL blocks unexpected statements at the database."],
      arch: ["Data Safe: security and user assessment, activity auditing, data discovery and masking.", "SQL Firewall (Database 23ai): allow-listed SQL and trusted paths per account.", "Feeds the database signal group — sessions, blocked statements, entitlement drift."],
      prac: ["SQL Firewall blocks a statement outside the account's allow-list."],
      code: { lang: "Concept", body: `# Oracle Data Safe + SQL Firewall (Database 23ai)
# - capture an allow-list of normal SQL per account
# - enforce: block + audit statements off the allow-list
# - Data Safe: assess config, audit activity, mask sensitive data` },
      docs: "https://docs.oracle.com/en-us/iaas/data-safe/index.html" },
    ai_avdf: { level: "L4", icon: "archive", name: "Audit Vault and Database Firewall",
      tagline: "Native audit collection and a network SQL firewall — Oracle and third-party, across clouds.",
      lz: "Add as the heterogeneous answer to 'visibility everywhere' for the databases agents reach.",
      exec: ["Answers SQL access for Oracle and third-party databases, wherever they run.", "Blocks policy-violating statements at the boundary."],
      arch: ["Native audit collection consolidates trails from many databases.", "The Database Firewall parses and classifies each statement — allow, log, alert, substitute, or block.", "Supports Oracle, SQL Server, MySQL, PostgreSQL, IBM Db2, SAP Sybase, and MongoDB across clouds."],
      prac: ["The Database Firewall blocks a SQL-injection pattern at the boundary."],
      code: { lang: "Concept", body: `# Audit Vault and Database Firewall (AVDF)
# - collect native audit trails (Oracle + third-party)
# - SQL-grammar engine classifies each statement
# - action: allow | log | alert | substitute | BLOCK` },
      docs: "https://www.oracle.com/security/database-security/audit-vault-database-firewall/" },
  };

  /* ---- Use-case patterns ---- */
  const PATTERNS = {
    trad: { name: "Traditional enterprise application", icon: "boxes",
      start: "Start at L1, then make L2 — the database layer — your priority.",
      path: ["metric","log","analyze","db","insight","apm","audit","bell"] },
    dbc: { name: "Oracle database-centric workload", icon: "database",
      start: "L2 is the centre of gravity. Lead with Database Management and Ops Insights.",
      path: ["db","insight","metric","log","agent","audit","bell"] },
    oke: { name: "Cloud-native on OKE", icon: "boxes",
      start: "Pair L1 with L3 tracing early. Adopt OpenTelemetry from day one.",
      path: ["apm","metric","log","analyze","db","insight","event","bell","hub"] },
    apps: { name: "Oracle applications and middleware", icon: "layers",
      start: "L1 and L2 first; add APM where instrumentation is feasible. Treat Stack Monitoring as transitional only.",
      path: ["metric","log","analyze","apm","db","insight","agent"] },
    hybrid: { name: "Hybrid enterprise estate", icon: "cloud",
      start: "Lead with the Management Agent and Gateway, then add the full stack.",
      path: ["agent","metric","log","analyze","db","insight","event","bell","hub"] },
    agentic: { name: "Agentic and generative-AI workload", icon: "bot",
      start: "This is the L4 path. Instrument with OpenTelemetry GenAI, judge with Generative AI, and govern with Zero Trust.",
      path: ["ai_apm","metric","log","ai_logan","ai_genai","ai_eval","ai_loop","ai_cgis","ai_agents"] },
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- Build the ladder ---- */
  function buildLadder() {
    $$(".station").forEach((st) => {
      const lv = st.dataset.level;
      st.style.setProperty("--lvl", LEVELS[lv].color);
      st.style.setProperty("--lvl-tint", LEVELS[lv].tint);
      const grid = $(".cards", st);
      Object.entries(C).filter(([, c]) => c.level === lv).forEach(([id, c]) => {
        const b = document.createElement("button");
        b.className = "card"; b.dataset.comp = id; b.type = "button";
        b.setAttribute("aria-haspopup", "dialog");
        b.innerHTML = `
          <div class="card__top">
            <span class="card__ic">${ic(c.icon)}</span>
            <span class="addon">${ic("puzzle")} LZ add-on</span>
          </div>
          <h4>${c.name}</h4>
          <p>${c.tagline}</p>
          <div class="card__foot"><span class="card__more">Inspect ${ic("arrow-right")}</span></div>`;
        b.addEventListener("click", () => openInspector(id));
        grid.appendChild(b);
      });
    });
  }

  /* ---- Slide-over inspector ---- */
  const scrim = $("#scrim");
  const insp = $("#inspector");
  let lastFocus = null;

  const ul = (arr) => `<ul>${arr.map((x) => `<li>${x}</li>`).join("")}</ul>`;
  function hl(code) {
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(#.*$)/gm, '<span class="c">$1</span>')
      .replace(/\b(Allow|group|to|read|manage|use|in|tenancy|compartment|where|stats|sort|by|link|cluster|search|timestats|as|count|forecast)\b/g, '<span class="k">$1</span>');
  }

  function openInspector(id) {
    const c = C[id]; if (!c) return;
    const lv = LEVELS[c.level];
    insp.style.setProperty("--lvl", lv.color);
    insp.style.setProperty("--lvl-tint", lv.tint);
    $("#i-ic").innerHTML = ic(c.icon);
    $("#i-tier").textContent = lv.label;
    $("#i-name").textContent = c.name;
    $("#i-tag").textContent = c.tagline;
    $("#i-lz").innerHTML = c.lz;
    $("#i-exec").innerHTML = ul(c.exec);
    $("#i-arch").innerHTML = ul(c.arch);
    $("#i-prac").innerHTML = ul(c.prac) + `
      <div class="codeblock">
        <div class="codeblock__bar">
          <span class="codeblock__lang">${c.code.lang}</span>
          <button class="copybtn" id="i-copy" type="button">${ic("copy")} Copy</button>
        </div>
        <pre><code>${hl(c.code.body)}</code></pre>
      </div>`;
    $("#i-docs").href = c.docs;
    selectLens(0);

    $("#i-copy").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      navigator.clipboard?.writeText(c.code.body).then(() => {
        btn.innerHTML = ic("check") + " Copied"; btn.classList.add("ok");
        setTimeout(() => { btn.innerHTML = ic("copy") + " Copy"; btn.classList.remove("ok"); }, 1600);
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
    scrim.classList.remove("open"); insp.classList.remove("open");
    insp.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    lastFocus?.focus();
  }
  function selectLens(idx) {
    $$(".lens button").forEach((b, i) => b.setAttribute("aria-selected", i === idx));
    $$(".lenspanel").forEach((p, i) => p.classList.toggle("active", i === idx));
  }
  // simple focus trap
  function trap(e) {
    if (e.key !== "Tab" || !insp.classList.contains("open")) return;
    const f = $$('button, a[href], [tabindex]:not([tabindex="-1"])', insp).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---- Finder ---- */
  function buildFinder() {
    $$(".uc[data-uc]").forEach((u) => {
      const p = PATTERNS[u.dataset.uc];
      $(".uc__ic", u).innerHTML = ic(p.icon);
      u.addEventListener("click", () => runFinder(u.dataset.uc));
    });
  }
  function runFinder(key) {
    const p = PATTERNS[key], res = $("#finderResult");
    $("#fr-name").textContent = p.name;
    $("#fr-start").textContent = p.start;
    const path = $("#fr-path"); path.innerHTML = "";
    p.path.forEach((id, i) => {
      const c = C[id], lv = LEVELS[c.level];
      const chip = document.createElement("button");
      chip.className = "pathchip"; chip.type = "button";
      chip.style.setProperty("--lv", lv.color);
      chip.innerHTML = `<span class="dot"></span>${c.name}`;
      chip.addEventListener("click", () => openInspector(id));
      path.appendChild(chip);
      if (i < p.path.length - 1) {
        const a = document.createElement("span"); a.className = "arrow"; a.innerHTML = ic("arrow-right");
        path.appendChild(a);
      }
    });
    res.classList.add("show");
    const set = new Set(p.path);
    $$(".card").forEach((card) => card.classList.toggle("dim", !set.has(card.dataset.comp)));
    $$(".uc[data-uc]").forEach((u) => u.setAttribute("aria-pressed", u.dataset.uc === key));
    res.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function clearFinder() {
    $$(".card").forEach((card) => card.classList.remove("dim"));
    $$(".uc[data-uc]").forEach((u) => u.setAttribute("aria-pressed", "false"));
    $("#finderResult").classList.remove("show");
  }

  /* ---- Scroll progress + reveal + level scroll-spy ---- */
  function scrollFx() {
    const bar = $("#scrollbar");
    const onScroll = () => {
      const h = document.documentElement;
      bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!window.IntersectionObserver) { $$(".reveal").forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((e) => io.observe(e));

    // scroll-spy: highlight the level nav link for the station in view
    const spy = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (en.isIntersecting) {
          const lv = en.target.dataset.level;
          $$(".levelnav a").forEach((a) => a.classList.toggle("active", a.dataset.lv === lv));
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    $$(".station").forEach((s) => spy.observe(s));
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildLadder();
    buildFinder();
    scrollFx();
    $("#i-close").addEventListener("click", closeInspector);
    scrim.addEventListener("click", closeInspector);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && insp.classList.contains("open")) closeInspector();
      trap(e);
    });
    $$(".lens button").forEach((b, i) => b.addEventListener("click", () => selectLens(i)));
    $("#finderClear")?.addEventListener("click", clearFinder);
    // wire diagram chips (the AI reference-architecture pipeline)
    $$(".dchip[data-comp]").forEach((d) => d.addEventListener("click", () => openInspector(d.dataset.comp)));
  });
})();
