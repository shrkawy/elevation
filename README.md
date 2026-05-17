# Flood Monitoring Dashboard

Production-style technical assessment dashboard for Environment Agency flood
alerts and latest river readings.

## Stack

- Next.js App Router with React Compiler
- TypeScript strict mode
- Tailwind CSS
- TanStack Query
- Vercel AI SDK with Google Gemini
- Recharts
- Vitest

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Optional AI search:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

If `GOOGLE_GENERATIVE_AI_API_KEY` is missing, the natural-language search input falls back to
a deterministic parser. The dashboard remains usable without AI credentials.

## Commands

```bash
pnpm lint
pnpm test
pnpm build
```

## Architecture

The app follows the local structure rule: routes compose, features orchestrate,
components render, services fetch and transform, utilities stay generic.

- `app/page.tsx` is intentionally thin and only renders `FloodDashboard`.
- `components/flood-dashboard/` owns dashboard layout, local UI state, and
  presentation.
- `services/flood-monitoring/` owns Environment Agency API access, raw response
  types, normalized app models, transforms, filters, sorting, chart buckets,
  query keys, and React Query hooks.
- `app/api/search-intent/route.ts` is the only API route. It keeps Google Gemini usage
  server-side and returns only supported dashboard search params.

Flood alerts and latest readings are called directly from the service layer
against the public Environment Agency endpoints:

- `https://environment.data.gov.uk/flood-monitoring/id/floods`
- `https://environment.data.gov.uk/flood-monitoring/data/readings?latest`

Raw API payloads are normalized and capped before they reach presentation
components.

## AI Search

The command input accepts plain text or natural-language prompts such as:

```txt
show severe alerts in yorkshire
highest station readings near thames
```

The AI route maps user text to supported URL params only:

- `q`
- `severity`
- `region`
- `type`
- `sort`

It does not generate flood facts, summaries, or advice.

## React Compiler

The project runs the React Compiler (`reactCompiler: true` in `next.config.ts`),
which automatically inserts memoization at the component and value level.
Manual `useMemo` and `useCallback` calls are therefore unnecessary and are
not used throughout the codebase.

## AI Workflow

AI was used to accelerate planning, architecture decomposition, API modeling,
UI component composition, and test coverage. The implementation is constrained
by explicit service boundaries, normalized data models, deterministic fallback
logic, and focused tests so speed does not depend on vague generated code.

## 40-Hour Improvements

- Add historical station trend calls per selected station.
- Add virtualization for very large station tables.
- Add component tests for URL filters, tabs, and modal behavior.
- Move public EA fetches behind thin Next route handlers with conservative
  30-60 second caching, stale/degraded freshness indicators, and server-side
  latency/error logging.
- Add map-based regional context and flood-area polygons.
- Add deployment telemetry and synthetic uptime checks.
