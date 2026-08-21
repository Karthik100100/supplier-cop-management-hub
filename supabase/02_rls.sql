-- ============================================================================
-- Supplier CoP Management Hub — Row Level Security
-- Run AFTER 01_schema.sql
--
-- Role matrix
-- ---------------------------------------------------------------------------
--                        suppliers        cars / audits      users (directory)
--  Admin                 read + write     read + write       read + write
--  Purchasing Manager    read + write     read only          read only
--  Supplier Quality Eng. read only        read + write       read only
--  Executive Viewer      read only        read only          read only
--  anon (not signed in)  no access        no access          no access
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Role lookup helper. SECURITY DEFINER so it can read public.profiles from
-- inside a policy without tripping RLS recursion.
-- ---------------------------------------------------------------------------
create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$ select public.current_app_role() = 'Admin'; $$;

create or replace function public.can_write_suppliers()
returns boolean
language sql
stable
as $$ select public.current_app_role() in ('Admin', 'Purchasing Manager'); $$;

create or replace function public.can_write_performance()
returns boolean
language sql
stable
as $$ select public.current_app_role() in ('Admin', 'Supplier Quality Engineer'); $$;

grant execute on function public.is_admin()               to authenticated;
grant execute on function public.can_write_suppliers()    to authenticated;
grant execute on function public.can_write_performance()  to authenticated;

-- ---------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.suppliers enable row level security;
alter table public.cars      enable row level security;
alter table public.audits    enable row level security;
alter table public.users     enable row level security;

-- ===========================================================================
-- profiles
-- ===========================================================================
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_app_role());  -- cannot self-promote

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ===========================================================================
-- suppliers  — everyone signed in can read; Admin + Purchasing Manager write
-- ===========================================================================
drop policy if exists suppliers_select_all on public.suppliers;
create policy suppliers_select_all on public.suppliers
  for select to authenticated
  using (true);

drop policy if exists suppliers_insert on public.suppliers;
create policy suppliers_insert on public.suppliers
  for insert to authenticated
  with check (public.can_write_suppliers());

drop policy if exists suppliers_update on public.suppliers;
create policy suppliers_update on public.suppliers
  for update to authenticated
  using (public.can_write_suppliers())
  with check (public.can_write_suppliers());

drop policy if exists suppliers_delete on public.suppliers;
create policy suppliers_delete on public.suppliers
  for delete to authenticated
  using (public.can_write_suppliers());

-- ===========================================================================
-- cars — everyone signed in can read; Admin + SQE write
-- ===========================================================================
drop policy if exists cars_select_all on public.cars;
create policy cars_select_all on public.cars
  for select to authenticated
  using (true);

drop policy if exists cars_insert on public.cars;
create policy cars_insert on public.cars
  for insert to authenticated
  with check (public.can_write_performance());

drop policy if exists cars_update on public.cars;
create policy cars_update on public.cars
  for update to authenticated
  using (public.can_write_performance())
  with check (public.can_write_performance());

drop policy if exists cars_delete on public.cars;
create policy cars_delete on public.cars
  for delete to authenticated
  using (public.can_write_performance());

-- ===========================================================================
-- audits — everyone signed in can read; Admin + SQE write
-- ===========================================================================
drop policy if exists audits_select_all on public.audits;
create policy audits_select_all on public.audits
  for select to authenticated
  using (true);

drop policy if exists audits_insert on public.audits;
create policy audits_insert on public.audits
  for insert to authenticated
  with check (public.can_write_performance());

drop policy if exists audits_update on public.audits;
create policy audits_update on public.audits
  for update to authenticated
  using (public.can_write_performance())
  with check (public.can_write_performance());

drop policy if exists audits_delete on public.audits;
create policy audits_delete on public.audits
  for delete to authenticated
  using (public.can_write_performance());

-- ===========================================================================
-- users (directory) — everyone signed in can read; Admin only writes
-- ===========================================================================
drop policy if exists users_select_all on public.users;
create policy users_select_all on public.users
  for select to authenticated
  using (true);

drop policy if exists users_admin_write on public.users;
create policy users_admin_write on public.users
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Table grants: RLS decides row visibility, grants decide statement legality.
-- ---------------------------------------------------------------------------
grant select                         on public.suppliers, public.cars, public.audits, public.users, public.profiles to authenticated;
grant insert, update, delete         on public.suppliers, public.cars, public.audits, public.users, public.profiles to authenticated;
revoke all                           on public.suppliers, public.cars, public.audits, public.users, public.profiles from anon;

-- ===========================================================================
-- IMPORTANT: the SQE-side "performance" writes touch suppliers.scarClosure and
-- suppliers.auditScore (the app rolls CAR/audit outcomes into the scorecard).
-- Suppliers are read-only for the SQE role, so those rollups are exposed as a
-- SECURITY DEFINER RPC that only permits the two metric columns to change.
-- ===========================================================================
create or replace function public.apply_supplier_metric(
  p_supplier_id  text,
  p_scar_closure numeric default null,
  p_audit_score  numeric default null,
  p_assessment_status text default null
)
returns public.suppliers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.suppliers;
begin
  if public.current_app_role() not in ('Admin', 'Purchasing Manager', 'Supplier Quality Engineer') then
    raise exception 'insufficient_privilege: role % cannot update supplier metrics', public.current_app_role();
  end if;

  update public.suppliers
     set "scarClosure"      = coalesce(p_scar_closure, "scarClosure"),
         "auditScore"       = coalesce(p_audit_score,  "auditScore"),
         "assessmentStatus" = coalesce(p_assessment_status, "assessmentStatus")
   where id = p_supplier_id
   returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.apply_supplier_metric(text, numeric, numeric, text) to authenticated;
