import type { SupabaseClient } from '@supabase/supabase-js'
import { callLLM } from '@/lib/bot/llm'
import { buildQualificationPrompt } from '@/lib/bot/prompts'

// ─────────────────────────────────────────────
// State machine
// ─────────────────────────────────────────────

const STATE_ORDER = [
  'GREETING',
  'ASK_GARMENT',
  'ASK_FABRIC',
  'ASK_DEADLINE',
  'ASK_RETURNING',
  'DONE',
] as const

type BotState = (typeof STATE_ORDER)[number]

function nextState(current: string): BotState {
  const idx = STATE_ORDER.indexOf(current as BotState)
  if (idx === -1 || idx === STATE_ORDER.length - 1) return 'DONE'
  return STATE_ORDER[idx + 1]
}

// ─────────────────────────────────────────────
// LLM response shape
// ─────────────────────────────────────────────

interface BotResponse {
  extracted: {
    garment_type?: string | null
    fabric_pref?: string | null
    deadline?: string | null
    is_returning?: boolean | null
  }
  reply: string
  confidence: number
  escalate: boolean
}

const FALLBACK_REPLY = "Sorry, I didn't catch that — could you say it again?"

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

export async function advanceLeadBot(params: {
  leadId: string
  customerMessage: string
  supabase: SupabaseClient
}): Promise<{ reply: string; newState: string; qualified: boolean }> {
  const { leadId, customerMessage, supabase } = params

  // 1. Load lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) throw new Error(`Lead not found: ${leadId}`)

  const rawQual = (lead.raw_qualification ?? {}) as Record<string, unknown>
  const currentState: string = (rawQual.state as string) ?? 'GREETING'

  // 2. Build conversation history string from messages table
  const { data: messages } = await supabase
    .from('messages')
    .select('direction, body, sender')
    .eq('customer_id', lead.customer_id)
    .order('created_at', { ascending: true })

  const conversationHistory = (messages ?? [])
    .map((m: { direction: string; body: string; sender: string }) => {
      const role = m.direction === 'in' ? 'Customer' : 'Bot'
      return `${role}: ${m.body}`
    })
    .join('\n')

  // 3. Call LLM
  let parsed: BotResponse | null = null

  try {
    const raw = await callLLM({
      systemPrompt: buildQualificationPrompt(currentState, conversationHistory),
      userMessage: customerMessage,
    })
    parsed = JSON.parse(raw) as BotResponse
  } catch {
    // Parse failure or network error — return static fallback, do not advance state
    return { reply: FALLBACK_REPLY, newState: currentState, qualified: false }
  }

  // 4. Escalate if low confidence or explicit escalate flag
  if (!parsed || parsed.confidence < 0.6 || parsed.escalate) {
    return { reply: parsed?.reply ?? FALLBACK_REPLY, newState: currentState, qualified: false }
  }

  // 5. Determine next state
  const newState = nextState(currentState)

  // 6. Merge extracted fields (only overwrite if value is non-null)
  const extracted = parsed.extracted ?? {}
  const updatePayload: Record<string, unknown> = {
    raw_qualification: {
      ...rawQual,
      state: newState,
      ...(extracted.garment_type != null && { garment_type_raw: extracted.garment_type }),
      ...(extracted.fabric_pref != null && { fabric_pref_raw: extracted.fabric_pref }),
      ...(extracted.deadline != null && { deadline_raw: extracted.deadline }),
      ...(extracted.is_returning != null && { is_returning_raw: extracted.is_returning }),
    },
    ...(extracted.garment_type != null && { garment_type: extracted.garment_type }),
    ...(extracted.fabric_pref != null && { fabric_pref: extracted.fabric_pref }),
    ...(extracted.deadline != null && { deadline: extracted.deadline }),
    ...(extracted.is_returning != null && { is_returning: extracted.is_returning }),
  }

  // 7. Mark qualified when reaching DONE
  if (newState === 'DONE') {
    updatePayload.status = 'qualified'
    updatePayload.qualified_at = new Date().toISOString()
  }

  await supabase.from('leads').update(updatePayload).eq('id', leadId)

  return {
    reply: parsed.reply,
    newState,
    qualified: newState === 'DONE',
  }
}
