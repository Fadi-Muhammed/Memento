import OpenAI from 'openai'

if (!process.env.OPENROUTER_API_KEY) throw new Error('Missing OPENROUTER_API_KEY')
if (!process.env.LLM_MODEL) throw new Error('Missing LLM_MODEL')

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.LLM_BASE_URL ?? 'https://openrouter.ai/api/v1',
})

export interface LLMExtractionResult {
  extracted: Record<string, string | boolean | null>
  reply: string
  confidence: number
  escalate: boolean
}

// Called once per inbound bot message — extracts structured data and returns the next reply
export async function extractAndReply(
  systemPrompt: string,
  conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[],
  userMessage: string
): Promise<LLMExtractionResult> {
  const response = await openrouter.chat.completions.create({
    model: process.env.LLM_MODEL!,
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  const raw = response.choices[0]?.message?.content ?? '{}'

  try {
    const parsed = JSON.parse(raw) as LLMExtractionResult
    return {
      extracted: parsed.extracted ?? {},
      reply: parsed.reply ?? '',
      confidence: parsed.confidence ?? 1,
      escalate: parsed.escalate ?? false,
    }
  } catch {
    return { extracted: {}, reply: '', confidence: 0, escalate: true }
  }
}
