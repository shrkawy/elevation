# Flood Monitoring Dashboard Implementation Plan

Date: 2026-05-17
Spec: `docs/superpowers/specs/2026-05-17-flood-monitoring-dashboard-design.md`

## Rules For Implementation

- Keep `app/page.tsx` route-thin. It should only render the exported
  `FloodDashboard` component.
- Do not add `app/api/floods` or `app/api/readings` route handlers.
- Environment Agency flood/readings data must be fetched through
  `services/flood-monitoring/`.
- Keep raw Environment Agency response objects out of presentation components.
- Keep OpenAI usage server-side in `app/api/search-intent/route.ts`.
- Prefer direct imports over broad barrels.
- Before framework-specific changes, consult the local Next docs under
  `node_modules/next/dist/docs/`.

## Phase 1: Project Setup

- [ ] Read the relevant local Next docs for providers, route handlers, fonts,
  and Client Component boundaries.
- [ ] Install dependencies:
  - `@tanstack/react-query`
  - `ai`
  - `@ai-sdk/openai`
  - `zod`
  - `recharts`
  - `vitest`
- [ ] Add a `test` script for Vitest.
- [ ] Add `app/providers.tsx` as a Client Component with `QueryClientProvider`.
- [ ] Wrap `children` with `Providers` in `app/layout.tsx`.
- [ ] Replace Geist with Hanken Grotesk and JetBrains Mono via
  `next/font/google`.
- [ ] Update metadata title/description for the flood monitoring dashboard.
- [ ] Update `app/globals.css` tokens to match Obsidian & Amber:
  - dark background/surface/card colors
  - amber primary color
  - restrained borders
  - font variables
  - tighter dashboard radii

## Phase 2: Service Layer Foundation

- [ ] Create `services/api.ts`.
- [ ] Implement shared fetch behavior:
  - timeout via `AbortController`
  - JSON parsing
  - predictable error messages
  - no secret-dependent behavior
- [ ] Create `services/flood-monitoring/flood-monitoring.types.ts`.
- [ ] Define raw Environment Agency types for only the fields used by the app.
- [ ] Define normalized app models:
  - `FloodAlert`
  - `StationReading`
  - `DashboardMetrics`
  - `ReadingChartBucket`
  - `DashboardSearchParams`
  - severity/type/sort unions
- [ ] Create `services/flood-monitoring/flood-monitoring.api.ts`.
- [ ] Implement `fetchFloodAlerts()` using `/id/floods`.
- [ ] Implement `fetchLatestReadings()` using `/data/readings?latest`.
- [ ] Ensure fetchers return normalized app data or call normalization before
  returning to query hooks.

## Phase 3: Service Helpers And Validation

- [ ] Create `services/flood-monitoring/flood-monitoring.helpers.ts`.
- [ ] Implement flood alert normalization.
- [ ] Implement latest station reading normalization.
- [ ] Cap/thin large payloads to keep render work bounded.
- [ ] Implement dashboard metric aggregation:
  - active warning count
  - severe/critical count
  - latest station reading count
  - average river level
- [ ] Implement region extraction/grouping.
- [ ] Implement filtering by:
  - `q`
  - `severity`
  - `region`
  - `type`
- [ ] Implement sorting by:
  - latest
  - severity
  - highest level
- [ ] Implement latest readings chart bucket creation.
- [ ] Implement Zod schema for supported search params.
- [ ] Implement deterministic fallback natural-language parsing.
- [ ] Ensure fallback parser can detect common severity/type/sort words and
  leave remaining terms as `q` or `region` where practical.

## Phase 4: React Query Hooks

- [ ] Create `services/flood-monitoring/flood-monitoring.queries.ts`.
- [ ] Define stable query keys for floods and readings.
- [ ] Define query options with:
  - `refetchInterval: 60000`
  - transient retry behavior
  - stale/refetching support
  - previous data preservation where compatible with the installed Query API
- [ ] Export hooks for flood alerts and latest readings.
- [ ] Keep query hooks responsible for server data only, not UI state.

## Phase 5: AI Search Intent Route

- [ ] Create `app/api/search-intent/route.ts`.
- [ ] Read local Next route handler docs before implementation.
- [ ] Use Vercel AI SDK with `@ai-sdk/openai`.
- [ ] Require no client-exposed API key.
- [ ] Accept raw user text as input.
- [ ] Return only validated supported params:
  - `q`
  - `severity`
  - `region`
  - `type`
  - `sort`
- [ ] Add timeout/error handling.
- [ ] Fall back to deterministic parser when:
  - `OPENAI_API_KEY` is missing
  - the AI call fails
  - the AI call times out
  - the model returns invalid params
- [ ] Ensure the route never returns factual flood summaries or prose answers.

## Phase 6: Route And Dashboard Feature Shell

- [ ] Create `components/flood-dashboard/flood-dashboard.tsx`.
- [ ] Make it the exported dashboard root.
- [ ] Update `app/page.tsx` so it only imports and renders
  `<FloodDashboard />`.
- [ ] Decide the smallest practical `"use client"` boundary for the dashboard.
- [ ] Wire URL param reading/writing for `q`, `severity`, `region`, `type`,
  and `sort`.
- [ ] Keep active tab and selected modal item in local state.
- [ ] Fetch floods/readings through service query hooks.
- [ ] Derive filtered/sorted visible rows from normalized query data and URL
  params.

## Phase 7: Shared UI Primitives

- [ ] Review existing `components/ui/button.tsx` before adding primitives.
- [ ] Add only the primitives needed for this dashboard, such as:
  - card/panel container
  - badge/status chip
  - input
  - skeleton
  - modal/dialog wrapper
  - tabs or segmented control
- [ ] Keep product-specific dashboard components out of `components/ui`.
- [ ] Use lucide icons for interactive controls where appropriate.
- [ ] Ensure controls are keyboard-accessible and semantic.

## Phase 8: Dashboard Components

- [ ] Build `dashboard-header.tsx`.
- [ ] Show title, live status, latest update timestamp, manual refresh, and
  compact data health indicators.
- [ ] Build `dashboard-sidebar.tsx`.
- [ ] Implement All Regions, Severe Alerts, and Monitoring Stations as URL
  param presets.
- [ ] Show lightweight loading/refetch indicators when relevant.
- [ ] Build `dashboard-metrics.tsx`.
- [ ] Render the metric cards from normalized dashboard metrics.
- [ ] Build `dashboard-search-command.tsx`.
- [ ] Submit raw text to AI search intent route.
- [ ] Apply returned/fallback params to the URL.
- [ ] Show pending/error/fallback states without blocking the dashboard.
- [ ] Build `readings-chart-panel.tsx`.
- [ ] Use Recharts for latest readings distribution.
- [ ] Make the chart responsive and honest about what it represents.
- [ ] Build `live-data-panel.tsx`.
- [ ] Implement Alerts and Stations tabs.
- [ ] Render compact, scannable rows with severity/value/timestamp metadata.
- [ ] Support click-to-open detail modal.
- [ ] Build `detail-modal.tsx`.
- [ ] Render alert and station detail variants.
- [ ] Include normalized metadata and source links where available.
- [ ] Build `dashboard-states.tsx`.
- [ ] Centralize loading skeletons, empty states, and panel error states.

## Phase 9: Responsive And Visual Polish

- [ ] Match the mockup structure:
  - header
  - sidebar
  - metric row
  - search row
  - split chart/table grid
  - detail modal
- [ ] Apply Obsidian & Amber colors consistently.
- [ ] Use Hanken Grotesk for UI and JetBrains Mono for labels/timestamps.
- [ ] Keep layout dense but readable.
- [ ] On mobile:
  - convert sidebar into top preset controls
  - wrap metrics
  - stack chart and table
  - make modal near full-screen
- [ ] Confirm text does not overflow buttons, cards, tabs, or table cells.
- [ ] Avoid broad decorative gradients and one-note color treatment.

## Phase 10: Tests

- [ ] Add Vitest config only if needed by the installed setup.
- [ ] Add tests for flood alert normalization.
- [ ] Add tests for latest station reading normalization.
- [ ] Add tests for dashboard metric aggregation.
- [ ] Add tests for filters and sorting.
- [ ] Add tests for chart bucket creation.
- [ ] Add tests for supported search-param validation.
- [ ] Add tests for deterministic fallback parser.
- [ ] Keep tests focused on pure helper behavior.

## Phase 11: README

- [ ] Replace starter README content with dashboard-specific documentation.
- [ ] Document setup commands.
- [ ] Document `OPENAI_API_KEY`.
- [ ] Explain that AI search falls back when the key is absent.
- [ ] Describe architecture decisions and folder boundaries.
- [ ] Explain direct Environment Agency service calls.
- [ ] Summarize how AI accelerated the build.
- [ ] Add "what I would improve with 40 hours" section.

## Phase 12: Verification

- [ ] Run lint.
- [ ] Run tests.
- [ ] Run build if dependency installation and environment allow it.
- [ ] Start the dev server.
- [ ] Manually verify:
  - initial loading
  - real flood alert data
  - real latest readings data
  - sidebar presets update URL params
  - search updates URL params
  - AI unavailable fallback path
  - tab switching
  - manual refresh
  - polling/refetch indicators
  - panel-level API failure states where practical
  - detail modal for alert rows
  - detail modal for station rows
  - desktop layout
  - mobile layout
- [ ] Fix any lint, test, build, or obvious visual issues before delivery.

## Suggested Commit Slices

- [ ] Setup dependencies, providers, fonts, and theme.
- [ ] Add flood-monitoring service layer and tests.
- [ ] Add AI search intent route and fallback parser tests.
- [ ] Add dashboard shell and route-thin `app/page.tsx`.
- [ ] Add dashboard panels, chart, table, modal, and states.
- [ ] Add README and final verification fixes.
