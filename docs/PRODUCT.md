# PRODUCT.md

## Register

Product. Design serves an operational tool: authenticated dashboard, data tables, sidebar nav, alert metrics, and station readings. No brand or marketing surface.

## Users

Emergency response coordinators and civil servants. They use this during active flood events or routine monitoring shifts, often under time pressure, scanning for severity levels and regional hotspots. The stakes are high; the interface should feel like it belongs in an operations center, not a consumer app.

## Product Purpose

Operational triage of UK Environment Agency flood alerts and latest river gauge readings. The primary task on any screen: assess current severity, filter to the region or category that matters right now, and act (detail drill-down, refresh, search by intent).

## Brand Personality

Precise. Authoritative. Focused.

## References

- **Linear**: The authority on keyboard-first, dense, dark product UI. Earned familiarity, nothing gratuitous. Typography carries the hierarchy; decoration never does.

## Anti-References

- The current "Obsidian & Amber" design: warm-tinted background, amber primary. The new direction moves away from this palette and any similarly warm/cozy aesthetic.
- Generic observability dashboards: "dark blue + glowing green metrics" SaaS cliché.
- Glassmorphism, hero metrics with gradient accents, decorative borders.

## Strategic Principles

1. Information before atmosphere. Every pixel serves legibility or state.
2. Severity signals must be instantly scannable: no hunting for the most critical alert.
3. Keyboard-first affordances where reasonable (search command, preset nav).
4. Restrained color strategy: one accent, used only for actions and current state. Data colors (severity, chart series) are separate and semantic.
5. Density over chrome. Fit more without clutter rather than inflating whitespace to feel "premium."

## Accessibility

WCAG AA. Contrast checks required for all text on all surface variants. Reduced-motion respected via `prefers-reduced-motion`.
