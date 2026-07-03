# Product roadmap and task register

Updated: 2026-07-03

This is the canonical register for product requirements and unfinished project work. `PRODUCT.md` defines the product principles, while `DESIGN.md` defines the visual system. The operational checklists in `observability-design-guide.md` describe customer implementation work and are not website backlog items.

At the time of this update there are **No open GitHub issues** for this repository. Remaining work is therefore tracked here until it is converted into an issue or pull request.

## PRD status

| PRD | Outcome | Status |
|---|---|---|
| PRD-01 | Canonical L0 to L4 orientation, with operator scale presented as an architecture extension | Complete |
| PRD-02 | Progressive personalization, responsive contents navigation, mobile Finder behavior, and persistent selection state | Complete |
| PRD-03 | WCAG-oriented contrast, metadata sizing, keyboard tabs, focus management, clipboard feedback, and reduced-motion safeguards on the Atlas and Interlocks surfaces | Partial |
| PRD-04 | Multicloud peer selection, interactive telemetry routing, primary Interlocks handoff, and cross-domain Logan workflows | Complete |
| PRD-05 | Launchpad alignment with the canonical model and accessibility baseline | Partial |
| PRD-06 | Source governance and service-boundary maintenance | Complete |
| PRD-07 | Automated quality and release gates | Partial |
| PRD-08 | Community scenario contribution workflow | Complete |

## Implemented scope to date

### PRD-03: Accessibility baseline

- Corrected functional metadata contrast and removed undersized sequence and state labels.
- Added WAI-ARIA tab relationships and keyboard behavior, accessible clipboard feedback, focus-managed result regions, and reduced-motion safeguards.
- Retained readable, layout-stable essential content before progressive reveal effects run.

### PRD-05: Launchpad alignment

- Replaced the Launchpad's L0 to L5 maturity stepper with L0 to L4 plus a separately labeled operator-scale architecture extension.
- Added a compact mobile structural map with active viewport state.
- Persisted active Launchpad module, persona, industry, lens, and scale pattern through URL search parameters with a session-storage fallback.
- Raised functional metadata to at least 12px, enforced 48px targets, and retained readable semantic text colors.
- Added integration and real-browser tests for keyboard use, mobile reflow, state restoration, inspector tabs, and reduced motion.

### PRD-06: Source governance

- Added source-wide external-link discovery with a dated HTTP-status registry, an explicit JSON schema, live refresh, and offline compilation verification.
- Added machine-readable Logan, Prometheus, and APM contracts that reject service-specific metadata overlap outside declared correlation fields.
- Added a localized roadmap and rename ledger with review deadlines and compilation-time deprecated-name checks.
- Added prerequisites, distributed correlation keys, telemetry ownership, and empty-result guidance to all 60 Interlock workflows and their HTML, Draw.io, Excalidraw, and PDF views.
- Repaired or removed stale references found by the first live validation pass and propagated HTTP status metadata into the generated source register.

### PRD-07: Quality and release gates

- Added a least-privilege GitHub Actions pipeline for every pull request and commit to `main`, with action revisions pinned to immutable commit SHAs.
- Enforced the complete test suite with a 40-test minimum, no skipped or incomplete tests, and an 80% line-coverage floor.
- Added source-wide syntax and static checks, local and Gitleaks secret scanning, and redaction rules for credentials and proprietary infrastructure identifiers.
- Added deterministic artifact regeneration and drift detection, with editable vectors retained in source control and compiled PDFs and release bundles produced on demand.
- Locked generated vectors to an exact path-and-SHA-256 snapshot so missing, changed, unexpected, and obsolete artifacts fail the build.
- Added release packaging filters for editor backups, local configuration, credentials, OS noise, and symbolic links, plus an exact 66-PDF public-surface assertion.
- Removed the obsolete repository `CNAME` input and switched the GitHub Pages setting from legacy branch publishing to workflow publishing at the repository URL.
- Prepared the verified release package for GitHub Pages at the deployment root and added byte-size, SHA-256, redirect, and Interlocks DOM checks for every required public artifact. Production acceptance remains open until a successful `main` deployment is recorded.
- Added real-browser smoke coverage for the Atlas, Launchpad, Interlocks explorer, and Interlock detail surface at desktop and mobile widths.

### PRD-08: Community scenario contributions

- Added a complete retail-checkout scenario spanning AWS, Azure, OCI, and an on-premises Oracle Database, with seven named metrics, six failure points, prerequisites, correlation keys, empty-result behavior, and strict Logan, metric, and APM boundaries.
- Added a versioned JSON schema, runtime scenario registry, validation, and a human-readable reference guide.
- Connected Finder search, operating-profile traits, Finder patterns, and exact Interlock workflows to the same scenario definition.
- Added community-author, maintainer, platform-owner, and workload-owner boundaries plus technical and editorial acceptance gates in `CONTRIBUTING.md`.
- Added unit, integration, and dual-width browser assertions for query matching, profile matching, and Interlock output.

## Remaining tasks

Five of eight PRDs are complete (62.5%). PRD-03, PRD-05, and PRD-07 remain partial because their outstanding accessibility and production acceptance work cannot be inferred from automated implementation checks alone:

### PRD-03: Accessibility verification

- [ ] Complete a manual WCAG 2.2 AA review of Atlas and Interlocks with representative screen-reader and browser combinations, then resolve documented findings.

### PRD-05: Launchpad verification

- [ ] Complete manual assistive-technology and real-device verification of the Launchpad tabs, mobile drawer, sticky structural map, focus restoration, and persisted state.

### PRD-07: Test and deployment readiness

- [x] Instrument the critical browser application scripts and enforce the 80% client line-coverage gate.
- [x] Execute the full Launchpad E2E suite in CI before release packaging.
- [x] Stabilize repeated owned-Chromium startup through one managed browser lifecycle with bounded startup and deterministic shutdown.
- [ ] Merge and run the workflow-based GitHub Pages deployment, then record cryptographic verification of the live `interlocks.html` route and all 66 architecture PDF URLs.

## Completion rule

A PRD is complete only when its user-visible behavior, accessibility requirements, automated tests, documentation, and generated artifacts agree. A checklist item in the enterprise design guide does not close a product task by itself.
