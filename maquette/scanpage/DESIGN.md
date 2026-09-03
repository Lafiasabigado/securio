---
name: Security Health
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006329'
  on-tertiary: '#ffffff'
  tertiary-container: '#007f36'
  on-tertiary-container: '#c7ffca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  mono-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  layout-margin-mobile: 1rem
  layout-margin-desktop: 2rem
  layout-gutter: 1rem
---

## Brand & Style

This design system delivers an immaculate, rigorous, and crystalline interface tailored for high-stakes enterprise security infrastructure and posture management. The visual tone is authoritative, surgically precise, and serene—eradicating the noisy, alarmist conventions and dark hacker tropes typical of cybersecurity tools in favor of an airy, high-clarity daylight environment.

### Personality & Emotional Response
- **Trustworthy & Authoritative:** The interface conveys institutional stability, audit-grade precision, and steady control.
- **Cognitive Calm:** High-density telemetry is rendered with generous whitespace, subtle containment borders, and restrained accent signals to prevent operator fatigue during incident triages.
- **Technical Craft:** Monospaced data displays paired with structural typography signal mechanical exactness and real-time reliability.

### Design Style: Modern Technical Precision
A tailored synthesis of **Minimalism** and **Modern Corporate SaaS**. Depth is established strictly through fine, low-contrast structural outlines (`1px`) and pale canvas shifts rather than heavy drop-shadows or skeuomorphism. Surfaces remain crisp, bright, and flat, letting telemetry, health statuses, and cryptographic identifiers emerge with absolute legibility.

## Colors

The palette relies on a high-clarity white canvas accented by slate structural neutrals, a decisive cobalt primary, and uncompromising semantic health indicators. Every token strictly preserves WCAG AAA or AA accessibility across daylight viewing scenarios.

### Surfaces & Backgrounds
- **Base Canvas (`surface-ground`):** `#f8fafc` — Soft cool off-white for wide workspace viewports and app frames.
- **Secondary Canvas (`surface-subtle`):** `#f1f5f9` — Structural bands, rail backgrounds, and table headers.
- **Card / Surface (`surface-panel`):** `#ffffff` — Crisp elevated panels, modals, and metric tiles.

### Borders & Structural Rules
- **Subtle Border (`border-default`):** `#e2e8f0` — Standard container outlines, divider rules, and grid separations.
- **Strong Border (`border-strong`):** `#cbd5e1` — Interactive input boundaries, active tab markers, and table edges.

### Typography & Content
- **Primary Text (`text-primary`):** `#0f172a` — Headers, primary metrics, active states.
- **Secondary Text (`text-secondary`):** `#475569` — Section summaries, table records, metadata keys.
- **Tertiary / Muted Text (`text-muted`):** `#64748b` — Timestamps, inline tooltips, inactive states.

### Core & Semantic Accents
- **Primary Action (`interactive-primary`):** `#2563eb` (Hover: `#1d4ed8`) — Action triggers, focus rings, interactive toggles.
- **Health: Passed / Nominal:** `#16a34a` (Darker: `#15803d`, Pale Tint: `#f0fdf4`, Border: `#bbf7d0`) — Fully compliant assets, passing scans, operational certificates.
- **Health: Warning / Attention:** `#d97706` (Darker: `#b45309`, Pale Tint: `#fffbeb`, Border: `#fde68a`) — Expiring certs, configuration drift, latency anomalies.
- **Health: Issue / Critical:** `#dc2626` (Darker: `#b91c1c`, Pale Tint: `#fef2f2`, Border: `#fecaca`) — Vulnerabilities, active breaches, broken posture constraints.
- **Health: Informational:** `#2563eb` (Darker: `#1d4ed8`, Pale Tint: `#eff6ff`, Border: `#bfdbfe`) — Neutral telemetry, protocol syncs, informational audits.

## Typography

The typographic hierarchy distinguishes narrative human structure from empirical system output.

- **Primary Interface Font (`Inter`):** Applied across all displays, page titles, navigation systems, and analytical prose. Characterized by tall x-heights, neutral terminals, and pristine rendering across dense dashboard spaces.
- **Telemetry & Monospace Font (`JetBrains Mono`):** Strictly deployed for machine identifiers, IP addresses, CVE signatures, cryptographic hashes, security scores, and inline metric counters.

### Application Rules
1. **Numeric Health Scores:** Scores and high-level KPIs use `mono-lg` or `headline-xl` with tabular figures enabled (`font-variant-numeric: tabular-nums`) to prevent horizontal layout shift during streaming data cycles.
2. **Metadata Badges:** Micro-labels and tag descriptors use uppercase `label-sm` with slight positive tracking (`0.04em`) to maintain legibility at minute scales.

## Layout & Spacing

This design system uses a strict **8pt base grid** (supplemented by 4pt micro-increments for compact telemetry components). The structure is designed to support dashboard layouts, multi-column posture grids, and nested data grids.

### Grid Framework
- **Desktop (>= 1280px):** 12-column responsive fluid grid pinned to a maximum container width of `1600px`. Standard gutters are `1rem` (16px); page margins are `2rem` (32px).
- **Tablet (768px - 1279px):** 8-column layout. Gutters compress to `1rem`, outer margins to `1.5rem`. Multi-pane inspectors collapse into modular stacked blocks.
- **Mobile (< 768px):** 4-column layout. Outer margins are `1rem`. Side panels and security audit trails reflow as full-screen modal overlays.

### Layout Rhythms
- **Metric Grids:** Multi-card telemetry rows use consistent `1rem` gaps.
- **Surface Internal Density:** Dense inspection tables adhere to `0.5rem` vertical cell padding; primary overview cards utilize `1.5rem` internal padding for breathing room.

## Elevation & Depth

Visual hierarchy is maintained through **crisp low-contrast outlines** and subtle shifts in surface luminance. Deep drop shadows, heavy scrims, and blurred backdrops are eliminated to preserve crisp contrast and clean separation.

### Surface Tiers
1. **Level 0 (App Canvas):** `#f8fafc` — Foundational background. No border.
2. **Level 1 (Panels & Cards):** `#ffffff` with a `1px solid #e2e8f0` border. Ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.03)`.
3. **Level 2 (Dropdowns, Popovers, & Tooltips):** `#ffffff` with a `1px solid #cbd5e1` border. Ambient shadow: `0 4px 12px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
4. **Level 3 (Modal Dialogs & Slide-overs):** `#ffffff` with a `1px solid #cbd5e1` border. Deep structural shadow: `0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)`. Overlay scrim: `#0f172a` at `25%` opacity.

## Shapes

The design system employs a **Soft** shape geometry (`roundedness: 1`). Radii are reserved and functional, reinforcing an analytical, engineering-first aesthetic rather than a casual consumer tone.

### Border Radius Rules
- **Micro UI (`4px` / `0.25rem`):** Badges, inline status tags, checkboxes, scrollbars, and telemetry pills.
- **Interactive UI (`6px` / `0.375rem`):** Buttons, form inputs, segmented control segments, dropdown triggers.
- **Panels & Containers (`8px` / `0.5rem`):** Metric cards, data tables, code inspector blocks, modal windows.
- **Pill Exceptions (`9999px`):** Reserved exclusively for dynamic status pings (e.g., live streaming dots) and zero-metric indicators.

## Components

### Buttons
- **Primary:** Background `#2563eb`, border `1px solid #1d4ed8`, text `#ffffff`. Hover: `#1d4ed8`. Focused: outer ring `2px` offset with `#2563eb` at `20%`.
- **Secondary / Neutral:** Background `#ffffff`, border `1px solid #cbd5e1`, text `#0f172a`. Hover: background `#f8fafc`, border `#94a3b8`.
- **Subtle / Ghost:** Background transparent, text `#475569`. Hover: background `#f1f5f9`, text `#0f172a`.
- **Destructive:** Background `#dc2626`, text `#ffffff`. Hover: `#b91c1c`.

### Status Badges & Chips
- **Structural Construction:** `1px` outer border, soft tinted background, bold label, and optional 6px circular indicator dot.
- **Passed:** Background `#f0fdf4`, border `#bbf7d0`, text `#15803d`.
- **Warning:** Background `#fffbeb`, border `#fde68a`, text `#b45309`.
- **Issue:** Background `#fef2f2`, border `#fecaca`, text `#b91c1c`.
- **Info / Neutral:** Background `#eff6ff`, border `#bfdbfe`, text `#1d4ed8`.

### Data Tables & Health Rows
- **Header:** Background `#f8fafc`, text `#64748b` (`label-sm`), bottom border `1px solid #e2e8f0`. Height: `36px`.
- **Rows:** Background `#ffffff`, alternating hover `#f8fafc`, bottom border `1px solid #f1f5f9`. Text `#0f172a` (`body-md`), telemetry fields rendered in `mono-md`.
- **Selection State:** Row background `#eff6ff`, left indicator highlight bar `2px` solid `#2563eb`.

### Form Inputs & Telemetry Filters
- **Text & Select Fields:** Height `36px`, background `#ffffff`, border `1px solid #cbd5e1`, text `#0f172a`, placeholder `#94a3b8`. Focus: border `#2563eb`, shadow `0 0 0 1px #2563eb`.
- **Checkboxes & Radios:** Size `16px`, border `1.5px solid #94a3b8`, corner radius `3px`. Checked: background `#2563eb`, border `#2563eb`, check glyph `#ffffff`.

### Cards & Telemetry Tiles
- **Structure:** Pure white `#ffffff` surface, outer border `1px solid #e2e8f0`, padding `1.25rem`.
- **Metric Presentation:** Label in `label-sm` (`#64748b`), primary metric in `mono-lg` (`#0f172a`), bottom trend delta badge embedded with semantic health tints.