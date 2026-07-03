# OCI Observability Atlas

**An operating-goal-driven path from L0 to L4 for designing enterprise observability across OCI and multicloud estates, with an operator-scale architecture extension for multitenant platforms.**

🔗 **Live site:** [adibirzu.github.io/obs](https://adibirzu.github.io/obs/)

Built with the Oracle Redwood design language (Georgia + Figtree, warm-stone palette, Lucide icons) for familiarity. Static, self-contained, no build step.

> [!IMPORTANT]
> **Not an Oracle product.** OCTO Observability Atlas is an **independent, community-built project**. It is **not affiliated with, sponsored by, or endorsed by Oracle**. Its sole purpose is to make Oracle Cloud Infrastructure's observability tools easier to understand and adopt. Oracle, OCI, Oracle Cloud Infrastructure, and the Redwood design language are trademarks of Oracle and/or its affiliates, used here for identification and educational purposes only. The OCTO mark belongs to its respective project. Always verify against the [official OCI documentation](https://docs.oracle.com/en-us/iaas/Content/home.htm).

---

## What this is

A guided Atlas that helps users find the right observability capabilities for an operating goal, optionally refine the route by role or industry, and adopt them in a clear order:

- **Start with an operating goal** — choose protect, diagnose, optimize, or govern; role and industry are optional refinements.
- **Use-case finder** — pick your estate pattern (traditional app, database-centric, OKE, Oracle apps, hybrid, agentic) and get a recommended path with concrete outcomes.
- **The L0 to L4 maturity path** — services open an inspector with Executive, Architect, and Practitioner lenses, copy-ready MQL/OCL/OTel snippets, and curated guides and projects.
- **Collection-agent comparison** — Oracle Cloud Agent vs. Management Agent vs. Unified Monitoring Agent.
- **AI agent observability (L4)** — the SAIF / Zero Trust / Observability triad and a modern Instrument → Collect → Analyse → Evaluate → Act reference diagram.
- **Operator-scale architecture extension** — centralized Log Analytics aggregation across tenants and clouds, with per-tenant isolation by compartment and IAM. This is a scale pattern, not a fifth maturity level.
- **Security + observability** — observability framed as an extension of OCI Security (Cloud Guard + Instance Security, IAM, Data Safe, Access Governance, Audit, ZPR): Security *detects*, observability *explains* and forwards to 3rd-party SIEMs (Splunk, Microsoft Sentinel, Elastic, Datadog).
- **Resources** — curated DevRel guides, demos, and the maintainer's public observability projects, mapped per service.
- **[OCI Observability Service Interlocks](interlocks.html)** — six accessible, interactive interlock views plus poster-grade editable Draw.io and Excalidraw sources covering Network, Security, IAM & Governance, Landing Zones, Operations & Lifecycle, and the end-to-end Cloud Foundation operating model.
- **[Interactive launchpad](launchpad.html)** — the companion operations console.

Product status and remaining work are tracked in [`docs/PRODUCT-ROADMAP.md`](docs/PRODUCT-ROADMAP.md).

## OCI Observability Service Interlocks

The interlocks addon turns the six Cloud Foundation posters into a maintainable, data-driven system:

- [`interlocks.html`](interlocks.html) provides WCAG-oriented keyboard tabs, source → control-plane → outcome maps, operating loops, service search and filters, focus-managed detail dialogs, editable-file downloads, and official Oracle documentation links. Its generated catalog script also works when the page is opened directly from disk.
- [`assets/diagrams/oci-observability-service-interlocks-documented.drawio`](assets/diagrams/oci-observability-service-interlocks-documented.drawio) is the source-grounded Draw.io workbook with six editable vector sheets on 3000 × 4243 A-series 4K poster canvases. Each `DOC-xx` badge opens an official Oracle source.
- [`assets/diagrams/interlocks-documented/`](assets/diagrams/interlocks-documented/) contains six standalone documented Draw.io posters and six dense full-poster Excalidraw files. Six print-quality vector PDFs are generated into the release package. Earlier editable editions remain under `assets/diagrams/interlocks-infographic/` and `assets/diagrams/interlocks/` without being replaced.
- [`assets/interlocks/catalog.json`](assets/interlocks/catalog.json) is the canonical service and diagram catalog shared by the site and generator.
- [`assets/interlocks/documentation-sources.json`](assets/interlocks/documentation-sources.json) records the official source for every catalog entry and separates documented capabilities from independent reference-architecture inferences.
- [`governance/external-links.json`](governance/external-links.json) records the latest HTTP status and verification date for every public reference discovered in source files. [`governance/telemetry-contracts.json`](governance/telemetry-contracts.json) and [`governance/roadmap-renames.json`](governance/roadmap-renames.json) enforce signal ownership, review dates, and current service names during compilation.
- [`scripts/generate-interlocks-drawio.mjs`](scripts/generate-interlocks-drawio.mjs) rebuilds the workbook, source register, all 12 standalone editable diagrams, and the browser-safe catalog script without third-party dependencies.
- [`assets/interlocks/{network,domain}-drilldowns.js`](assets/interlocks/) defines ten guided workflows for each of the six domains. [`scripts/generate-usecase-artifacts.mjs`](scripts/generate-usecase-artifacts.mjs) and [`scripts/generate-usecase-pdf.mjs`](scripts/generate-usecase-pdf.mjs) create matching Draw.io, Excalidraw, and vector PDF files under `assets/diagrams/usecases/`.

After changing the catalog, regenerate and verify the addon:

```bash
npm run generate:interlocks:documented
npm run generate:interlocks:pdf
npm run generate:usecase-artifacts
npm run generate:usecase-pdf
npm run governance:refresh-links # networked maintenance operation
npm run build                    # offline governance verification + tests
```

## Start with an operating goal

The site opens with four operating goals, not a product list. Responsibility and industry are optional refinements that adjust the recommended levels, services, default lens, and matching community scenarios.

| Persona | Default lens | Levels |
|---|---|---|
| Executive / service owner | Executive | L0, L1, L4 |
| Platform engineer / cloud architect | Architect | L0–L3, Scale pattern |
| SRE / operations (NOC) | Practitioner | L1–L3 |
| DBA / database team | Practitioner | L2 |
| Security / SOC / governance | Architect | L0, L2, L4 |
| Developer / application team | Practitioner | L1, L3 |
| AI / ML engineer | Architect | L4 |
| Operator / ISV (multitenancy) | Architect | L0, Scale pattern |

Industries (aligned with [Oracle's industry naming](https://www.oracle.com/industries/) — Financial Services/Banking, Communications, Government, Healthcare, Oil and Gas, Retail, High Technology) tilt the emphasis. Banking leans on L2 database depth and L0 audit, High Technology emphasizes the operator scale pattern, and Oil and Gas emphasizes hybrid and edge collection.

**Access is governed by OCI IAM.** Each persona maps to an **OCI Group** with **policies scoped to compartments** — an *admin* group manages the services, a *reader* group has read-only access — in the Landing Zone Common Identity Domain.

## The L0 to L4 model

| Level | Theme | Question it answers | Example services |
|---|---|---|---|
| **L0** | Govern & land | Is the platform ready to be observed safely? | Observability compartment & IAM, Tags, Vault, Audit |
| **L1** | See & alert | Is it healthy, and what just happened? | Monitoring, Logging, Notifications, Events, Health Checks, Dashboards |
| **L2** | Diagnose deep | Why did it happen, and are we out of room? | Database Management, Ops Insights, Log Analytics, Management Agent, Stack Monitoring, Java Management |
| **L3** | Correlate & automate | What's the business impact, and what can self-heal? | APM + OpenTelemetry, Connector Hub, Resource Scheduler, OS Management Hub, Fleet App Mgmt |
| **L4** | Observe & govern AI | Is the agent correct, grounded, safe, improving? | APM GenAI, Generative AI (judge) + guardrails, Logging Analytics anomaly, Data Science eval, Cloud Guard Instance Security, Gen AI Agents |

The **operator-scale architecture extension** answers how operators run the model across tenants and clouds. It adds centralized Log Analytics aggregation, multicloud ingestion, and per-tenant isolation without extending the core maturity ladder.

> Stack Monitoring's capabilities are converging into OCI Monitoring — there is no need to replace it with separate services.

## Operator-scale architecture extension

The multitenant approach is **not just access scoping**. The real model is **centralized aggregation**:

1. **Sources** — per-tenant OCI tenancies (OKE, databases, OCI services, audit logs) **and** other clouds / on-premises: AWS (incl. EKS), Microsoft Azure (incl. Oracle Database@Azure, AKS), Google Cloud (GKE), on-prem K8s/VMs/databases, and Fusion SaaS / OIC.
2. **Collect** — the documented Oracle Log Analytics ingestion paths: the **Management Agent**, **on-demand / REST upload**, **Object Storage buckets** (continuous collection), and **Service Connector Hub** — which also pulls **custom and cross-tenancy logs from OCI Streaming** ([ingest from Streaming via Service Connector](https://docs.oracle.com/en-us/iaas/log-analytics/doc/ingest-custom-logs-from-oci-streaming-service-using-service-connector.html), [collect from an Object Storage bucket](https://docs.oracle.com/en-us/iaas/log-analytics/doc/collect-logs-from-your-oci-object-storage-bucket.html)). For Kubernetes, **FluentD / Fluent-Bit via Helm** (the [`oracle-quickstart/oci-kubernetes-monitoring`](https://github.com/oracle-quickstart/oci-kubernetes-monitoring) solution — **OKE and AWS EKS are documented**, other clusters via the generic Helm path).
3. **Aggregate & analyse** — a central **OCI Log Analytics**: 250+ out-of-the-box sources, clustering, link analysis, detection rules, tiered (active + archive) storage, and GenAI-assisted analytics. The same **Service Connector → Streaming / REST API** paths can also fan out to **3rd-party SIEM & observability tools** (Splunk, Elastic, Datadog, Microsoft Sentinel) via [log shippers](https://docs.oracle.com/en/learn/ocilogs-log-shipper/index.html) or [OCI Functions](https://docs.oracle.com/en/learn/oci-logs-ms-azure-sentinel/).
4. **Operate** — an operator cross-tenant fleet view (SLOs, capacity, chargeback) plus per-tenant views.

**Cross-tenancy aggregation is not automatic** — it relies on per-source forwarding (Service Connector Hub / Streaming / Object Storage) plus IAM cross-tenancy `Define` / `Endorse` / `Admit` policies, and Log Analytics is regional. **Isolation** stays per-tenant, by **log group + compartment** and IAM — Tenancy / Platform / Environment(Project) observability teams, each an admin and a reader OCI group — grounded in the official [OCI Database Observability LZ add-on (`obs_v2`)](https://github.com/oci-landing-zones/oci-landing-zone-operating-entities/tree/obs_v2/addons/oci-db-observability). Adding a tenant, environment, or project is repetition: clone the compartment, group, and policy.

A real design also pins down: **agent trust** (Management Agent install keys per tenancy/namespace, Vault secrets, rotation, Management Gateway/private egress), **network & security** (private endpoints / Service Gateway, Zero Trust Packet Routing, operator-access audit), **region/data residency**, and **capacity & cost** (ingest volume, retention, recall cost, delivery semantics, service limits).

**Five best practices at scale:** (1) establish a common correlation key (transaction ID, ECID), (2) centralize all log sources, (3) build correlated dashboards, (4) automate alerts and anomaly detection, (5) embed observability into the design.

### Ingestion recipes (open-source)

Every arrow on the diagram maps to working code — mix and match to ingest from any cloud into OCI Log Analytics, or fan OCI telemetry out to a third-party SIEM:

| Direction | Recipe | Repo |
|---|---|---|
| **GCP → OCI** | Stream GCP Cloud Logging into OCI Log Analytics — serverless, no VMs | [`adibirzu/gcplogs2oci`](https://github.com/adibirzu/gcplogs2oci) |
| **Azure → OCI** | Forward Azure Monitor platform & resource logs into OCI Log Analytics | [`adibirzu/azurelogs2oci`](https://github.com/adibirzu/azurelogs2oci) |
| **Kubernetes → OCI** | AWS EKS / OKE / any K8s → OCI: FluentD (logs) + Management Agent (metrics) via Helm | [`oracle-quickstart/oci-kubernetes-monitoring`](https://github.com/oracle-quickstart/oci-kubernetes-monitoring) |
| **OCI → Splunk** | Kafka Connect streaming from OCI into Splunk indexes | [`adibirzu/oci-splunk`](https://github.com/adibirzu/oci-splunk) |
| **OCI → Sentinel** | Timer-triggered Azure Function: OCI Streaming → Event Hub → Microsoft Sentinel (enriched, E2E tested) | [`adibirzu/oci2azurelogs`](https://github.com/adibirzu/oci2azurelogs) |
| **LA content** | Reusable Logging Analytics sources & parsers for security/ops | [`adibirzu/LoggingAnalyticsFiles`](https://github.com/adibirzu/LoggingAnalyticsFiles) |
| **ZPR → LA** | Zero Trust Packet Routing flow visibility → Log Analytics detection dashboards | [`adibirzu/oci-zpr-visibility`](https://github.com/adibirzu/oci-zpr-visibility) |
| **Reference** | End-to-end observability demo (APM · Monitoring · Log Analytics) | [`adibirzu/octo-observability-demo`](https://github.com/adibirzu/octo-observability-demo) |

References (public): [OCI Log Analytics](https://www.oracle.com/manageability/log-analytics/) · [docs](https://docs.oracle.com/en-us/iaas/log-analytics/home.htm) · [ingest via Service Connector](https://docs.oracle.com/en-us/iaas/log-analytics/doc/ingest-logs-from-other-oci-services-using-service-connector.html) · [ingest from OCI Streaming](https://docs.oracle.com/en-us/iaas/log-analytics/doc/ingest-custom-logs-from-oci-streaming-service-using-service-connector.html) · [collect from Object Storage](https://docs.oracle.com/en-us/iaas/log-analytics/doc/collect-logs-from-your-oci-object-storage-bucket.html) · [3rd-party SIEM via log shippers](https://docs.oracle.com/en/learn/ocilogs-log-shipper/index.html) · [Kubernetes monitoring solution](https://docs.oracle.com/en-us/iaas/log-analytics/doc/kubernetes-solution.html) · [LiveLabs](https://livelabs.oracle.com/).

> Diagrams for both the multicloud aggregation model and the IAM scoping model are in [`assets/diagrams/`](assets/diagrams/) (`observability-multitenant.svg`, `observability-scope.svg`).

## Propose a new monitoring scenario

This guide is meant to grow. To add a use case (e.g. "observability for an EBS estate" or "tracing a CrewAI multi-agent app"):

1. Read **[the worked reference scenario](docs/scenarios/retail-checkout-multicloud.md)** and **[docs/PROPOSE-A-SCENARIO.md](docs/PROPOSE-A-SCENARIO.md)**.
2. Open a **[Monitoring scenario issue](../../issues/new?template=monitoring-scenario.yml)** (or copy the template into a PR).
3. Follow [`CONTRIBUTING.md`](CONTRIBUTING.md) for the JSON/Markdown file contract, ownership boundaries, and acceptance gates.

## Run locally

```bash
git clone https://github.com/adibirzu/obs.git
cd obs
python3 -m http.server 8000
# open http://localhost:8000
```

The source site has no runtime package dependencies and can be served without compilation. Release PDFs, deterministic diagrams, validation reports, and the packaged site are produced by the documented build pipeline. Fonts load from Google Fonts; all other runtime assets are vendored.

## Quality and release pipeline

Pull requests and commits to `main` run the same gates available locally:

```bash
npm run lint               # JavaScript, JSON, shell, HTML, CSS, and YAML checks
npm run security:scan      # secrets and proprietary-identifier redaction gate
npm run artifacts:check    # deterministic generated-vector drift check
npm run test:ci            # complete suite, at least 40 tests, no skips
npm run test:coverage:node:ci # enforce aggregate and critical-module coverage floors
npm run test:browser:ci       # managed E2E, browser coverage, and dual-width smoke tests
npm run release:build      # build the distributable site and hash manifest
```

[`governance/artifact-policy.json`](governance/artifact-policy.json) is the machine-readable distribution contract. Editable Draw.io and Excalidraw diagrams, generated catalog data, and source registers are version-controlled because reviewers need to inspect their diffs. Compiled PDFs, raster previews, archives, and `dist/` packages are release-only outputs and are rebuilt in CI. The release manifest records every packaged file's SHA-256 digest and classification.

## Repository layout

```
index.html                     the guide (single page)
interlocks.html                six-sheet interlock explorer and service reference
launchpad.html                 companion operations console
assets/
  guide.css / guide.js         page styles + behaviour (data-driven catalog)
  resources.js                 curated guides + projects per service (shared)
  launchpad-resources.js       injects "Further reading" into launchpad modules
  redwood/                     vendored Oracle Redwood tokens + brand assets
  diagrams/                    architecture .svg / .drawio / .excalidraw assets
    interlocks/                compatibility copies and manually edited sources
    interlocks-infographic/    six 4K infographic Draw.io + six Excalidraw posters
    interlocks-documented/     six source-linked Draw.io + six full-poster Excalidraw files
  interlocks/                  canonical catalog, generated local data, styles, and behaviour
scripts/
  generate-interlocks-drawio.mjs  reproducible six-sheet Draw.io generator
  interlocks-documented-excalidraw.mjs  full-poster documented Excalidraw renderer
tests/
  interlocks.test.mjs          catalog, generator, and page integration tests
static/                        launchpad assets (css/js/icons)
docs/
  observability-design-guide.md   full enterprise design guide (reference)
  PROPOSE-A-SCENARIO.md           how to propose a monitoring scenario
```

## Sources & credits

- **[docs/observability-design-guide.md](docs/observability-design-guide.md)** — the full enterprise OCI observability design guide.
- OCI Secure AI Framework (SAIF), Zero Trust for AI Agents, and AI Observability for Agents whitepapers (the L4 layer).
- [oracle-devrel/technology-engineering — observability-and-management](https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management) and the [OCI Observability blog](https://blogs.oracle.com/observability/).
- Reference implementation: [octo-observability-demo](https://github.com/adibirzu/octo-observability-demo).
- Project references curated from the maintainer's **public** OCI observability repositories.

## License

MIT — see [LICENSE](LICENSE). Oracle, OCI, and Redwood are trademarks of Oracle and/or its affiliates. Service names and support status change; recheck the official OCI documentation.
