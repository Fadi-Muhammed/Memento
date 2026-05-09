const LLM_BASE_URL = process.env.LLM_BASE_URL ?? 'https://openrouter.ai/api/v1'

export async function callLLM(params: {
  systemPrompt: string
  userMessage: string
  model?: string
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY')

  const model = params.model ?? process.env.LLM_MODEL
  if (!model) throw new Error('Missing LLM_MODEL — set env var or pass model in params')

  const body = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: params.userMessage },
    ],
    max_tokens: 512,
    temperature: 0.2,
  })

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  let response: Response

  // One retry on network failure only — not on 4xx/5xx
  try {
    response = await fetch(`${LLM_BASE_URL}/chat/completions`, { method: 'POST', headers, body })
  } catch {
    response = await fetch(`${LLM_BASE_URL}/chat/completions`, { method: 'POST', headers, body })
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`LLM request failed — status ${response.status}: ${text}`)
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[]
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('LLM returned empty content')

  return content
}
