import { supabase, supabaseIsStub } from './supabaseClient';
import { ChatMode } from '../types';

interface GeminiChunk {
  text: string;
}

/**
 * Streams AI responses by invoking the secure `ask-gaya` Edge Function.
 * Keeps the async-generator signature so callers remain unchanged.
 */
export const streamGeminiResponse = async function* (
  userMessage: string,
  history: any[] = [],
  mode: ChatMode = 'standard'
): AsyncGenerator<GeminiChunk> {
  if (supabaseIsStub) {
    yield { text: '⚠️ Stub Mode: Supabase not configured. AI features are unavailable.' };
    return;
  }

  const formattedHistory = history.map((h: any) => {
    if (typeof h === 'string') {
      const [role, ...rest] = h.split(': ');
      return { role: role?.toLowerCase() || 'user', text: rest.join(': ') || '' };
    }
    return h;
  });

  try {
    const { data, error } = await supabase.functions.invoke('ask-gaya', {
      body: {
        messages: [...formattedHistory, { role: 'user', text: userMessage }],
        mode,
      },
    });

    if (error) {
      console.error('AI Error:', error);
      yield { text: 'I am having trouble connecting to the neural link.' };
      return;
    }

    yield { text: data?.text || 'The stars are quiet.' };
  } catch (err: any) {
    console.error('AI invoke error', err);
    yield { text: 'I am having trouble connecting to the neural link.' };
  }
};
