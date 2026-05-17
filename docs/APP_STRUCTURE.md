# Frontend App Structure

Use this as a reusable structure guide for production Next.js apps.

Core rule: routes compose, features orchestrate, components render, services
fetch and transform, utilities stay generic.

## Layout

```text
app/
  api/<domain>/<action>/route.ts
  globals.css
  layout.tsx
  page.tsx
  providers.tsx

components/
  app-shell/
  <feature-area>/
  ui/

services/
  api.ts
  <domain>/
    <domain>.api.ts
    <domain>.helpers.ts
    <domain>.queries.ts
    <domain>.types.ts

lib/
  utils.ts

public/
```

Add folders only when ownership is clear. Do not create structure for future
needs before the project has real pressure for it.

## Responsibilities

### `app/`

- Owns framework entrypoints, layouts, route handlers, providers, metadata, and
  route-level composition.
- Parses route/search params and may prefetch server data.
- Keeps business logic out of pages and route handlers.
- Route handlers validate input, call services/helpers, and return responses.

### `components/`

- Owns UI, interaction, and feature composition.
- Groups product UI by feature area, not by technical type.
- Keeps shared primitives in `components/ui`.
- Keeps product-specific components inside their feature folder.
- Receives normalized data, not raw API responses.

### `services/`

- Owns external data access, query options, hooks, normalization, and domain
  types.
- Uses one folder per domain.
- Keeps raw API contracts separate from UI-facing models.
- Exposes low-level endpoint fetchers from `<domain>.api.ts`.
- Keeps pure transforms in `<domain>.helpers.ts`.
- Keeps React Query options, hooks, cache keys, polling, and stale times in
  `<domain>.queries.ts`.
- Keeps shared request behavior in `services/api.ts`.

### `lib/`

- Owns generic, framework-light utilities used across domains.
- Must not become a home for feature-specific business logic.

### `public/`

- Owns static assets served directly.
- Must not contain application code.

## Server And Client Components

- Default to server components at route boundaries.
- Use client components only for state, effects, event handlers, browser APIs,
  URL navigation hooks, React Query hooks, or interactive widgets.
- Keep `"use client"` as low in the tree as practical without harming
  readability.
- Pass the smallest useful props across the server/client boundary.
- Do not serialize large raw objects into client components.

## Feature Rules

- A feature folder should represent one product area.
- The main feature component composes focused subcomponents.
- Feature components may own local UI state and selection state.
- Shared UI primitives must be product-neutral.
- Avoid generic feature folders like `tables`, `cards`, `forms`, or `sections`
  unless they are truly shared primitives.

## Service Rules

- Normalize data before it reaches components.
- Keep endpoint fetchers thin and predictable.
- Put query keys beside the domain that owns them.
- Export query options separately from hooks so routes can prefetch.
- Keep transformation helpers pure where possible.
- Run independent async work in parallel.
- In route handlers, start promises early and await late when practical.
- Check cheap synchronous conditions before remote work.

## Performance Rules

- Avoid async waterfalls; independent requests should run concurrently.
- Use Suspense for slow isolated sections when it improves perceived loading.
- Avoid Suspense when data controls layout, SEO-critical content, or would cause
  visible layout shift.
- Dynamically import heavy non-critical UI.
- Prefer package import optimization for large package entrypoints.
- Avoid broad barrel imports in client and performance-sensitive code.
- Derive simple values during render instead of copying them into state.
- Avoid defining components inside components.
- Use primitive hook dependencies where possible.
- Memoize only expensive work or components with stable props.
- Use functional state updates when deriving from previous state.
- Use transitions or deferred values for non-urgent expensive updates.
- Keep transient high-frequency values in refs instead of state.

## State Rules

- Use local state for selected rows, open panels, active tabs, form drafts, and
  local UI toggles.
- Use URL state for filters, search queries, pagination, sort order, and
  shareable view state.
- Use React Query for server data, loading/error state, cache invalidation,
  polling, and background refresh.
- Use global context sparingly for cross-cutting concerns such as auth, theme,
  feature flags, or provider wiring.

## UI States

Every data-driven feature should intentionally handle:

- loading
- empty
- error
- stale/refetching

The owning feature should decide async presentation and pass simple props down.

## Styling Rules

- Use the project design system first.
- Keep `components/ui` small, accessible, and reusable.
- Keep layout decisions in feature components.
- Use semantic HTML before custom patterns.
- Make tables, forms, cards, and charts responsive at the component level.
- Avoid hard-coded colors outside shared tokens or established utilities.
- Promote components to `components/ui` only after they are product-neutral.

## Testing Rules

Prioritize tests for:

- helper parsing, filtering, normalization, and aggregation
- service request construction and response mapping
- important component interactions and conditional states
- route validation and fallback behavior
- critical end-to-end user flows

Pure helpers and service transforms usually carry high value and low test cost.

## Import Rules

- Prefer direct imports from source files.
- Use barrel files only when the import surface is small and the benefit is
  clear.
- Avoid barrels for large third-party packages, icon libraries, broad shared
  folders, hot client paths, and cross-feature convenience imports.
- Do not import private implementation files from another feature.
- If imports become noisy, create a small explicit public module instead of a
  broad re-export.

## Naming Rules

- Use names that reveal ownership and intent.
- Prefer product language over generic labels.
- Avoid vague names like `Data`, `Main`, `Section`, `Wrapper`, `Manager`,
  `Helper`, and `Common`.
- Generic names are acceptable only inside generic primitives.

## Adding A Feature

1. Create a feature folder under `components/`.
2. Add a main feature component and focused subcomponents.
3. Add or extend a domain folder under `services/` when data is needed.
4. Define raw and normalized types.
5. Add endpoint fetchers, pure transforms, query options, and hooks.
6. Compose the feature from the nearest route or screen.
7. Handle loading, empty, error, and refetching states.
8. Run independent requests in parallel.
9. Dynamically import heavy non-critical UI.
10. Add focused tests where risk justifies it.

## Anti-Patterns

- fetching directly inside presentational components
- passing raw API responses into UI components
- putting feature logic in `lib/utils.ts`
- creating global state for server data React Query owns
- putting product-specific components in `components/ui`
- relying on broad barrel imports
- importing private files across feature boundaries
- mixing server-only code into client components
- duplicating query keys across files
- making route handlers own business rules
- awaiting independent requests sequentially
- serializing large server objects into client components
- shipping heavy widgets in the initial bundle unnecessarily
- adding architecture folders before they are needed
