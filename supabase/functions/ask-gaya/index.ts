import { serve } from "https://deno.land/std@0.178.0/http/server.ts"

const GEMINI_API_KEY = (globalThis as any).Deno?.env?.get?.('GEMINI_API_KEY') || (globalThis as any).process?.env?.GEMINI_API_KEY
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Message {
    role: 'user' | 'assistant' | string
    text: string
}

interface RequestBody {
    messages: Message[]
    mode?: string
}

interface GeminiContentPart {
    text?: string
}

interface GeminiCandidateContent {
    parts?: GeminiContentPart[]
}

interface GeminiCandidate {
    content?: GeminiCandidateContent
}

interface GeminiResponse {
    candidates?: GeminiCandidate[]
}

serve(async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { messages, mode } = (await req.json()) as RequestBody
        
        // Call Google Gemini API from the server
        const response: Response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: messages.map((m: Message) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                })),
                systemInstruction: {
                    parts: [{ text: `You are Gaya, a luxury travel concierge. Mode: ${mode}. Keep answers short, chic, and inspiring.` }]
                }
            })
        })

        const data = (await response.json()) as GeminiResponse
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "The stars are silent right now."

        return new Response(JSON.stringify({ text }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})
