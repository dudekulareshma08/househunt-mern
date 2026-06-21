# HouseHunt

A full-stack house rent management system with role-based access for admins, property owners, and renters.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/househunt run dev` — run the React frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Seed Data

Run seed to create demo accounts and 6 sample properties:
```
scripts/node_modules/.bin/tsx artifacts/api-server/src/seed.ts
```

Demo accounts:
- admin@househunt.com / admin123
- owner@househunt.com / owner123
- renter@househunt.com / renter123

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS v4 + shadcn/ui (`artifacts/househunt`)
- API: Express 5 (`artifacts/api-server`)
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Auth: JWT via `SESSION_SECRET`, stored in `localStorage` as `hh_token`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec`)

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `lib/db/src/schema/` — Drizzle schema (users, properties, bookings)
- `lib/api-zod/src/generated/api.ts` — generated Zod validators
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `artifacts/api-server/src/routes/` — auth, properties, bookings, admin routes
- `artifacts/househunt/src/pages/` — all frontend pages by role
- `artifacts/api-server/src/seed.ts` — database seed script

## Architecture decisions

- JWT stored in localStorage (Bearer token, key `hh_token`). Custom fetch reads it automatically via `setAuthTokenGetter` in custom-fetch.ts.
- Owner accounts require admin approval (`isApproved=false` by default). Admin and renter accounts are auto-approved.
- `property.rent` stored as Postgres `numeric` string; parsed with `parseFloat()` before returning to clients.
- OpenAPI body schemas use entity-named components (not operation-named) to avoid TypeScript TS2308 name collisions in generated code.
- All routes are mounted under `/api` prefix by the shared reverse proxy.

## Product

- **Renters**: Browse/search/filter properties, view details, request bookings, track booking status
- **Owners**: List and manage properties, review and approve/decline booking requests, view dashboard stats
- **Admins**: Full platform oversight — approve owner accounts, view all users/properties/bookings

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT run `pnpm dev` at workspace root — use workflows or `pnpm --filter` commands
- After changing Orval config or OpenAPI spec, run `pnpm --filter @workspace/api-spec run codegen` before building
- Properties endpoint in api-server uses raw SQL `ANY()` for bulk queries since Drizzle inList doesn't handle dynamic arrays well in this setup

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
