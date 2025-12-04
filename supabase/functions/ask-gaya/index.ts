import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) console.error('Missing Supabase config');
if (!GEMINI_API_KEY) console.error('Missing GEMINI_API_KEY');

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const { user_id, message, chat_history } = await req.json();
    if (!user_id || !message) return new Response('Bad Request', { status: 400 });

    // Fetch user vibe score
    const profileResp = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user_id}&select=vibe_score,full_name`, {
      headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY },
    });
    const profiles = await profileResp.json();
    const profile = profiles[0] || { vibe_score: 5.0 };

    const systemPrompt = `You are Gaya Assistant. User: ${profile.full_name || 'Guest'}, VibeScore: ${profile.vibe_score}. Answer concisely.`;

    // Call Gemini (example endpoint, adapt as needed)
    const geminiResp = await fetch('https://generativelanguage.googleapis.com/v1beta2/models/text-bison:generateText', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `${systemPrompt}\nUser: ${message}`
      })
    });

    if (!geminiResp.ok) {
      const txt = await geminiResp.text();
      return new Response(txt, { status: geminiResp.status });
    }

    const body = await geminiResp.json();
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response('Internal error', { status: 500 });
  }
});
