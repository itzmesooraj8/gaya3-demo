import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET");

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const { user_id, property_id, start_date, end_date, currency = 'usd' } = await req.json();
    if (!user_id || !property_id || !start_date || !end_date) return new Response('Bad Request', { status: 400 });

    // Validate property and compute total price server-side
    const propResp = await fetch(`${SUPABASE_URL}/rest/v1/properties?id=eq.${property_id}&select=id,price_per_night`, {
      headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY },
    });
    const props = await propResp.json();
    if (!props || props.length === 0) return new Response('Property not found', { status: 404 });
    const property = props[0];

    const s = new Date(start_date);
    const e = new Date(end_date);
    const nights = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
    const amount = Math.round((property.price_per_night * nights) * 100); // cents

    if (!STRIPE_SECRET) {
      console.error('Missing STRIPE_SECRET');
      return new Response('Server misconfigured', { status: 500 });
    }

    // Create a booking row with status 'pending'
    const bookingResp = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ user_id, property_id, start_date, end_date, total_price: amount/100.0, status: 'pending' }),
    });
    if (!bookingResp.ok) {
      const txt = await bookingResp.text();
      console.error('Booking insert failed', txt);
      return new Response('Failed to create booking', { status: 500 });
    }
    const [booking] = await bookingResp.json();

    // Create Stripe payment intent
    const stripeResp = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ amount: String(amount), currency, metadata: JSON.stringify({ booking_id: booking.id }) })
    });

    if (!stripeResp.ok) {
      const txt = await stripeResp.text();
      console.error('Stripe error', txt);
      return new Response('Payment provider error', { status: 502 });
    }

    const pi = await stripeResp.json();

    return new Response(JSON.stringify({ client_secret: pi.client_secret, booking_id: booking.id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response('Internal error', { status: 500 });
  }
});
