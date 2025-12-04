import { createClient } from '@supabase/supabase-js';

// Prefer Vite envs (`import.meta.env`) during build for client-side apps, but fall back to
// older process.env names if present in other environments.
const VITE_SUPABASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL
  ? String(import.meta.env.VITE_SUPABASE_URL)
  : '';
const VITE_SUPABASE_ANON_KEY = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY
  ? String(import.meta.env.VITE_SUPABASE_ANON_KEY)
  : '';

const SUPABASE_URL = VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// In development we allow a lightweight stub so local dev works without secrets.
// In production (import.meta.env.PROD) we require the keys and will surface a clear error
// so deployment fails fast if misconfigured.
const isDev = typeof import.meta !== 'undefined' ? Boolean(import.meta.env?.DEV) : Boolean(process.env.NODE_ENV !== 'production');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (isDev) {
    console.warn('Supabase env missing — using dev stub. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for full functionality.');
  } else {
    // Fail fast in production to avoid silently running a broken app.
    throw new Error('Missing Supabase environment variables in production. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY).');
  }
}

let supabaseClient;
let _supabaseIsStub = false;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  _supabaseIsStub = true;
  const noopAsync = async () => ({ data: null, error: null });
  const noopSubscription = { unsubscribe: () => {} };
  supabaseClient = {
    auth: {
      onAuthStateChange: (_cb: any) => ({ data: null, subscription: noopSubscription }),
      signInWithOAuth: async (_: any) => ({ data: null, error: new Error('Supabase not configured') }),
      getUser: async () => ({ data: null, error: new Error('Supabase not configured') }),
    },
    from: (_: string) => ({ upsert: noopAsync, insert: noopAsync, select: noopAsync }),
    functions: { invoke: noopAsync },
    storage: { from: (_: string) => ({ getPublicUrl: () => ({ data: null, error: null }) }) },
  } as any;
}

export const supabase = supabaseClient;
export const supabaseIsStub = _supabaseIsStub;
