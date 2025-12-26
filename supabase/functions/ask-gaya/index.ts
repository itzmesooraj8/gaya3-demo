import { serve } from "https://deno.land/std@0.203.0/http/mod.ts";

// Edge Function to proxy AI requests to Google GenAI securely on the server-side.
// Expects JSON body: { message, history, mode }

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY missing in environment for ask-gaya function');
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const body = await req.json().catch(() => null);
    if (!body || !body.message) return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const message: string = body.message;
    const history: string[] = Array.isArray(body.history) ? body.history : [];
    const mode: string = body.mode || 'standard';

    // Build a simple prompt combining recent history and the current message.
    const prompt = `Previous Context:\n${history.slice(-6).join('\n')}\n\nUser:\n${message}`;

    // Choose a model; allow override from payload if provided
    const model = (body.model as string) || 'models/text-bison-001';

    // Call Google Generative Language API (REST) server-side using the API key stored in environment.
    // Note: Depending on the Google GenAI flavor/endpoint you use, adjust the URL and payload accordingly.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta2/${model}:generate`;

    const gResp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.6,
        candidate_count: 1,
      })
    });

    if (!gResp.ok) {
      const txt = await gResp.text();
      console.error('GenAI error:', gResp.status, txt);
      return new Response(JSON.stringify({ error: 'GenAI request failed', details: txt }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const json = await gResp.json();

    // Attempt to extract text from common GenAI response shapes
    const candidate = (json?.candidates && json.candidates[0]) || json?.output?.[0] || null;
    const text = candidate?.content || candidate?.text || json?.candidates?.[0]?.message || JSON.stringify(json);

    return new Response(JSON.stringify({ text }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
