# Propose a monitoring scenario

The Observability Atlas grows by adding **scenarios** — concrete, reusable answers to "how do I observe _this_ on OCI?". A scenario maps a real workload to the L0 → L4 ladder, names the services to enable, the signals to watch, and how it attaches to a Landing Zone.

Anyone can propose one. This page explains what a good scenario contains and how to submit it.

Use the complete [retail checkout reference scenario](scenarios/retail-checkout-multicloud.md) as the worked example. Machine-readable submissions follow [`governance/schemas/community-scenario.schema.json`](../governance/schemas/community-scenario.schema.json), and [`CONTRIBUTING.md`](../CONTRIBUTING.md) defines ownership and the merge-blocking acceptance checklist.

## What a scenario is

A scenario is **service-oriented**, not tool-oriented. It starts from a business service or workload and works down to telemetry — the same discipline the [design guide](observability-design-guide.md) describes. A strong scenario:

- Targets a clear workload (e.g. "Oracle E-Business Suite on Compute", "a CrewAI multi-agent app on OKE").
- Picks an **entry level** (L0–L4) and a **path** through the ladder — only the services that workload needs.
- Frames each service as a **Landing Zone add-on**: what enables, after the OE Landing Zone is live, with no rebuild.
- States the **signals**, **alarms**, and **dashboards** that make it actionable, and a **runbook** for the top incident.
- Avoids anti-patterns: dashboards without owners, alerts without runbooks, alerting on symptoms without business context.

## Scenario template

Copy this into an issue or PR and fill it in. Keep it concrete; cite real OCI services and MQL/OCL where useful.

```markdown
### Scenario: <short name>

**Workload / business service:** <what runs, where — Compute / OKE / Exadata / hybrid / agentic>
**Closest finder pattern:** <traditional app | database-centric | OKE | Oracle apps | hybrid | agentic>
**Entry level:** <L0 | L1 | L2 | L3 | L4> — <one line on why to start here>

**Services to enable (in order), as Landing Zone add-ons**
| Level | Service | Why, for this workload | Enable after LZ via |
|---|---|---|---|
| L1 | OCI Monitoring | … | alarms + dashboards, no agent |
| L2 | Database Management | … | Basic/Full, private endpoint or Management Agent |
| …  | …               | … | … |

**Key signals**
- <metric / log / trace / database signal> — <why it matters> — <source service>

**System prerequisites**
- <required IAM access, collection state, parser/source, agent/instrumentation, scope, and clock assumptions>

**Distributed correlation keys**
- <trace_id, service.name, resource/entity id, tenant key, UTC event time, and domain-specific request/network/change keys>

**Telemetry boundaries**
- Logan: <log and event fields only>
- Prometheus: <metric and exemplar fields only; metric backend remains authoritative>
- APM: <trace/span, RUM, and synthetic fields only>

**Empty-result behavior**
- <state explicitly that zero rows are inconclusive; verify permissions, region, tenancy/compartment scope, collection health, field mappings, and time window before concluding absence>

**Alarms (actionable only)**
- <condition> → severity <Sev 1–4> → topic <name> → runbook <link>

**Dashboards**
- <audience> — <what it shows> — <owner + review cadence>

**Runbook (top incident)**
- <symptom> → <triage steps> → <fix / escalation>

**Collection agent:** <Oracle Cloud Agent | Management Agent | Unified Monitoring Agent> — <why>
**Open-source / OTel angle (optional):** <Grafana/Prometheus/Tempo/Loki, OpenTelemetry GenAI, etc.>
**References:** <DevRel guide / blog / repo links>
```

## How to submit

**Option A — open an issue (easiest).** Use the [Monitoring scenario issue form](../../issues/new?template=monitoring-scenario.yml). It captures the same fields and is a good place to discuss before any code.

**Option B — open a pull request.** A complete scenario contribution includes:

- `assets/scenarios/<scenario-id>.json` for runtime discovery and Interlock mappings.
- `docs/scenarios/<scenario-id>.md` for the end-to-end operating guide.
- An entry in `assets/scenarios/index.json`.
- Tests proving query, operating-profile, Finder, and Interlock behavior.

Two additional low-risk places to contribute data are:

- **Add references for a service** — append to the matching group in [`assets/resources.js`](../assets/resources.js):
  ```js
  // inside the relevant group's items[] (guides) or projects[] (repos)
  { title: "…", url: "https://…", summary: "One sentence, ≤160 chars." }
  ```
- **Add a finder pattern** — add an entry to `PATTERNS` in [`assets/guide.js`](../assets/guide.js) with `detail`, `start`, `outcomes`, and a `path` of existing service ids (the keys of the `C` catalog).

Then run it locally (`python3 -m http.server 8000`) to confirm it renders, and note in the PR what you verified.

## Review checklist

Before a scenario is merged, it should satisfy:

- [ ] Starts from a workload, not a tool.
- [ ] Names a clear entry level and a minimal service path.
- [ ] Every service framed as an add-on that enables after the Landing Zone is live.
- [ ] Alarms are actionable and each has an owner + runbook.
- [ ] Dashboards have an audience and an owner.
- [ ] Prerequisites, distributed correlation keys, telemetry boundaries, and the empty-result caveat are explicit.
- [ ] No secrets, OCIDs, public IPs, tenancy namespaces, or customer data in any example.
- [ ] `npm run governance:refresh-links` records current public-link status and `npm run build` passes offline governance checks.
