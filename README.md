# Germany Job Discovery Dashboard

A job aggregation dashboard that collects software engineering jobs in
Germany on a schedule, deduplicates them, and presents them in a dark-mode
dashboard for manual review. It does **not** apply to jobs or automate
applications — collection and presentation only.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS ·
shadcn/ui · Supabase (Postgres + Auth) · Vercel Cron · Resend

## Project status

Build is proceeding in phases; this section reflects what's actually wired
up right now, not the eventual full scope.

- [x] **Phase 1 — Scaffold + DB migrations.** Next.js/Tailwind/shadcn
      scaffold, domain types, `JobSource` adapter interface, Supabase
      migrations (schema + RLS), env template, local-dev seed script.
- [x] **Phase 2 — Auth.** Supabase email/password auth, `middleware.ts`
      guarding every route except `/login` and `/signup`, Server Actions for
      login/signup/logout, protected dashboard layout shell with a topbar
      (email + sign out). The dashboard home page is a placeholder until
      Phase 4 builds the real stat cards/table.
- [x] **Phase 3 — Sync engine + adapters.** Orchestrator (filter → normalize
      → dedupe/upsert → sync_logs), DB-configurable keyword filtering, and
      four working adapters: **Arbeitnow** and **Bundesagentur für Arbeit**
      work with zero configuration; **Adzuna** and **Jooble** activate once
      you add their API keys. LinkedIn/Indeed/StepStone/Xing ship as inert
      stubs (ToS blocks scraping). `/api/cron/sync` (GET/POST, Bearer-secret
      protected) and `/api/admin/sync` (POST, session-protected) both call
      the same orchestrator. Verified live against the real Supabase project
      and real source APIs — see below.
- [x] **Phase 4 — Dashboard, job table, filters.** Real stat cards (New
      Jobs Today, Jobs This Week, Saved Jobs, Applied Jobs, Favorite
      Companies — the last one is derived from saved jobs' companies, since
      there's no dedicated favorites table). Server-paginated, sortable job
      table (Company/Title/Location/Remote/Source/Posted/Salary/Visa/
      Actions) plus a filter bar (search, location, work mode, salary range,
      visa sponsorship, experience level, source, date posted) — all state
      lives in the URL, no client JS required for filtering, sorting, or
      pagination. Responsive sidebar nav (desktop) / sheet drawer (mobile).
- [x] **Phase 5 — Job details, save/apply actions.** Job details page
      (`/jobs/[id]`) with full description (sanitized with DOMPurify — some
      sources return real HTML), skills, salary, and a prominent "Open
      Original Job" button. Save/Archive/Hide actions, an applied-status
      pipeline (Waiting/Interview/Rejected/Offer), and separate notes for
      the saved vs. applied contexts — all as plain forms calling Server
      Actions, no client JS. New `/saved` (tabbed by status) and `/applied`
      pages. Verified live with two separate accounts that RLS actually
      isolates saved/applied data per user, not just that the UI hides it.
- [ ] Phase 6 — Company pages
- [ ] Phase 6 — Company pages
- [ ] Phase 7 — Admin page
- [ ] Phase 8 — Email digest

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values you already have:

```bash
cp .env.example .env.local
```

| Variable | Where to get it | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API (keep secret — server-only) | Yes |
| `CRON_SECRET` | Generate yourself: `openssl rand -hex 32` | Yes — required for `/api/cron/sync` to authorize any request |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | [Adzuna Developer Portal](https://developer.adzuna.com/) | No — adapter self-disables if unset |
| `JOOBLE_API_KEY` | [Jooble API](https://jooble.org/api/about) | No — adapter self-disables if unset |
| `BUNDESAGENTUR_API_KEY` | Not needed — defaults to a public, openly documented key | No — works out of the box |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` | [Resend](https://resend.com/) | No — digest send is skipped and logged if unset |

Every job-source and email key is optional at runtime: an adapter with no
key configured reports itself as `disabled` and is skipped by the sync
orchestrator rather than crashing the run. Add real keys any time — no code
changes required.

### 3. Run the database migrations

Migrations live as plain SQL files in `supabase/migrations/`, applied in
filename order. Against an existing hosted Supabase project, either:

**Option A — Supabase CLI** (recommended once you have it installed):

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

**Option B — SQL Editor** (no CLI required): open your project's Supabase
Dashboard → SQL Editor, paste the contents of `0001_init.sql`, run it, then
do the same for `0002_rls_policies.sql`.

After migrating, regenerate the TypeScript types to double-check
`types/database.ts` matches the live schema:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > /tmp/generated.ts
```

(`types/database.ts` is hand-maintained rather than committing the
generated file directly, so diff before copying anything over.)

### 4. Seed local dev data (optional)

Inserts a couple of clearly-fake `[SEED]`-prefixed companies/jobs so the UI
has something to render before the sync engine is live. Never run this
against a production project.

```bash
npm run seed
```

### 5. Run the dev server

```bash
npm run dev
```

## Adding a new job source adapter

The adapter contract (`lib/sources/types.ts`) is the fixed point every
source and the sync orchestrator depend on — adding a source **never**
requires touching the orchestrator or any dashboard/UI code. To add one:

1. Create `lib/sources/<name>.ts`.
2. Build a `JobSource` via the `defineJobSource(...)` helper:

   ```typescript
   import { defineJobSource, type RawJob } from "./types";

   export const myNewSource = defineJobSource({
     name: "my-new-source",
     displayName: "My New Source",
     baseUrl: "https://api.example.com",
     isEnabled: () => Boolean(process.env.MY_NEW_SOURCE_API_KEY),
     fetch: async (): Promise<RawJob[]> => {
       // 1. call the source's API
       // 2. validate the response with a Zod schema (see lib/validation/schemas.ts)
       // 3. map each result to a RawJob
       return [];
     },
   });
   ```

3. Register it in `lib/sources/registry.ts` (one line).
4. Add any required env var(s) to `.env.example`.

That's the whole integration surface. `defineJobSource` already handles the
disabled-when-unconfigured case, a fetch timeout, and catching/logging
thrown errors so one broken source can't take down a sync run — you only
need to write the fetch-and-map logic.

Sources that are blocked by ToS from scraping (LinkedIn, Indeed, StepStone,
Xing) ship as stubs under `lib/sources/stubs/` implementing the same
interface with `enabled: false`, ready to swap in a real implementation the
moment an official API or licensed feed is available.

## Sync engine

The orchestrator (`lib/sync/orchestrator.ts`) runs every enabled source in
`lib/sources/registry.ts` sequentially: fetch → filter (keyword allow-list +
internship exclusion + country, from the `filter_config` table) → normalize
→ dedupe/upsert on `jobs.fingerprint` → write one `sync_logs` row per source.
One source throwing never stops the others.

Trigger it manually during development:

```bash
curl "http://localhost:3000/api/cron/sync" -H "Authorization: Bearer $CRON_SECRET"
```

Check what happened via the `sync_logs` and `job_sources` tables (or once
Phase 7 lands, the admin page).

## Vercel Cron

`vercel.json` schedules `/api/cron/sync` once daily at 06:00 UTC
(`0 6 * * *`). The original design called for every 6 hours, but Vercel's
**Hobby plan only allows one cron invocation per day** — `0 */6 * * *` will
fail to deploy on Hobby. If you upgrade to Pro, change the schedule back to
`0 */6 * * *` for the original cadence. Either way, you can always trigger
an extra sync anytime via `/api/admin/sync` (once the admin page lands in
Phase 7) or by calling `/api/cron/sync` manually with the bearer header.

Once `CRON_SECRET` is set in your Vercel project's environment variables,
Vercel automatically sends it as `Authorization: Bearer $CRON_SECRET` on
every invocation — no extra wiring needed after deploying. Cron Jobs are
invoked with GET; the route also accepts POST for manual/local testing with
the same header. (The email-digest cron entry gets added here in Phase 8.)

## Local development notes

- TypeScript strict mode is on project-wide; avoid `any` (if truly
  unavoidable, comment why).
- All external data (API responses, form input, cron payloads) is validated
  with Zod before use — see `lib/validation/schemas.ts`.
- Adzuna and Jooble adapters are implemented against their publicly
  documented API contracts but couldn't be verified live without real keys
  (Adzuna's endpoint/auth was confirmed reachable; Jooble's is fronted by
  Cloudflare bot-protection for anonymous requests). Smoke-test both via
  `sync_logs` once you add real keys, and adjust the Zod schemas in
  `lib/validation/schemas.ts` if the actual response shape drifts from what's
  modeled.
- `lib/db/admin.ts` holds the service-role Supabase client. It imports
  `server-only`, so pulling it into client code is a build error by design —
  it must only be used from cron routes, the sync orchestrator, and admin
  API routes.
- The job table's search only matches `title`/`description`, and sorting is
  limited to `title`/`date_posted`/`salary_max` — verified live that
  PostgREST's `.or()` can't filter across an embedded resource's columns
  (e.g. `companies.name`), and that ordering by an embedded resource's
  column controls the embed's internal order, not the parent row order. Company-name search/sort
  would need either a denormalized column on `jobs` or a Postgres view.
