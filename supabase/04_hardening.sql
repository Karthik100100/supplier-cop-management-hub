-- ---------------------------------------------------------------------------
-- 04_hardening.sql — Supabase security-advisor remediations
--
-- Run this after 01_schema.sql, 02_rls.sql and 03_seed.sql.
-- It clears the WARN-level findings raised by the Supabase database linter:
--   * 0011_function_search_path_mutable
--   * 0028_anon_security_definer_function_executable
--   * 0029_authenticated_security_definer_function_executable
-- ---------------------------------------------------------------------------

-- 1. Pin an immutable search_path on every function we define.
--    Without this, a role-level search_path could shadow `public` objects and
--    change what a SECURITY DEFINER function resolves at call time.
alter function public.calculate_composite_score(numeric, numeric, numeric, numeric)
  set search_path = public, pg_temp;
alter function public.derive_tier(numeric)            set search_path = public, pg_temp;
alter function public.suppliers_apply_composite()     set search_path = public, pg_temp;
alter function public.touch_updated_at()              set search_path = public, pg_temp;
alter function public.sync_supplier_name()            set search_path = public, pg_temp;
alter function public.current_app_role()              set search_path = public, pg_temp;
alter function public.is_admin()                      set search_path = public, pg_temp;
alter function public.can_write_suppliers()           set search_path = public, pg_temp;
alter function public.can_write_performance()          set search_path = public, pg_temp;
alter function public.handle_new_user()               set search_path = public, auth, pg_temp;
alter function public.apply_supplier_metric(text, numeric, numeric, text)
  set search_path = public, pg_temp;

-- 2. Keep trigger-only functions off the public REST surface.
--    `handle_new_user` fires from an auth.users trigger and must never be
--    callable over /rest/v1/rpc.
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- 3. `current_app_role()` is referenced inside RLS policies, so the
--    `authenticated` role still needs EXECUTE — but anonymous callers do not.
revoke execute on function public.current_app_role() from anon, public;

-- 4. `apply_supplier_metric` is the SECURITY DEFINER escape hatch that lets an
--    SQE roll a CAR/audit outcome into a supplier scorecard. Signed-in users
--    need it (the function does its own role check); anonymous callers do not.
revoke execute on function public.apply_supplier_metric(text, numeric, numeric, text)
  from anon, public;
grant  execute on function public.apply_supplier_metric(text, numeric, numeric, text)
  to authenticated;

-- Note: "Leaked Password Protection Disabled" is a dashboard setting, not SQL.
-- Enable it under Authentication → Providers → Email → "Prevent use of leaked
-- passwords" if you harden this demo for real use.
