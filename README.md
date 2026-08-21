# Supplier CoP Management Hub

Supplier accreditation, Conformity of Production (CoP) compliance and performance
management demo for an automotive Tier-1 Purchasing department.

React 19 + TypeScript + Vite front end, **Supabase** (Postgres + Auth + RLS) back end,
hosted on **GitHub Pages**. All data in this repository is **fake / mock demo data** —
no real supplier information is present.

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript, Tailwind CSS v4, Recharts, Motion, lucide-react |
| Data | Supabase Postgres — `suppliers`, `cars`, `audits`, `users` (+ `profiles`) |
| Auth | Supabase Auth, email + password, role stored on `profiles` |
| Authorisation | Postgres Row Level Security, scoped per role |
| Hosting | GitHub Pages via GitHub Actions (`actions/deploy-pages`) |

---

## Setup order

Follow these steps in order. Steps (a)–(e) are one-time.

### a. Create the GitHub repository

Create a new **public** repository named exactly `supplier-cop-management-hub`
(the name must match `base` in `vite.config.ts`). Push this project to it:

```bash
git init
git add .
git commit -m "Initial commit: Supplier CoP Management Hub"
git branch -M main
git remote add origin https://github.com/<github-username>/supplier-cop-management-hub.git
```

> Public is required for GitHub Pages on the free plan. Private repositories need
> GitHub Pro/Team.

### b. Create the Supabase project

In the [Supabase dashboard](https://supabase.com/dashboard) create a new project
named `supplier-cop-hub-demo`. Wait until it reports healthy, then copy from
**Project Settings → API**:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

Never use the `service_role` key in this app.

### c. Run the SQL files in the Supabase SQL Editor

Open **SQL Editor** in the project and run these three files **in order**:

| Order | File | Contents |
| --- | --- | --- |
| 1 | `supabase/01_schema.sql` | Tables, foreign keys, indexes, composite-score function + trigger, signup trigger |
| 2 | `supabase/02_rls.sql` | RLS enablement, role helper functions, per-role policies, `apply_supplier_metric` RPC |
| 3 | `supabase/03_seed.sql` | 8 suppliers, 5 CARs, 6 audits, 6 directory users (mock data) |

Then create at least one sign-in account. Either sign up through the app's
**Sign up** tab, or use **Authentication → Users → Add user** in the dashboard and
set the role in the user's metadata:

```json
{ "name": "Sarah Connor", "role": "Admin", "department": "Global Purchasing & Systems" }
```

The `handle_new_user` trigger reads that metadata and creates the matching
`profiles` row (and links the `users` directory row by email) automatically.
Users created without a role default to `Executive Viewer`.

### d. Add the GitHub repository secrets

**Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the project's anon public key |

The workflow injects both at build time — Vite inlines any `VITE_`-prefixed
variable into the static bundle. Shipping the anon key publicly is expected and
safe: RLS grants it nothing without a valid signed-in session.

### e. Enable GitHub Pages

**Settings → Pages → Build and deployment → Source → "GitHub Actions"**.
This is a manual one-time step; the workflow cannot set it for you.

### f. Push to `main` to deploy

```bash
git push -u origin main
```

`.github/workflows/deploy.yml` runs on every push to `main`: `npm ci` →
`npm run lint` (type-check) → `npm run build` → upload `dist/` as a Pages
artifact → deploy. Watch progress under the **Actions** tab.

### g. Open the live site

```
https://<github-username>.github.io/supplier-cop-management-hub/
```

---

## Local development

```bash
cp .env.example .env.local     # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev                    # http://localhost:3000/supplier-cop-management-hub/
```

Serving from the root path locally instead:

```bash
VITE_BASE_PATH=/ npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `npm run lint` | `tsc --noEmit` type-check |
| `npm run seed:sql` | Regenerate `supabase/03_seed.sql` from `src/data/mockData.ts` |

---

## Role permission matrix

Enforced twice: in the UI (`canAccessScreen` / `canEdit` in `AppContext`) and
authoritatively in Postgres by RLS policies.

| Role | Suppliers | CARs & Audits | User directory | Screens |
| --- | --- | --- | --- | --- |
| **Admin** | read + write | read + write | read + write | all six |
| **Purchasing Manager** | read + write | read only | read only | dashboard, approval, master data |
| **Supplier Quality Engineer** | read only\* | read + write | read only | dashboard, performance, standards |
| **Executive Viewer** | read only | read only | read only | dashboard, standards |

\* An SQE cannot edit supplier records directly, but closing a CAR or logging an
audit must still move that supplier's scorecard. Those rollups go through the
`apply_supplier_metric` SECURITY DEFINER function, which only permits
`scarClosure`, `auditScore` and `assessmentStatus` to change.

Not signed in (`anon`) has no access to any table.

## Composite score

The 0–5 composite score is a weighted blend of PPM (30%), OTD (25%), audit score
(25%) and SCAR closure (20%), and the tier is derived from it:

| Composite | Tier |
| --- | --- |
| ≥ 4.0 | Tier 1 - Preferred |
| 3.0 – 3.9 | Tier 1 - Approved |
| 2.0 – 2.9 | Tier 2 - Conditional |
| 1.0 – 1.9 | Tier 3 - Development Required |
| < 1.0 | Immediate Action |

The formula lives in **two** places on purpose:

- `calculateCompositeScore` / `deriveTier` in `src/data/mockData.ts` — instant
  optimistic UI feedback while a write is in flight.
- `public.calculate_composite_score` / `public.derive_tier` plus the
  `trg_suppliers_composite` trigger — the authoritative value. Any insert or
  update of a supplier's metrics recalculates `compositeScore` and `tier`
  server-side, so scores can never drift, even if a row is edited directly in
  the SQL editor. Client values are reconciled against the trigger's response.

## Project structure

```
.github/workflows/deploy.yml   GitHub Pages build + deploy
supabase/01_schema.sql         Tables, FKs, functions, triggers
supabase/02_rls.sql            RLS policies + apply_supplier_metric RPC
supabase/03_seed.sql           Mock seed data (generated)
scripts/gen-seed.ts            Regenerates 03_seed.sql from mockData.ts
src/lib/supabaseClient.ts      Shared Supabase browser client
src/context/AppContext.tsx     All reads/writes against Supabase
src/components/RoleLogin.tsx   Supabase Auth email/password sign-in + sign-up
src/components/screens/        Dashboard, approval, performance, master data, standards, users
src/data/mockData.ts           Score helpers + activity/notification seed
src/types.ts                   Shared TypeScript interfaces
```

Database column names are quoted camelCase (`"riskCategory"`, `"iatfCertExpiry"`,
…) so rows map 1:1 onto the interfaces in `src/types.ts` with no translation
layer. Supplier contacts and accreditations are stored as `jsonb` arrays.

The activity feed and notification tray remain client-side session state — they
are reactions to mutations rather than persisted records.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Blank page, 404s on `/assets/*` | `base` in `vite.config.ts` must match the repo name exactly |
| Console: "Missing VITE_SUPABASE_URL" | Repository secrets missing, or `.env.local` not created locally |
| Signed in but no data | The SQL files were not run, or run out of order |
| "Your role does not have permission…" | Working as intended — RLS refused the write for that role |
| Deploy job fails on permissions | Pages source is not set to "GitHub Actions" (step e) |
