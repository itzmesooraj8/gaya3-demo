import { supabase, supabaseIsStub } from './supabaseClient';
import { ChatMode, GroundingMetadata } from "../types";

interface GeminiChunk {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

// --- PERSONAS & INSTRUCTIONS ---
const SYSTEM_INSTRUCTIONS = {
  standard: `You are GAYA (The Muse), an aesthetic, poetic concierge. 
  Style: Ethereal, emotional, evocative. Focus on vibes, atmosphere, and sensory details.
  Constraint: Keep responses short, chic, and inspiring. Do not use markdown lists. Speak like a curator of high art.`,
  
  thinking: `You are DEEP (The Strategist), an analytical travel logistics expert.
  Style: Structured, logical, comprehensive. Solve complex itinerary problems and potential conflicts.
  Constraint: Provide reasoning for your suggestions. Anticipate travel friction points.`,
  
  search: `You are WEB (The Insider), a trend-aware socialite.
  Style: Up-to-the-minute, pop-culture savvy, knowing "what's hot" right now.
  Constraint: Focus on live events, recent reviews, and trending spots.`,
  
  maps: `You are MAPS (The Curator), a spatial discovery guide.
  Style: Directional, focused on proximity and hidden gems nearby.
  Constraint: Prioritize location context, distances, and neighborhood vibes.`,
  
  fast: `You are FAST (The Butler), a transactional utility agent.
  Style: Direct, concise, action-oriented. No fluff.
  Constraint: Answer in 1-2 sentences maximum. Focus on facts and immediate next steps.`
};

// Helper to get user location for Maps Grounding
const getUserLocation = async (): Promise<{latitude: number, longitude: number} | undefined> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(undefined);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.warn("Geolocation access denied or failed:", error);
        resolve(undefined);
      },
      { timeout: 5000 }
    );
  });
};

/**
 * Streams the response from Gemini to provide low-latency feedback to the user.
 */
export const streamGeminiResponse = async function* (
  userMessage: string, 
  history: string[], 
  mode: ChatMode = 'standard'
): AsyncGenerator<GeminiChunk> {
  // If Supabase not configured, return a safe fallback so UI doesn't crash
  if (supabaseIsStub) {
    yield { text: "⚠️ Stub Mode: Supabase not configured. AI features are unavailable in this environment." };
    return;
  }

  let model = 'gemini-3-pro-preview';
  let config: any = {
    systemInstruction: SYSTEM_INSTRUCTIONS[mode],
  };

  // Configure model and settings based on selected mode
  switch (mode) {
    case 'thinking':
      model = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 32768 }; // Max thinking for complex tasks
      break;

    case 'search':
      model = 'gemini-2.5-flash';
      config.tools = [{ googleSearch: {} }];
      break;

    case 'maps':
      model = 'gemini-2.5-flash';
      config.tools = [{ googleMaps: {} }];
      // Retrieve real user location for context-aware maps results
      const location = await getUserLocation();
      if (location) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: location
          }
        };
      }
      break;

    case 'fast':
      model = 'gemini-2.5-flash-lite'; // Lowest latency model
      break;

    case 'standard':
    default:
      model = 'gemini-3-pro-preview'; // High quality creative model
      break;
  }

  try {
    // Attempt to call the Supabase Edge Function. Prefer streaming via fetch if available.
    const payload = { message: userMessage, history, mode, model, config };

    // Try supabase client's functions.invoke first (may return JSON)
    try {
      const invokeResp: any = await supabase.functions.invoke('ask-gaya', { body: payload });
      // Some supabase clients return { data, error }
      if (invokeResp?.error) {
        throw invokeResp.error;
      }

      // If the response contains a stream-like body, we can't access it via client helper
      // so fall through to the fetch-based invocation below as a fallback.
      if (invokeResp?.data && typeof invokeResp.data === 'string') {
        // plain string response
        yield { text: invokeResp.data };
        return;
      }
    } catch (invokeErr) {
      // Not fatal — we'll try a direct fetch to the functions endpoint to support streaming.
      // console.warn('supabase.functions.invoke failed, falling back to direct fetch', invokeErr);
    }

    // Fallback: POST directly to Supabase Functions endpoint so we can read a streaming body if available
    const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)
      ? String(import.meta.env.VITE_SUPABASE_URL)
      : (process.env.SUPABASE_URL || '');
    const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
      ? String(import.meta.env.VITE_SUPABASE_ANON_KEY)
      : (process.env.SUPABASE_ANON_KEY || '');

    if (!SUPABASE_URL) {
      yield { text: "⚠️ Supabase URL not configured. Cannot call Edge Function." };
      return;
    }

    const functionUrl = SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/ask-gaya';
    const fetchResp = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    // If the function returns a streaming body, stream chunks to the caller
    if (fetchResp.body && typeof fetchResp.body.getReader === 'function') {
      const reader = fetchResp.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: d } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          // Yield incremental updates (best-effort). Consumers should handle partial text.
          yield { text: buffer };
        }
        done = d;
      }
      return;
    }

    // Otherwise parse JSON/body and yield single result
    const json = await fetchResp.json().catch(async () => {
      const txt = await fetchResp.text();
      return { text: txt };
    });

    if (json) {
      const text = json.text || (json?.candidates?.[0]?.content) || JSON.stringify(json);
      yield { text };
      return;
    }
  } catch (error: any) {
    console.error("❌ GEMINI API ERROR:", error);
    let errorMessage = "I am currently realigning my neural pathways. Please try again in a moment.";
    
    if (error.message?.includes('API key')) {
      errorMessage = "My access key appears to be invalid or expired. Please check your configuration.";
    }
    
    yield { text: errorMessage };
  }
};
