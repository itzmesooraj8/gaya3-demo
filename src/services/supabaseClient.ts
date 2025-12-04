import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or ANON key missing. The app will run in read-only demo mode. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel to enable full functionality.');
}

// Export a real client only when credentials are present. Otherwise export a lightweight stub
// so the app doesn't throw during startup in production when env vars are not configured.
let supabaseClient;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  // Minimal stub implementing the parts of the API the app expects.
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
