# Contributing to OCI Observability Atlas

Contributions should make an operating decision clearer, safer, and easier to verify. This project accepts corrections, source updates, accessibility improvements, and community scenarios. It does not accept customer data, tenancy configuration, credentials, unsupported product promises, or architecture presented as universally production-ready.

The project is independent and community-built. A merged contribution is editorially accepted by the Atlas maintainers; it is not certified, supported, or endorsed by Oracle or another cloud provider.

By submitting a contribution, you agree that it may be distributed under the repository's MIT license and that you have the right to contribute the submitted material.

## Ownership boundaries

Every community scenario has three explicit ownership layers:

| Owner | Owns | Does not own |
|---|---|---|
| Community author | Topology hypothesis, public references, reproducible synthetic evidence, failure points, correlation model, and first runbook draft | Project schema, merge decision, or an adopter's production configuration |
| Project maintainer | Schema conformance, security and privacy review, editorial quality, Finder and Interlock mappings, generated artifacts, versioning, and merge decision | Production validation inside a contributor's or adopter's tenancy |
| Workload or service owner | Production thresholds, SLOs, response authority, escalation, privacy approval, capacity, cost, and validation for the owned boundary | Other teams' services or the Atlas editorial policy |

The observability platform owner additionally owns collection health, telemetry contracts, access, retention, and cross-cloud handoffs. The security or governance owner approves sensitive-field handling and evidence retention. A scenario must name these responsibilities even when one team performs several roles.

Community definitions are reference architecture. Adopters remain responsible for IAM, network, region, tenancy or account scope, service limits, data residency, privacy, cost, licensing, and production testing.

## Scenario file contract

Create both files:

1. `assets/scenarios/<scenario-id>.json` is the machine-readable definition consumed by Finder and Interlocks.
2. `docs/scenarios/<scenario-id>.md` is the human-readable operating guide.

Add the JSON filename to `assets/scenarios/index.json`. The ID and filename use lowercase kebab-case and must remain stable after publication. Definitions conform to `governance/schemas/community-scenario.schema.json`.

The JSON definition includes:

- Ownership and lifecycle status.
- Discovery terms, operating-profile traits, Finder patterns, and exact Interlock mappings.
- Peer environments, workloads, owners, egress boundaries, and the end-to-end route.
- Real metric names with units, source, authority, dimensions, and a testable failure threshold.
- Separate log/event and trace contracts, including required and prohibited fields.
- At least three concrete failure points with evidence, first action, and Interlock handoff.
- Prerequisites, distributed correlation keys, response steps, and explicit empty-result behavior.
- Public authoritative references.

Never add credentials, data keys, tokens, private endpoints, OCIDs, cloud account identifiers, tenancy namespaces, customer names, personal data, or internal addresses. Use abstract names and approved placeholders. Synthetic identifiers must be visibly synthetic and non-routable.

## Telemetry ingestion standards

Signal ownership is strict:

- Metrics remain authoritative in OCI Monitoring, Prometheus, or the declared metric backend. Every metric records its exact name, unit, source, dimensions, and threshold assumption.
- Logan owns parsed log and event records. A Prometheus exporter record can be investigated in Logan, but the record does not transfer metric authority or import metric-only metadata into the log contract.
- APM owns traces, spans, RUM, and synthetic evidence. It may link to logs and exemplars through shared correlation keys without adopting Logan-specific or metric-specific fields.
- Shared correlation fields are limited to the declared cross-signal contract, normally `trace_id`, `span_id`, `service.name`, a privacy-safe business reference, deployment context, resource or entity identity, and UTC event time.

Collection must be loss-aware. Scenarios identify collector/exporter health signals, clock assumptions, sampling policy, redaction, retention, and what operators see when a source is delayed or unavailable.

A zero-row query is always inconclusive until permissions, account or tenancy, compartment, region, time window, clock skew, parser/source association, exporter health, field mapping, and correlation propagation have been checked.

## Technical acceptance checklist

The project maintainer blocks merge until every applicable item is satisfied:

- [ ] JSON and Markdown files describe the same topology, owners, failure points, metrics, and workflow.
- [ ] The scenario ID is unique, stable, lowercase kebab-case, and registered in `assets/scenarios/index.json`.
- [ ] At least two cloud or on-premises environments are structural peers, not decorative labels.
- [ ] Every service and telemetry claim has a public authoritative source.
- [ ] Every metric has a real name, unit, owner, source, dimensions, threshold, and validation caveat.
- [ ] Logan, Prometheus or OCI Monitoring, and APM contracts remain segregated.
- [ ] Prerequisites, correlation keys, collection-health signals, privacy constraints, and empty-result behavior are explicit.
- [ ] Every failure point maps to an existing Interlock diagram and workflow.
- [ ] Finder query terms and persona, industry, goal, and pattern traits are specific enough to avoid unrelated matches.
- [ ] Runtime output uses safe DOM construction; community fields are not inserted as unsanitized HTML.
- [ ] No secrets, private keys, tokens, customer data, proprietary identifiers, internal topology, or personal paths are present.
- [ ] `npm run test:ci` passes with no skipped tests.
- [ ] `npm run test:coverage:ci` remains above the configured line threshold.
- [ ] `npm run lint`, `npm run governance:validate`, and `npm run security:scan` pass.
- [ ] `npm run artifacts:check` reports no generated drift.
- [ ] `npm run test:smoke` passes at desktop and mobile widths.
- [ ] Finder query matching, operating-profile matching, Interlock mapping, keyboard access, empty states, and network failure behavior have automated coverage.

When a contribution adds or changes public links, run `npm run governance:refresh-links` once, review the status metadata, and then rerun offline validation. Do not refresh link metadata merely to hide a failing or irrelevant source.

## Editorial acceptance checklist

- [ ] Starts with the workload and operator consequence, not a vendor product list.
- [ ] Uses authoritative, practical, approachable language without sales claims.
- [ ] Distinguishes documented service capability from independent architecture inference.
- [ ] Defines advanced acronyms at first use.
- [ ] Gives every alarm, dashboard, and runbook an audience or owner.
- [ ] Uses varied, direct sentences and avoids decorative jargon or excessive em dashes.
- [ ] Gives non-OCI environments equal structural weight where the scenario is multicloud.
- [ ] Explains failure, degraded telemetry, recovery validation, and escalation rather than only the happy path.
- [ ] Preserves meaning without motion and remains understandable in a narrow viewport.
- [ ] Links to the machine-readable definition from Markdown and to the Markdown guide from runtime output.

## Pull request workflow

1. Open a proposal issue or draft pull request describing the operating problem, intended owners, and public sources.
2. Copy the reference scenario under a new stable ID; do not edit the reference example into an unrelated topology.
3. Add JSON, Markdown, registry entry, Finder traits, and exact Interlock mappings in one change.
4. Write or update tests before changing runtime behavior.
5. Run the complete technical acceptance checklist locally.
6. Include screenshots of Finder and Interlock output at desktop and mobile widths, plus the commands and results used for verification.
7. Request review from a project maintainer and, for specialized claims, an appropriate workload or service owner.
8. Resolve all security, contract-boundary, accessibility, source-governance, and generated-artifact findings before merge.

Maintainers may request narrower scope, additional authoritative sources, synthetic evidence, or a separate change for reusable engine behavior. Rejected submissions should retain their discussion history so a future contributor can understand the decision.
