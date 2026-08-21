-- ============================================================================
-- Supplier CoP Management Hub — Database Schema
-- Target: brand-new Supabase project "supplier-cop-hub-demo"
-- Run this file FIRST in the Supabase SQL Editor, then 02_rls.sql, then 03_seed.sql
--
-- NOTE ON IDENTIFIERS: column names are intentionally quoted camelCase so they
-- map 1:1 onto the existing TypeScript interfaces in src/types.ts. This means
-- the frontend needs no field-name translation layer.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enumerated domains (kept as CHECK constraints rather than PG enums so the
-- demo data can be edited freely without ALTER TYPE migrations)
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- 1. profiles — links auth.users to an application role
-- ===========================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  name        text not null default 'New User',
  role        text not null default 'Executive Viewer'
                check (role in ('Admin', 'Purchasing Manager', 'Supplier Quality Engineer', 'Executive Viewer')),
  department  text not null default 'Supply Chain Operations',
  avatar      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Application profile + RBAC role for each Supabase Auth user.';

-- ===========================================================================
-- 2. suppliers
-- ===========================================================================
create table if not exists public.suppliers (
  id                 text primary key,                       -- e.g. SUP-10294
  name               text        not null,
  commodity          text        not null default 'Uncategorised',
  location           text        not null default 'Global Facility',
  region             text        not null default 'EU'
                       check (region in ('EU', 'NA', 'APAC', 'Global')),
  "riskCategory"     text        not null default 'Medium'
                       check ("riskCategory" in ('Low', 'Medium', 'High', 'Critical')),
  "iatfCertExpiry"   date        not null default (current_date + interval '1 year'),
  "iatfStatus"       text        not null default 'Valid'
                       check ("iatfStatus" in ('Valid', 'Expiring Soon', 'Expired', 'Pending')),
  "assessmentStatus" text        not null default 'Pending',
  "assessmentScore"  numeric(5,2) not null default 0
                       check ("assessmentScore" between 0 and 100),
  "sqaSigned"        boolean     not null default false,
  "sqaDate"          date,
  "approvalStatus"   text        not null default 'Pending'
                       check ("approvalStatus" in ('Approved', 'Pending', 'Rejected', 'Under Review')),

  -- performance metrics
  ppm                numeric(8,2) not null default 0 check (ppm >= 0),
  otd                numeric(5,2) not null default 0 check (otd between 0 and 100),
  "auditScore"       numeric(5,2) not null default 0 check ("auditScore" between 0 and 100),
  "scarClosure"      numeric(5,2) not null default 0 check ("scarClosure" between 0 and 100),

  -- derived server-side by trg_suppliers_composite (see 1.b below)
  "compositeScore"   numeric(4,2) not null default 0,
  tier               text        not null default 'Immediate Action',

  duns               text        not null default '00-000-0000',
  contacts           jsonb       not null default '[]'::jsonb,
  accreditations     jsonb       not null default '[]'::jsonb,
  notes              text,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on column public.suppliers.contacts is
  'Array of {name, email, phone, title} — mirrors SupplierContact[].';
comment on column public.suppliers.accreditations is
  'Array of {name, category, status, expiryDate, certNumber} — mirrors Accreditation[].';

create index if not exists suppliers_approval_status_idx on public.suppliers ("approvalStatus");
create index if not exists suppliers_region_idx          on public.suppliers (region);
create index if not exists suppliers_risk_idx            on public.suppliers ("riskCategory");

-- ===========================================================================
-- 3. cars — Corrective Action Requests (8D / SCAR)
-- ===========================================================================
create table if not exists public.cars (
  ref                 text primary key,                      -- e.g. CAR-892
  "supplierId"        text not null references public.suppliers (id) on update cascade on delete cascade,
  "supplierName"      text not null,
  issue               text not null,
  "raisedDate"        date not null default current_date,
  "dueDate"           date not null default (current_date + interval '30 days'),
  severity            text not null default 'Minor'
                        check (severity in ('Critical', 'Major', 'Minor')),
  status              text not null default 'Open'
                        check (status in ('Open', 'Under Investigation', '8D Submitted', 'Verified Closed')),
  "assignedSqe"       text not null default 'Unassigned',
  "rootCause"         text,
  "containmentAction" text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists cars_supplier_idx on public.cars ("supplierId");
create index if not exists cars_status_idx   on public.cars (status);

-- ===========================================================================
-- 4. audits
-- ===========================================================================
create table if not exists public.audits (
  id              text primary key,                           -- e.g. AUD-2026-01
  "supplierId"    text not null references public.suppliers (id) on update cascade on delete cascade,
  "supplierName"  text not null,
  "auditType"     text not null
                    check ("auditType" in ('VDA 6.3 Process', 'IATF 16949 QMS', 'CoP Verification',
                                           'PPAP On-site', 'MMOG/LE Logistics')),
  "lastDate"      date not null default current_date,
  "nextDate"      date not null default (current_date + interval '1 year'),
  result          text not null default 'Pending',
  "scorePercent"  numeric(5,2) not null default 0 check ("scorePercent" between 0 and 100),
  status          text not null default 'Scheduled'
                    check (status in ('Completed', 'Scheduled', 'Overdue')),
  "leadAuditor"   text not null default 'Unassigned',
  "findingsCount" integer not null default 0 check ("findingsCount" >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists audits_supplier_idx on public.audits ("supplierId");
create index if not exists audits_status_idx   on public.audits (status);

-- ===========================================================================
-- 5. users — application directory shown on the User & Role Management screen.
--    Distinct from auth.users/profiles: a directory row may exist for an
--    invited person who has not yet completed Supabase Auth signup.
-- ===========================================================================
create table if not exists public.users (
  id           text primary key,                              -- e.g. USR-001
  name         text not null,
  email        text not null unique,
  role         text not null
                 check (role in ('Admin', 'Purchasing Manager', 'Supplier Quality Engineer', 'Executive Viewer')),
  department   text not null default 'Supply Chain Operations',
  status       text not null default 'Active'
                 check (status in ('Active', 'Inactive')),
  avatar       text,
  "lastActive" text not null default 'Never',
  auth_user_id uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ===========================================================================
-- 6. Composite score + tier: same formula as src/data/mockData.ts,
--    enforced server-side so metric updates always re-derive the score.
-- ===========================================================================
create or replace function public.calculate_composite_score(
  p_ppm numeric, p_otd numeric, p_audit_score numeric, p_scar_closure numeric
) returns numeric
language sql
immutable
as $$
  select round(
      0.30 * least(5, greatest(0, 5 - (coalesce(p_ppm, 0) / 30.0)))
    + 0.25 * least(5, greatest(0, (coalesce(p_otd, 0) / 100.0) * 5))
    + 0.25 * least(5, greatest(0, (coalesce(p_audit_score, 0) / 100.0) * 5))
    + 0.20 * least(5, greatest(0, (coalesce(p_scar_closure, 0) / 100.0) * 5))
  , 2);
$$;

create or replace function public.derive_tier(p_composite numeric)
returns text
language sql
immutable
as $$
  select case
    when p_composite >= 4.0 then 'Tier 1 - Preferred'
    when p_composite >= 3.0 then 'Tier 1 - Approved'
    when p_composite >= 2.0 then 'Tier 2 - Conditional'
    when p_composite >= 1.0 then 'Tier 3 - Development Required'
    else 'Immediate Action'
  end;
$$;

create or replace function public.suppliers_apply_composite()
returns trigger
language plpgsql
as $$
begin
  new."compositeScore" := public.calculate_composite_score(
    new.ppm, new.otd, new."auditScore", new."scarClosure"
  );
  new.tier := public.derive_tier(new."compositeScore");
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_suppliers_composite on public.suppliers;
create trigger trg_suppliers_composite
  before insert or update on public.suppliers
  for each row execute function public.suppliers_apply_composite();

-- ===========================================================================
-- 7. Generic updated_at touch trigger for the remaining tables
-- ===========================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_cars_touch on public.cars;
create trigger trg_cars_touch before update on public.cars
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_audits_touch on public.audits;
create trigger trg_audits_touch before update on public.audits
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_users_touch on public.users;
create trigger trg_users_touch before update on public.users
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ===========================================================================
-- 8. Denormalised supplierName keeps itself in sync with suppliers.name
-- ===========================================================================
create or replace function public.sync_supplier_name()
returns trigger
language plpgsql
as $$
begin
  if new.name is distinct from old.name then
    update public.cars   set "supplierName" = new.name where "supplierId" = new.id;
    update public.audits set "supplierName" = new.name where "supplierId" = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_suppliers_sync_name on public.suppliers;
create trigger trg_suppliers_sync_name
  after update of name on public.suppliers
  for each row execute function public.sync_supplier_name();

-- ===========================================================================
-- 9. Auth: auto-create a profile row (and a directory row) on signup
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role       text;
  v_name       text;
  v_department text;
begin
  v_role := coalesce(new.raw_user_meta_data ->> 'role', 'Executive Viewer');
  if v_role not in ('Admin', 'Purchasing Manager', 'Supplier Quality Engineer', 'Executive Viewer') then
    v_role := 'Executive Viewer';
  end if;

  v_name       := coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1));
  v_department := coalesce(nullif(new.raw_user_meta_data ->> 'department', ''), 'Supply Chain Operations');

  insert into public.profiles (id, email, name, role, department, avatar)
  values (new.id, new.email, v_name, v_role, v_department, new.raw_user_meta_data ->> 'avatar')
  on conflict (id) do update
    set email = excluded.email,
        name  = excluded.name,
        role  = excluded.role;

  -- keep the in-app user directory aligned with real auth accounts
  insert into public.users (id, name, email, role, department, status, avatar, "lastActive", auth_user_id)
  values (
    'USR-' || upper(substr(replace(new.id::text, '-', ''), 1, 6)),
    v_name, new.email, v_role, v_department, 'Active',
    new.raw_user_meta_data ->> 'avatar', 'Just now', new.id
  )
  on conflict (email) do update
    set auth_user_id = excluded.auth_user_id,
        "lastActive" = 'Just now';

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
