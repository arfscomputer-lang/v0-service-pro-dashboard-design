# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ServicePro — a field-service management dashboard (Next.js App Router, TypeScript, Spanish-language UI/routes) covering work orders (OTs), technicians, customers, inventory, assets/maintenance plans, and budgets (presupuestos). Originally bootstrapped and iterated via [v0.app](https://v0.app); commits from that flow may still land directly on `main`.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml` is the lockfile in use, even though `package.json` scripts are npm-style).

```bash
pnpm install       # install dependencies
pnpm dev           # start dev server (Next.js + Turbopack) at http://localhost:3000
pnpm build         # production build
pnpm start         # run production build
pnpm lint          # next lint
```

There is no test suite configured in this repo.

`next.config.mjs` sets `typescript.ignoreBuildErrors: true` — `pnpm build` will succeed even with type errors, so don't rely on the build to catch type issues; check with the editor/tsc directly if needed.

## Architecture

### Two separate persistence mechanisms

- **Auth session token**: issued server-side (bcrypt password check + random token in a `sessions` table), but the *client-side user object* is cached in `sessionStorage` (`sp_auth_token`) via [lib/context/auth-context.tsx](lib/context/auth-context.tsx) and [lib/auth-utils.ts](lib/auth-utils.ts). There is no cookie-based session — the client always attaches the token itself.
- **Application data**: Neon serverless Postgres, accessed only through [lib/db.ts](lib/db.ts) (`query`/`getOne`/`getMany` helpers wrapping `@neondatabase/serverless`). All API routes and data access go through this file — it has grown into the single source of truth for SQL across customers, technicians, work orders, assets, maintenance occurrences, budgets, notifications, sessions, and roles/permissions.

### Auth flow

- `POST /api/auth/login` validates credentials against the `users` table, creates a row in `sessions`, and returns a bearer token.
- The client stores the token in `sessionStorage` and sends it as `Authorization: Bearer <token>` on every request via [lib/fetch-with-auth.ts](lib/fetch-with-auth.ts) (`fetchWithAuth` / `fetchWithAuthJson`) — always use these wrappers instead of raw `fetch` for authenticated API calls.
- [middleware.ts](middleware.ts) enforces auth on `/api/:path*` by validating the bearer token against `getSessionByToken`, **except** for routes listed in `PUBLIC_ROUTES` (currently most read endpoints — customers, work-orders, technicians, assets, maintenance, budgets, etc. are public; this list is intentionally permissive today, verify before assuming a route is protected).
- Roles are `admin | supervisor | tecnico | cliente`. Per-role route access and home routes are defined in [lib/context/auth-context.tsx](lib/context/auth-context.tsx) (`ROLE_ROUTES`, `canAccess`, `getHomeRoute`) — client-side gating, not enforced by middleware.
- A `cliente` user links to a `customer_id`; a `tecnico` user links to a `technicianId` — both resolved at login time and carried on the `AuthUser` object.

### Data-access conventions in lib/db.ts

- Raw SQL with `$1, $2...` placeholders via `neon()` — no ORM.
- Row shapes from Postgres (snake_case) are normalized to camelCase frontend shapes by dedicated functions (e.g. `normalizeTechnician`, `normalizeWorkOrder`) — when adding fields, update both the SQL and the normalizer.
- Dynamic `UPDATE` builders (`updateInventoryItem`, `updateTechnician`, `updateWorkOrder`, `updateAsset`, `updateBudget`) use an `allowedFields` map and only set columns present in the input — follow this pattern rather than string-interpolating arbitrary fields.
- Several functions run `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` lazily on read/write instead of a proper migration — this is the established (if unusual) pattern for schema evolution here; SQL migrations also live as one-off files in `scripts/*.sql` (not run automatically, no migration runner).
- UUID validation (`isValidUUID`) guards optional FK fields (e.g. `technician_id`) before insert — invalid IDs are silently dropped rather than erroring.

### Maintenance / assets domain

Assets can carry a recurring maintenance plan (`has_maintenance_plan`, `recurrence_type`, `interval_months`, etc.). `maintenance_occurrences` is the bridge table linking an asset's generated schedule to actual `work_orders`:
- `upsertMaintenanceOccurrences` (re)generates future pending occurrences from an asset's plan (via [lib/maintenance.ts](lib/maintenance.ts) `generateOccurrenceDates`) and wipes old pending ones.
- `autoGenerateWorkOrdersFromOccurrences` turns occurrences due within N days into real `preventivo` work orders (order IDs formatted `PV-<assetcode>-<yyyymm>`), idempotently (checks for an existing `order_id` first).
- `completeMaintenanceExecution` is the single entry point for "tech finished a preventive visit": it creates the completed work order, advances the asset's `last/next_maintenance_date`, links the oldest pending occurrence, and regenerates future occurrences — when touching maintenance completion, go through this function rather than composing the steps manually elsewhere.

### Budgets (presupuestos) module

`budgets`, `budget_kits` (reusable line-item templates per `rubro`/industry), and `budget_comments` are a self-contained module under `/presupuestos` and `/api/budgets`, `/api/budget-kits`. Budgets store `sections`/`company_data`/`conditions` as JSON blobs rather than normalized tables — read/write them as opaque JSON, don't assume relational structure.

### Frontend structure

- Route groups under `app/` are role-oriented: `app/tecnico/*` (technician portal), `app/portal/*` (client portal), everything else is the admin/supervisor dashboard.
- Client-side global state for core entities (customers, inventory, technicians, work orders) lives in React Contexts under [lib/context/](lib/context/) — check there before adding a new fetch-and-store pattern for an entity that already has one.
- UI components are shadcn/ui (`components/ui/`, configured in [components.json](components.json), Tailwind with CSS variables, `neutral` base color, `lucide` icons). Path alias `@/*` maps to repo root ([tsconfig.json](tsconfig.json)).

### Logging convention

Server-side logs/errors are consistently prefixed `[v0]` (e.g. `console.error('[v0] Database query error:', error)`) — keep this prefix for consistency when adding logging in API routes / lib/db.ts.
