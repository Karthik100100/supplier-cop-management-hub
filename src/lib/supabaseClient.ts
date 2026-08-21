import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Single shared Supabase browser client.
 *
 * Both values are injected at build time by Vite from the environment:
 *   VITE_SUPABASE_URL       e.g. https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY  the project's anon / publishable key
 *
 * The anon key is safe to ship in a public bundle — every table is protected by
 * Row Level Security, so the key alone grants no data access without a valid
 * signed-in session (see supabase/02_rls.sql).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Fail loudly in the console rather than silently rendering an empty app.
  console.error(
    '[supabase] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env.local for local dev, or add them as GitHub repository secrets for the Pages build.'
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseAnonKey ?? 'missing-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'supplier-cop-hub-auth',
    },
    db: { schema: 'public' },
    global: {
      headers: { 'x-application-name': 'supplier-cop-management-hub' },
    },
  }
);

/** Table names, centralised so a rename is a one-line change. */
export const TABLES = {
  suppliers: 'suppliers',
  cars: 'cars',
  audits: 'audits',
  users: 'users',
  profiles: 'profiles',
} as const;

/** Turns a PostgrestError / AuthError into something worth showing a user. */
export const describeError = (error: unknown, fallback = 'Something went wrong.'): string => {
  if (!error) return fallback;
  const e = error as { message?: string; code?: string; details?: string };
  if (e.code === '42501' || e.message?.includes('row-level security')) {
    return 'Your role does not have permission to perform that action.';
  }
  if (e.code === '23505') return 'That record already exists.';
  if (e.code === '23503') return 'That record references a supplier that no longer exists.';
  return e.message || e.details || fallback;
};
