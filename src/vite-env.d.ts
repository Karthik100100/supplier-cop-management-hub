/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project REST/Auth endpoint, e.g. https://<ref>.supabase.co */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase anon / publishable key — public by design, guarded by RLS. */
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Optional Vite base path override (defaults to the GitHub Pages subpath). */
  readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
