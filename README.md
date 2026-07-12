# Hackathon Boilerplate — Odoo Hackathon 2026

Express + TypeScript + Prisma + PostgreSQL backend, React + TypeScript + Vite + Tailwind frontend.
Scaffolding only — no feature logic — so the team can start building the moment the problem
statement drops.

## Structure

```
.
├── backend/            Express API (TS, Prisma, Postgres)
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── config/       (prisma client)
│       ├── controllers/  (route handlers)
│       ├── middleware/   (error handling, validation)
│       ├── routes/
│       ├── utils/
│       │   └── validators/  (zod schemas)
│       ├── app.ts
│       └── server.ts
├── frontend/            React app (TS, Vite, Tailwind)
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── routes/
│       ├── services/     (axios API client)
│       └── types/
└── docker-compose.yml   Local Postgres, one command
```

## First-time setup (tonight)

1. **Start Postgres locally** (needs Docker):
   ```bash
   docker compose up -d
   ```
   Or install Postgres natively and create a DB named `hackathon_db`.

2. **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env       # adjust DATABASE_URL if not using docker-compose defaults
   npx prisma migrate dev --name init
   npm run dev                 # http://localhost:5000
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev                 # http://localhost:5173
   ```

Vite is already proxying `/api` → `http://localhost:5000`, so frontend calls like
`api.get("/items")` just work without CORS pain.

## Tomorrow, once you know the problem statement

1. Edit `backend/prisma/schema.prisma` — replace the example `User`/`Item`/`Tag` models with your
   real entities. Keep the patterns: UUID ids, `createdAt`/`updatedAt`, indexes on foreign keys,
   at least one real relation.
2. Run `npx prisma migrate dev --name your_feature` to apply changes.
3. Copy the `item.controller.ts` / `item.routes.ts` / `item.validator.ts` pattern for each new
   resource — controller does the DB work, validator defines the zod schema, routes wire it up.
4. On the frontend, copy `item.service.ts` + `Items.tsx` as the template for new pages: a
   `useFetch` call, loading/error/empty states, then the real UI.
5. Add new routes in `AppRoutes.tsx` and nav links in `Layout.tsx`.

## Conventions already baked in

- **Validation**: Zod schemas in `utils/validators`, applied via `validate()` middleware — bad
  requests return `422` with field-level messages, not a stack trace.
- **Error handling**: throw `AppError("message", statusCode)` anywhere in a controller; the global
  `errorHandler` catches it and Prisma/unexpected errors, returning a clean JSON error instead of
  crashing.
- **Async routes**: wrap controller functions in `asyncHandler()` so you never need try/catch
  boilerplate per route.
- **API responses**: `{ success: boolean, data?, message? }` — keep this consistent across all
  endpoints.
- **Git**: `main` should stay deployable. Create feature branches (`feat/xyz`), open small PRs,
  commit often with real messages — this is graded.

## If the AI part needs its own service

Keep it as a separate small FastAPI (or Node) service, and either:
- Have the Express backend proxy to it (`AI_SERVICE_URL` is already in `.env.example`), or
- Call it directly from the frontend on its own port during the hackathon, and proxy later if
  time allows.

Don't force AI logic into the same Express process if it's Python-based — separate services are
easier to demo and cleaner architecturally (judges like "modularity").
