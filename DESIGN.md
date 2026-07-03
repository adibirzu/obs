---
name: OCI Observability Atlas
description: A living visual atlas for understanding OCI and multicloud observability systems.
colors:
  redwood-signal: "#C74634"
  redwood-signal-hover: "#B23C2B"
  redwood-signal-active: "#9C3424"
  deep-telemetry-blue: "#04536F"
  link-blue: "#00688C"
  diagnostic-plum: "#6C3F49"
  trace-ochre: "#C58C52"
  control-plane-pine: "#315357"
  infrastructure-ink: "#2A2F2F"
  body-stone: "#3B4140"
  muted-stone: "#6B7170"
  divider-stone: "#E4E7E6"
  sunken-stone: "#F3F4F3"
  atlas-ground: "#FBF9F8"
  white: "#FFFFFF"
  signal-tint: "#F6E1DC"
  telemetry-tint: "#DCE7EC"
  diagnostic-tint: "#E8E1E5"
  trace-tint: "#FBF1D8"
  control-tint: "#E3ECEB"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.6rem, 1.4rem + 4.5vw, 5.25rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Figtree, 'Oracle Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "Figtree, 'Oracle Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0"
  mono:
    fontFamily: "'Roboto Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.04em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
  space-7: "48px"
  space-8: "64px"
  space-9: "96px"
  space-10: "128px"
components:
  button-primary:
    backgroundColor: "{colors.redwood-signal}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.redwood-signal-hover}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
  button-secondary:
    backgroundColor: "{colors.atlas-ground}"
    textColor: "{colors.deep-telemetry-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    height: "44px"
  chip:
    backgroundColor: "{colors.sunken-stone}"
    textColor: "{colors.muted-stone}"
    typography: "{typography.mono}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.body-stone}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.infrastructure-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: "44px"
  navigation:
    backgroundColor: "{colors.atlas-ground}"
    textColor: "{colors.muted-stone}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
    height: "40px"
  workflow-stage:
    backgroundColor: "{colors.white}"
    textColor: "{colors.infrastructure-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
---

# Design System: OCI Observability Atlas

## 1. Overview

**Creative North Star: "The Living Signal Atlas"**

The interface behaves like a working systems map: calm enough for careful architecture review, structured enough for rapid scanning, and alive where movement explains a path. Its physical character is a field atlas laid across an operations table—authoritative source material, precise annotations, and visible routes connecting signals to decisions.

The visual language is authoritative, practical, and approachable. Oracle Redwood provides familiarity without turning the experience into an Oracle campaign. Multicloud sources receive meaningful visual weight, while OCI services remain specific and technically legible. Motion is explanatory: it shows telemetry movement, workflow sequence, state change, and control-plane handoff. It is never ambient decoration.

The system explicitly rejects generic SaaS styling, sales-heavy Oracle imitation, ornamental cloud imagery, dense product catalogs without guidance, and multicloud diagrams that reduce non-OCI environments to decorative inputs.

**Key Characteristics:**

- Cartographic hierarchy: routes, levels, and relationships lead; product lists follow.
- Quiet Redwood foundations with a functional multicolor vocabulary for service families and system states.
- Serif-led editorial authority balanced by a humanist sans for dense technical reading.
- Layered-by-state surfaces: flat by default, raised only when hierarchy or interaction requires it.
- Purposeful motion with equivalent static and reduced-motion meaning.

**The Meaningful Motion Rule.** Animate a route, handoff, progression, or state—not the existence of a section. Content remains visible before animation runs, and reduced-motion users receive the same information without spatial travel.

## 2. Colors

The palette combines Redwood recognition with a restrained systems vocabulary: one signal red, one telemetry blue, role-specific diagnostic colors, and a warm stone neutral ramp.

### Primary

- **Redwood Signal** (`#C74634`): The primary action and brand signal. Use it for decisive calls to action, progress, and the few moments that must command attention.
- **Deep Telemetry Blue** (`#04536F`): The systems and navigation anchor. Use it for links, selected states, architecture paths, focus, and technical orientation.

### Secondary

- **Diagnostic Plum** (`#6C3F49`): Log analysis, investigation, and correlation.
- **Trace Ochre** (`#C58C52`): Traces, warnings, latency, and transitional stages.
- **Control-Plane Pine** (`#315357`): Governance, platform foundations, and controlled collection.

### Tertiary

- **Signal Tint** (`#F6E1DC`): Quiet red context without action emphasis.
- **Telemetry Tint** (`#DCE7EC`): Selected technical context and informational surfaces.
- **Diagnostic Tint** (`#E8E1E5`): Low-intensity diagnostic grouping.
- **Trace Tint** (`#FBF1D8`): Notes, cautions, and explanatory emphasis.
- **Control Tint** (`#E3ECEB`): Platform and governance context.

### Neutral

- **Infrastructure Ink** (`#2A2F2F`): Headlines and strongest text.
- **Body Stone** (`#3B4140`): Reading text and technical explanations.
- **Muted Stone** (`#6B7170`): Secondary copy that still meets contrast requirements.
- **Divider Stone** (`#E4E7E6`): Quiet boundaries and separators.
- **Sunken Stone** (`#F3F4F3`): Recessed groups and alternating sections.
- **Atlas Ground** (`#FBF9F8`): Primary page surface.
- **White** (`#FFFFFF`): Raised and contained surfaces.

### Named Rules

**The Signal Rarity Rule.** Redwood Signal is reserved for primary actions and critical path emphasis; if every element is red, nothing is a signal.

**The Route Color Rule.** Service-family colors encode meaning consistently across diagrams, filters, cards, and legends. Never assign them decoratively.

**The Contrast Before Subtlety Rule.** Body and placeholder text must reach 4.5:1 contrast. Muted Stone is the lightest default prose color on Atlas Ground.

## 3. Typography

**Display Font:** Georgia (with Times New Roman and serif fallbacks)<br>
**Body Font:** Figtree (with Oracle Sans and system sans fallbacks)<br>
**Label/Mono Font:** Roboto Mono (with system monospace fallbacks)

**Character:** Georgia gives architecture narratives and major questions established authority; Figtree keeps long technical explanations approachable; Roboto Mono marks codes, steps, metrics, and compact system labels without turning the whole interface into a terminal.

### Hierarchy

- **Display** (400, `clamp(2.6rem, 1.4rem + 4.5vw, 5.25rem)`, 1.08): One page-defining statement or question; never a decorative slogan.
- **Headline** (400, `2.25rem`, 1.08): Major sections and architecture narratives.
- **Title** (400, `1.375rem`, 1.2): Service groups, cards, dialogs, and workflow stages.
- **Body** (400, `1rem`, 1.6): Explanations and guidance, capped at 68–75 characters per line.
- **Label** (600, `0.8125rem`, normal tracking): Navigation and actions. Uppercase is reserved for genuinely compact categorical labels.
- **Mono** (500, `0.75rem`, `0.04em` tracking): Level codes, source badges, telemetry labels, and compact metadata.

### Named Rules

**The Question-Led Hierarchy Rule.** Headings name the user question or system outcome before naming products.

**The Serif Authority Rule.** Georgia carries narrative hierarchy, not dense UI. Figtree owns controls, tables, filters, and long explanations.

**The Legibility Floor Rule.** Display tracking never falls below `-0.04em`; body text never shrinks below `0.875rem` for application UI or `1rem` for reading surfaces.

## 4. Elevation

The system is layered by state. Tonal surfaces and borders establish the default hierarchy; shadows are quiet, warm-neutral, and appear only when an element is physically raised, transient, or responding to interaction. Modals, inspectors, sticky toolbars, and hero imagery may use stronger elevation because they occupy a distinct plane.

### Shadow Vocabulary

- **Quiet Edge** (`0 1px 2px rgba(42, 47, 47, 0.06)`): Minimal separation for contained surfaces.
- **Interactive Lift** (`0 4px 12px rgba(42, 47, 47, 0.08), 0 2px 4px rgba(42, 47, 47, 0.04)`): Hovered cards and active panels.
- **Raised Panel** (`0 12px 28px rgba(42, 47, 47, 0.12), 0 4px 8px rgba(42, 47, 47, 0.05)`): Inspectors, menus, and prominent media.
- **Overlay Plane** (`0 24px 56px rgba(42, 47, 47, 0.16), 0 8px 16px rgba(42, 47, 47, 0.06)`): Dialogs and overlays only.
- **Focus Halo** (`0 0 0 3px rgba(4, 83, 111, 0.35)`): Keyboard focus when an outline alone does not sufficiently follow the component shape.

### Named Rules

**The Flat-at-Rest Rule.** Ordinary cards and controls are flat at rest. Elevation communicates hierarchy or state; it is never surface decoration.

**The One Edge Rule.** A component may use a structural border or a broad shadow, but never the decorative one-pixel-border-plus-wide-shadow ghost-card combination.

## 5. Components

Components feel tactile, restrained, and confident. Their geometry is compact and systematic; state changes are immediate, readable, and free of bounce.

### Buttons

- **Shape:** Full-pill actions (`999px`) with a minimum `44px` target height.
- **Primary:** Redwood Signal background, White text, `8px 16px` padding, and semibold Figtree labels.
- **Hover / Focus:** Darken through the documented red states; use the Deep Telemetry Blue focus ring. Active state may compress by no more than `0.5px`.
- **Secondary / Ghost:** Transparent or Atlas Ground background with a `1.5px` Deep Telemetry Blue inset stroke; fill only on hover.

### Chips

- **Style:** Sunken Stone background, Muted Stone text, a quiet Divider Stone border, mono metadata, and pill geometry.
- **State:** Selected chips move to Telemetry Tint with Deep Telemetry Blue text and border. Do not rely on color alone; preserve `aria-pressed`, a check, or another explicit state cue.

### Cards / Containers

- **Corner Style:** Gently curved (`10–16px`) for ordinary cards; `24px` is reserved for singular hero media or large feature panels.
- **Background:** White for contained information, Sunken Stone for recessed grouping, and Atlas Ground for the page plane.
- **Shadow Strategy:** Flat at rest; Interactive Lift only on genuinely interactive cards.
- **Border:** One-pixel Divider Stone or role-colored border. Colored side stripes are prohibited.
- **Internal Padding:** `16–24px`, increasing to `32px` only for large feature panels.

### Inputs / Fields

- **Style:** White surface, one-pixel Divider Stone border, `10px` radius, and at least `44px` height.
- **Focus:** Deep Telemetry Blue border plus a three-pixel translucent focus halo.
- **Error / Disabled:** Error uses Redwood Signal with an explicit message; disabled fields use Sunken Stone and remain legible, never merely faded.

### Navigation

- **Style:** Sticky Atlas Ground navigation with a quiet divider, compact Figtree labels, and the Redwood/OCTO lockup. Default links use Muted Stone; hover and active states move to Infrastructure Ink or Deep Telemetry Blue.
- **Mobile:** Collapse secondary level links before compressing touch targets. Preserve direct access to the launchpad and current location.

### Workflow Paths

- **Style:** Stages use role-colored labels, explicit arrows or connectors, and short outcome-oriented text. Direction, branching, and aggregation must remain legible without animation.
- **Motion:** Animate along an already-visible connector using the `120ms`, `200ms`, and `320ms` duration vocabulary with standard, emphasized, or ease-out curves. No bounce or elastic easing.
- **Reduced motion:** Replace traveling particles and path drawing with an immediate highlighted path, crossfade, or discrete step change.

## 6. Do's and Don'ts

### Do:

- **Do** begin with an operating question, user role, or outcome before exposing service names.
- **Do** use Redwood Signal sparingly and Deep Telemetry Blue consistently for system orientation and focus.
- **Do** show telemetry paths, workflow progression, aggregation, and control-plane handoffs with purposeful motion and an equivalent static explanation.
- **Do** give OCI, other clouds, Kubernetes, and on-premises sources meaningful labels and visual weight.
- **Do** preserve keyboard access, visible focus, semantic controls, WCAG 2.2 AA contrast, and `prefers-reduced-motion` alternatives.
- **Do** distinguish documented capabilities from independent architecture guidance and keep source links close to the claim they support.

### Don't:

- **Don't** create generic SaaS landing pages built from interchangeable hero, metric, and card-grid templates.
- **Don't** use sales-heavy Oracle imitation or any presentation that could be mistaken for an official Oracle product or campaign.
- **Don't** use decorative cloud imagery, motion, or jargon that does not explain a real system relationship.
- **Don't** build dense product catalogs that expose service names without helping users understand sequence, ownership, or outcomes.
- **Don't** make multicloud comparisons that treat non-OCI environments as secondary or merely decorative inputs.
- **Don't** add colored side-stripe borders, gradient text, decorative grid backgrounds, glassmorphism, or repeated tiny uppercase section eyebrows.
- **Don't** pair a one-pixel border with a wide soft shadow, round ordinary cards beyond `16px`, or hide essential content until an animation fires.
