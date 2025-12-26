import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripeSecret = Deno.env.get("STRIPE_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const stripe = new Stripe(stripeSecret as string, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));

    // Support finalize flow: called after client completes SCA (3D Secure)
    if (body?.paymentIntentId && body?.finalize) {
      const paymentIntentId = String(body.paymentIntentId);
      const bookingDetails = body.bookingDetails || {};

      const pi = await stripe.paymentIntents.retrieve(paymentIntentId as string);
      if (pi.status === "succeeded") {
        if (!supabaseUrl || !supabaseServiceKey) {
          return new Response(JSON.stringify({ error: 'Supabase env not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { propertyId, userId, date, guests, totalPrice } = bookingDetails;

        const { data, error } = await supabase
          .from('bookings')
          .insert({
            user_id: userId,
            property_id: propertyId,
            start_date: date,
            guests,
            total_price: totalPrice,
            status: 'UPCOMING'
          })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, bookingId: data.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ error: 'Payment not completed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Normal flow: create & confirm PaymentIntent using provided paymentMethodId
    const { paymentMethodId, bookingDetails } = body || {};
    if (!paymentMethodId || !bookingDetails) {
      return new Response(JSON.stringify({ error: 'Missing paymentMethodId or bookingDetails' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { propertyId, userId, date, guests, totalPrice } = bookingDetails;
    const amount = Math.round(Number(totalPrice) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      payment_method: paymentMethodId,
      confirm: true,
      // return_url is required by some flows; keep as placeholder
      return_url: Deno.env.get('RETURN_URL') || 'https://your-app.vercel.app/booking-success',
      automatic_payment_methods: { enabled: true }
    });

    if (paymentIntent.status === 'succeeded') {
      if (!supabaseUrl || !supabaseServiceKey) {
        return new Response(JSON.stringify({ error: 'Supabase env not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          property_id: propertyId,
          start_date: date,
          guests,
          total_price: totalPrice,
          status: 'UPCOMING'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, bookingId: data.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_payment_method') {
      return new Response(JSON.stringify({ requiresAction: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: `Unexpected payment status: ${paymentIntent.status}` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('create-booking error', error);
    return new Response(JSON.stringify({ error: error?.message || String(error) }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
