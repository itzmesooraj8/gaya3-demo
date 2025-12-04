import { supabase } from './supabaseClient';

const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || '';

export async function createPaymentIntent({ property_id, start_date, end_date }: { property_id: string; start_date: string; end_date: string }) {
  const user = await supabase.auth.getUser();
  if (!user || !user.data || !user.data.user) throw new Error('Not authenticated');
  const userId = user.data.user.id;

  if (!FUNCTIONS_BASE) throw new Error('VITE_SUPABASE_FUNCTIONS_URL not set');

  const res = await fetch(`${FUNCTIONS_BASE}/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, property_id, start_date, end_date }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Server error: ${txt}`);
  }

  return res.json();
}
