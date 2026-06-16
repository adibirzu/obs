# OCI Observability Atlas

**A persona- and industry-driven path from L0 to L5 for designing enterprise observability on Oracle Cloud Infrastructure — find the right O&M and AI services for who you are and what you run, and enable them when you need them.**

🔗 **Live:** [obs.octodemo.cloud](https://obs.octodemo.cloud) · mirror: [adibirzu.github.io/obs](https://adibirzu.github.io/obs/)

Built with the Oracle Redwood design language (Georgia + Figtree, warm-stone palette, Lucide icons) for familiarity. Static, self-contained, no build step.

> [!IMPORTANT]
> **Not an Oracle product.** OCTO Observability Atlas is an **independent, community-built project**. It is **not affiliated with, sponsored by, or endorsed by Oracle**. Its sole purpose is to make Oracle Cloud Infrastructure's observability tools easier to understand and adopt. Oracle, OCI, Oracle Cloud Infrastructure, and the Redwood design language are trademarks of Oracle and/or its affiliates, used here for identification and educational purposes only. The OCTO mark belongs to its respective project. Always verify against the [official OCI documentation](https://docs.oracle.com/en-us/iaas/Content/home.htm).

---

## What this is

A single-page guide that helps **any user** find the right OCI Observability & Management (O&M) services for their role, industry, and use case, and adopt them in the right order:

- **Start by persona + industry** — pick who you are and where you work; the page tailors the levels, services, and default lens. Access is governed by OCI IAM (personas → OCI Groups + scoped policies).
- **Use-case finder** — pick your estate pattern (traditional app, database-centric, OKE, Oracle apps, hybrid, agentic) and get a recommended path with concrete outcomes.
- **The L0 → L5 ladder** — 31 O&M and AI services, each opening an inspector with Executive / Architect / Practitioner lenses, a "Relevant to" persona row, copy-ready MQL/OCL/OTel snippets, and curated guides + open-source projects.
- **Collection-agent comparison** — Oracle Cloud Agent vs. Management Agent vs. Unified Monitoring Agent.
- **AI agent observability (L4)** — the SAIF / Zero Trust / Observability triad and a modern Instrument → Collect → Analyse → Evaluate → Act reference diagram.
- **Multitenancy at scale (L5)** — centralized Log Analytics aggregation across tenants and clouds, with per-tenant isolation by compartment + IAM (see below).
- **Resources** — curated DevRel guides, demos, and the maintainer's public observability projects, mapped per service.
- **[Interactive launchpad](https://obs.octodemo.cloud/launchpad.html)** — the companion operations console.

## Start with you — personas and industries

The site opens with a **persona + industry** selector, not a product list. Pick who you are and where you work, and it points you at the right levels, services, and default lens.

| Persona | Default lens | Levels |
|---|---|---|
| Executive / service owner | Executive | L0, L1, L4 |
| Platform engineer / cloud architect | Architect | L0–L3, L5 |
| SRE / operations (NOC) | Practitioner | L1–L3 |
| DBA / database team | Practitioner | L2 |
| Security / SOC / governance | Architect | L0, L2, L4 |
| Developer / application team | Practitioner | L1, L3 |
| AI / ML engineer | Architect | L4 |
| Operator / ISV (multitenancy) | Architect | L0, L5 |

Industries (financial services, telco, healthcare, public sector, retail, ISV/SaaS) tilt the emphasis — e.g. financial services leans on L2 database depth and L0 audit; ISV/SaaS leans on L5 multitenancy.

**Access is governed by OCI IAM.** Each persona maps to an **OCI Group** with **policies scoped to compartments** — an *admin* group manages the services, a *reader* group has read-only access — in the Landing Zone Common Identity Domain.

## The L0 → L5 model

| Level | Theme | Question it answers | Example services |
|---|---|---|---|
| **L0** | Govern & land | Is the platform ready to be observed safely? | Observability compartment & IAM, Tags, Vault, Audit |
| **L1** | See & alert | Is it healthy, and what just happened? | Monitoring, Logging, Notifications, Events, Health Checks, Dashboards |
| **L2** | Diagnose deep | Why did it happen, and are we out of room? | Database Management, Ops Insights, Log Analytics, Management Agent, Stack Monitoring, Java Management |
| **L3** | Correlate & automate | What's the business impact, and what can self-heal? | APM + OpenTelemetry, Connector Hub, Resource Scheduler, OS Management Hub, Fleet App Mgmt |
| **L4** | Observe & govern AI | Is the agent correct, grounded, safe, improving? | APM GenAI, Generative AI (judge) + guardrails, Logging Analytics anomaly, Data Science eval, Cloud Guard Instance Security, Gen AI Agents |
| **L5** | Operate multitenancy | How do operators run it across tenants and clouds? | Centralized Log Analytics aggregation, multicloud ingestion, per-tenant isolation by compartment + IAM |

> Stack Monitoring's capabilities are converging into OCI Monitoring — there is no need to replace it with separate services.

## L5 — Multitenancy and observability at scale

The multitenant approach is **not just access scoping**. The real model is **centralized aggregation**:

1. **Sources** — per-tenant OCI tenancies (OKE, databases, OCI services, audit logs) **and** other clouds / on-premises: AWS (incl. EKS), Microsoft Azure (incl. Oracle Database@Azure, AKS), Google Cloud (GKE), on-prem K8s/VMs/databases, and Fusion SaaS / OIC.
2. **Collect** — the documented OCI Logging Analytics ingestion paths: the **Management Agent**, **on-demand / REST upload**, **Object Storage buckets** (continuous collection), and **Service Connector Hub** — which also pulls **custom and cross-tenancy logs from OCI Streaming** ([ingest from Streaming via Service Connector](https://docs.oracle.com/en-us/iaas/log-analytics/doc/ingest-custom-logs-from-oci-streaming-service-using-service-connector.html), [collect from an Object Storage bucket](https://docs.oracle.com/en-us/iaas/log-analytics/doc/collect-logs-from-your-oci-object-storage-bucket.html)). For Kubernetes, **FluentD / Fluent-Bit via Helm** (the [`oracle-quickstart/oci-kubernetes-monitoring`](https://github.com/oracle-quickstart/oci-kubernetes-monitoring) solution — **OKE and AWS EKS are documented**, other clusters via the generic Helm path).
3. **Aggregate & analyse** — a central **OCI Log Analytics**: 250+ out-of-the-box sources, clustering, link analysis, detection rules, tiered (active + archive) storage, and GenAI-assisted analytics. The same **Service Connector → Streaming / REST API** paths can also fan out to **3rd-party SIEM & observability tools** (Splunk, Elastic, Datadog, Microsoft Sentinel) via [log shippers](https://docs.oracle.com/en/learn/ocilogs-log-shipper/index.html) or [OCI Functions](https://docs.oracle.com/en/learn/oci-logs-ms-azure-sentinel/).
4. **Operate** — an operator cross-tenant fleet view (SLOs, capacity, chargeback) plus per-tenant views.

**Cross-tenancy aggregation is not automatic** — it relies on per-source forwarding (Service Connector Hub / Streaming / Object Storage) plus IAM cross-tenancy `Define` / `Endorse` / `Admit` policies, and Log Analytics is regional. **Isolation** stays per-tenant, by **log group + compartment** and IAM — Tenancy / Platform / Environment(Project) observability teams, each an admin and a reader OCI group — grounded in the official [OCI Database Observability LZ add-on (`obs_v2`)](https://github.com/oci-landing-zones/oci-landing-zone-operating-entities/tree/obs_v2/addons/oci-db-observability). Adding a tenant, environment, or project is repetition: clone the compartment, group, and policy.

A real design also pins down: **agent trust** (Management Agent install keys per tenancy/namespace, Vault secrets, rotation, Management Gateway/private egress), **network & security** (private endpoints / Service Gateway, Zero Trust Packet Routing, operator-access audit), **region/data residency**, and **capacity & cost** (ingest volume, retention, recall cost, delivery semantics, service limits).

**Five best practices at scale:** (1) establish a common correlation key (transaction ID, ECID), (2) centralize all log sources, (3) build correlated dashboards, (4) automate alerts and anomaly detection, (5) embed observability into the design.

References (public): [OCI Log Analytics](https://www.oracle.com/manageability/log-analytics/) · [docs](https://docs.oracle.com/en-us/iaas/log-analytics/home.htm) · [ingest via Service Connector](https://docs.oracle.com/en-us/iaas/log-analytics/doc/ingest-logs-from-other-oci-services-using-service-connector.html) · [ingest from OCI Streaming](https://docs.oracle.com/en-us/iaas/log-analytics/doc/ingest-custom-logs-from-oci-streaming-service-using-service-connector.html) · [collect from Object Storage](https://docs.oracle.com/en-us/iaas/log-analytics/doc/collect-logs-from-your-oci-object-storage-bucket.html) · [3rd-party SIEM via log shippers](https://docs.oracle.com/en/learn/ocilogs-log-shipper/index.html) · [Kubernetes monitoring solution](https://docs.oracle.com/en-us/iaas/log-analytics/doc/kubernetes-solution.html) · [LiveLabs](https://livelabs.oracle.com/).

> Diagrams for both the multicloud aggregation model and the IAM scoping model are in [`assets/diagrams/`](assets/diagrams/) (`observability-multitenant.svg`, `observability-scope.svg`).

## Propose a new monitoring scenario

This guide is meant to grow. To add a use case (e.g. "observability for an EBS estate" or "tracing a CrewAI multi-agent app"):

1. Read **[docs/PROPOSE-A-SCENARIO.md](docs/PROPOSE-A-SCENARIO.md)** — the scenario template and what a good one contains.
2. Open a **[Monitoring scenario issue](../../issues/new?template=monitoring-scenario.yml)** (or copy the template into a PR).
3. Or extend the data directly: add an entry to [`assets/resources.js`](assets/resources.js) (links/projects per service) or propose a new finder pattern in [`assets/guide.js`](assets/guide.js).

## Propose a new monitoring scenario

This guide is meant to grow. To add a use case (e.g. "observability for an EBS estate" or "tracing a CrewAI multi-agent app"):

1. Read **[docs/PROPOSE-A-SCENARIO.md](docs/PROPOSE-A-SCENARIO.md)** — the scenario template and what a good one contains.
2. Open a **[Monitoring scenario issue](../../issues/new?template=monitoring-scenario.yml)** (or copy the template into a PR).
3. Or extend the data directly: add an entry to [`assets/resources.js`](assets/resources.js) (links/projects per service) or propose a new finder pattern in [`assets/guide.js`](assets/guide.js).

## Run locally

```bash
git clone https://github.com/adibirzu/obs.git
cd obs
python3 -m http.server 8000
# open http://localhost:8000
```

No dependencies, no build. Fonts load from Google Fonts; all other assets are vendored.

## Repository layout

```
index.html                     the guide (single page)
launchpad.html                 companion operations console
assets/
  guide.css / guide.js         page styles + behaviour (data-driven catalog)
  resources.js                 curated guides + projects per service (shared)
  launchpad-resources.js       injects "Further reading" into launchpad modules
  redwood/                     vendored Oracle Redwood tokens + brand assets
  diagrams/                    lz-addons-architecture .svg / .drawio / .excalidraw
static/                        launchpad assets (css/js/icons)
docs/
  observability-design-guide.md   full enterprise design guide (reference)
  PROPOSE-A-SCENARIO.md           how to propose a monitoring scenario
CNAME                          custom domain (obs.octodemo.cloud)
```

## Sources & credits

- **[docs/observability-design-guide.md](docs/observability-design-guide.md)** — the full enterprise OCI observability design guide.
- OCI Secure AI Framework (SAIF), Zero Trust for AI Agents, and AI Observability for Agents whitepapers (the L4 layer).
- [oracle-devrel/technology-engineering — observability-and-management](https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management) and the [OCI Observability blog](https://blogs.oracle.com/observability/).
- Reference implementation: [octo-observability-demo](https://github.com/adibirzu/octo-observability-demo).
- Project references curated from the maintainer's **public** OCI observability repositories.

## License

MIT — see [LICENSE](LICENSE) if present, or treat the content as reference material. Oracle, OCI, and Redwood are trademarks of Oracle and/or its affiliates. Service names and support status change; recheck the official OCI documentation.
