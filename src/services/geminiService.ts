import { supabase } from './supabaseClient';
import { ChatMode, GroundingMetadata } from "../types";

import { supabase } from './supabaseClient';
import { ChatMode, GroundingMetadata } from "../types";

interface GeminiChunk {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

/**
 * Streams the response from the secure 'ask-gaya' Edge Function.
 * This hides the API Key from the browser.
 */
export const streamGeminiResponse = async function* (
  userMessage: string,
  history: string[] = [],
  mode: ChatMode = 'standard'
): AsyncGenerator<GeminiChunk> {
  try {
    // 1. Format history for the backend (generic "role: content" format)
    const formattedHistory = (history || []).map((h: any) => {
      if (typeof h === 'string') {
        const [role, ...rest] = h.split(':');
        return {
          role: role?.trim().toLowerCase() === 'model' ? 'model' : 'user',
          text: rest.join(':').trim(),
        };
      }
      // pass through objects
      return h;
    });

    // 2. Call the Secure Edge Function (No API Key needed here)
    const { data, error } = await supabase.functions.invoke('ask-gaya', {
      body: {
        messages: [...formattedHistory, { role: 'user', text: userMessage }],
        mode: mode,
      },
    });

    if (error) {
      console.error('❌ Edge Function Error:', error);
      throw new Error('Neural link unstable.');
    }

    // 3. Yield the result
    if (data?.text) {
      yield { text: data.text };
    } else {
      yield { text: 'The oracle is silent.' };
    }
  } catch (error: any) {
    console.error('❌ GEMINI PROXY ERROR:', error);
    yield { text: 'I am having trouble connecting to the neural link. Please try again.' };
  }
};
