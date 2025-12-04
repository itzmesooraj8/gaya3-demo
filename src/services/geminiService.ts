import { GoogleGenAI } from "@google/genai";
import { ChatMode, GroundingMetadata } from "../types";

// --- DEBUGGING ---
// This checks if vite.config.ts successfully passed the key from .env
const hasKey = !!process.env.API_KEY;
if (!hasKey) {
  console.error("❌ GEMINI FATAL: API Key is missing.");
  console.error("Action Required: Create a .env file in project root with 'GEMINI_API_KEY=AIzaSy...'");
} else {
  console.log("✅ GEMINI SERVICE: Neural Link Established.");
}

// Initialize the client with the key injected via Vite
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  
  if (!process.env.API_KEY) {
    yield { text: "⚠️ Neural Link Severed: API Key missing. Please check your .env file." };
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
    // console.log(`📡 Sending request to Gemini [Mode: ${mode}, Model: ${model}]`);
    
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: `
        Previous Context:
        ${history.slice(-5).join('\n')}
        
        Current Request:
        ${userMessage}
      `,
      config: config
    });

    for await (const chunk of responseStream) {
      yield {
        text: chunk.text || "",
        groundingMetadata: chunk.candidates?.[0]?.groundingMetadata as GroundingMetadata
      };
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