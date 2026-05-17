# Flood Monitoring Dashboard Design

Date: 2026-05-17

## Goal

Build a production-style Next.js flood monitoring dashboard for the technical
assessment. The app should prioritize clear architecture, strict TypeScript,
real Environment Agency data, resilient UI states, and a polished dark analytics
interface over broad feature scope.

The target is a complete v1 submission: app, focused tests, and README. Live
deployment is out of scope for this plan.

## Constraints And Sources

- Framework: Next.js App Router in the existing project.
- Styling: Tailwind CSS and existing shadcn/Radix setup.
- Language: TypeScript strict mode.
- Data APIs:
  - `https://environment.data.gov.uk/flood-monitoring/id/floods`
  - `https://environment.data.gov.uk/flood-monitoring/data/readings?latest`
- AI: Vercel AI SDK with OpenAI through `@ai-sdk/openai`.
- Design system: `.agents/DESIGN.md`, "Obsidian & Amber".
- Structure guide: `.agents/APP_STRUCTURE.md`.
- Local Next docs note: `app/page.tsx` remains a page default export, and
  interactive/query/provider behavior belongs in Client Components.

## Approved Product Decisions

- Optimize for a production-style foundation, not a quick demo.
- Use direct Environment Agency calls from `services/`, not
  `app/api/floods` or `app/api/readings` route handlers.
- Keep `app/page.tsx` route-thin. It only renders an exported dashboard
  component from `components/`.
- Use TanStack Query for remote data lifecycle, polling, retries, stale state,
  and manual refresh.
- Use URL params for shareable filters and search:
  `q`, `severity`, `region`, `type`, `sort`.
- Use local component state for transient UI such as active tab and detail
  modal.
- Implement real AI search-param extraction with Vercel AI SDK and OpenAI.
- AI returns only supported dashboard search params based on the user's row
  text. It does not invent, summarize, or answer with flood facts.
- Provide a deterministic fallback parser when AI is unavailable, slow, or
  returns invalid output.
- Implement sidebar items as filter presets over the same dashboard route.
- Use a latest readings distribution chart, not a fake historical trend.
- Use a tabbed live table for Alerts and Stations.
- Use a modal for alert/station details.
- Use panel-level error states and preserve stale cached data where available.
- Add focused unit tests for helpers and validation.
- Switch typography to Hanken Grotesk and JetBrains Mono via `next/font/google`.
- Match the mockup structure while elevating the final UI through the design
  system.

## Architecture

The application follows the local structure rule: routes compose, features
orchestrate, components render, services fetch and transform, and utilities stay
generic.

Planned file ownership:

```text
app/
  api/search-intent/route.ts
  globals.css
  layout.tsx
  page.tsx
  providers.tsx

components/
  flood-dashboard/
    flood-dashboard.tsx
    dashboard-header.tsx
    dashboard-sidebar.tsx
    dashboard-metrics.tsx
    dashboard-search-command.tsx
    readings-chart-panel.tsx
    live-data-panel.tsx
    detail-modal.tsx
    dashboard-states.tsx
  ui/

services/
  api.ts
  flood-monitoring/
    flood-monitoring.api.ts
    flood-monitoring.helpers.ts
    flood-monitoring.queries.ts
    flood-monitoring.types.ts
```

`app/page.tsx` should stay minimal:

```tsx
import { FloodDashboard } from "@/components/flood-dashboard/flood-dashboard";

export default function Home() {
  return <FloodDashboard />;
}
```

`components/flood-dashboard/` owns feature composition, dashboard layout, local
UI state, and presentation. It receives normalized models from service/query
hooks and never renders raw Environment Agency response objects.

`services/flood-monitoring/` owns the Environment Agency domain. It exposes raw
API contracts, normalized app models, endpoint fetchers, transforms, filters,
sorts, query keys, query options, and React Query hooks.

`app/api/search-intent/route.ts` is the only route handler in the design because
the OpenAI key must stay server-side.

## Data Flow

1. Dashboard client components read supported search params from the URL.
2. TanStack Query hooks in `services/flood-monitoring` call public Environment
   Agency endpoints directly.
3. Fetchers use shared request behavior from `services/api.ts`, including
   predictable errors and timeouts.
4. Helpers normalize and thin the API payload before it reaches components.
5. Query hooks poll every 60 seconds, retry transient failures, keep previous
   data where useful, and expose stale/refetching state.
6. Components render metrics, chart buckets, filtered tables, loading
   skeletons, empty states, panel-level errors, and modal details.

## AI Search Flow

The search command accepts raw user text, including natural-language prompts
such as "show severe alerts in Yorkshire".

1. Client submits the raw text to `app/api/search-intent/route.ts`.
2. The route uses Vercel AI SDK and OpenAI to return a strict object containing
   only supported params:
   - `q`
   - `severity`
   - `region`
   - `type`
   - `sort`
3. Zod validates the returned params.
4. If the AI call fails, times out, the key is missing, or the output is
   invalid, the deterministic fallback parser produces the best supported
   params from the same input text.
5. The client writes the final params into the URL.
6. Existing query/filter logic updates the dashboard.

The AI route must not return prose explanations or factual flood summaries. It
is an intent parser only.

## Feature UI

The UI keeps the mockup structure and applies the Obsidian & Amber design
system: dark surfaces, dense information, sharp borders, amber action/critical
accents, Hanken Grotesk for interface text, and JetBrains Mono for labels,
timestamps, and status metadata.

Desktop layout:

- Application header with title, live status, latest update timestamp, manual
  refresh, and compact health/error indicators.
- Sidebar presets for All Regions, Severe Alerts, and Monitoring Stations.
  These update URL params and show lightweight loading/refetch feedback.
- Metric card row for active warnings, severe/critical alerts, latest station
  reading count, and average river level.
- AI/search row with one command input for plain search or natural language.
- Main split grid:
  - Left: latest readings distribution chart.
  - Right: tabbed live table for Alerts and Stations.
- Detail modal for selected alert or station.

Responsive layout:

- Sidebar becomes a top preset control.
- Metric cards wrap into two columns, then one column on narrow screens.
- Chart and table stack vertically.
- Detail modal becomes near full-screen on mobile.

## Data Models And Helpers

Raw types model only the fields used from the Environment Agency API. Normalized
types should be app-oriented:

- `FloodAlert`
- `StationReading`
- `DashboardMetrics`
- `ReadingChartBucket`
- `DashboardSearchParams`

Pure helpers should cover:

- flood alert normalization
- station reading normalization
- dashboard metric aggregation
- severity/region/type filtering
- free-text search across area, river, and station fields
- sorting by latest, severity, or highest level
- latest readings chart bucket creation
- supported search-param validation
- deterministic fallback parsing

## Loading, Empty, Error, And Refresh States

Each data-driven panel handles:

- initial loading skeletons
- empty filtered result states
- panel-level error states
- stale cached data after refetch failures
- subtle refetch indicators during polling or manual refresh

The whole dashboard should not fail just because one data source fails. If flood
alerts fail but readings load, the readings chart and station table remain
usable.

## Testing

Testing is focused on high-value pure logic:

- Environment Agency response normalization
- dashboard metric aggregation
- filters and sorting
- chart bucket creation
- supported search-param validation
- fallback natural-language parser

Lint must pass. Component or end-to-end tests are not part of this v1 plan
unless they become cheap after the implementation is complete.

## README Updates

The README should include:

- setup and development commands
- required environment variable: `OPENAI_API_KEY`
- note that AI search falls back when the key is absent
- architecture decisions and folder boundaries
- how AI accelerated the build
- what would improve with 40 hours instead of 4

## Implementation Plan Outline

1. Install dependencies: `@tanstack/react-query`, `ai`, `@ai-sdk/openai`,
   `zod`, `recharts`, and `vitest`.
2. Add providers, metadata, fonts, theme tokens, and scripts.
3. Build service-layer fetchers, types, transforms, filters, parser, and query
   hooks.
4. Add the AI search-intent route with validation and fallback behavior.
5. Create the exported `FloodDashboard` feature root and keep `app/page.tsx`
   route-thin.
6. Build dashboard header, sidebar presets, metric cards, search command, chart,
   tabbed table, modal, and async states.
7. Add focused Vitest tests.
8. Update README.

## Acceptance Criteria

- `app/page.tsx` only renders the exported dashboard component.
- Flood alerts and latest readings use direct service-layer API calls.
- No raw Environment Agency response objects reach presentation components.
- AI search returns only supported params and has a deterministic fallback path.
- Search and sidebar filters update URL params.
- Dashboard polls every 60 seconds and supports manual refresh.
- Panel-level loading, empty, error, and refetching states are implemented.
- The UI follows the Obsidian & Amber system and the mockup structure.
- The latest readings chart honestly represents latest reading distribution.
- Clicking an alert or station opens a detail modal.
- Focused unit tests cover the helper logic.
- README documents architecture, AI usage, setup, and future improvements.

## Risks

- The Environment Agency API can be slow or return large payloads. Mitigation:
  normalize, cap, and derive summary data in service helpers before render.
- OpenAI credentials may be missing during review. Mitigation: fallback parser
  keeps search usable without AI.
- Direct client calls expose the browser to the public API. This is acceptable
  for this assessment because the API is public/free, and keeping the service
  boundary strong preserves maintainability.
- Next 16 behavior may differ from older examples. Mitigation: consult local
  `node_modules/next/dist/docs/` before framework-specific implementation.
