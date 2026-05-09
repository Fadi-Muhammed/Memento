import type { SupabaseClient } from '@supabase/supabase-js'
import { sendFreeform, sendTemplate, WA_WINDOW_CLOSED, TEMPLATE_PENDING } from '@/lib/twilio/send'
import { FOLLOWUP_TEMPLATES, FOLLOWUP_2H_MESSAGE } from './templates'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type LeadFollowupStage = 'none' | 'sent_2h' | 'sent_24h'
type SendStage = '2h' | '24h' | '72h'

interface Transition {
  dueHours:  number
  sendStage: SendStage
  nextStage: string
}

interface LeadRow {
  id:             string
  customer_id:    string
  followup_stage: string
  qualified_at:   string | null
  garment_type:   string | null
  customer:       { id: string; phone: string; name: string | null } | null
}

// ─────────────────────────────────────────────
// Stage transition map
// ─────────────────────────────────────────────

const TRANSITIONS: Record<LeadFollowupStage, Transition> = {
  none:     { dueHours: 2,  sendStage: '2h',  nextStage: 'sent_2h'  },
  sent_2h:  { dueHours: 24, sendStage: '24h', nextStage: 'sent_24h' },
  sent_24h: { dueHours: 72, sendStage: '72h', nextStage: 'sent_72h' },
}

// ─────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────

export async function runFollowupCron(supabase: SupabaseClient): Promise<void> {
  const shopId = process.env.SHOP_ID!

  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      id, customer_id, followup_stage, qualified_at, garment_type,
      customer:customers(id, phone, name)
    `)
    .eq('shop_id', shopId)
    .eq('status', 'qualified')
    .eq('followup_paused', false)
    .in('followup_stage', ['none', 'sent_2h', 'sent_24h'])

  if (error) {
    console.error('[followup-cron] Failed to fetch leads:', error)
    return
  }

  for (const raw of leads ?? []) {
    const lead = raw as unknown as LeadRow
    try {
      await processLead(supabase, lead)
    } catch (err) {
      console.error(`[followup-cron] Unhandled error for lead ${lead.id}:`, err)
    }
  }
}

// ─────────────────────────────────────────────
// Per-lead processing
// ─────────────────────────────────────────────

async function processLead(supabase: SupabaseClient, lead: LeadRow): Promise<void> {
  const transition = TRANSITIONS[lead.followup_stage as LeadFollowupStage]
  if (!transition || !lead.qualified_at) return

  // ── 1. Due-time check ────────────────────────────────────────────────────
  const elapsedHours = (Date.now() - new Date(lead.qualified_at).getTime()) / 3_600_000
  if (elapsedHours < transition.dueHours) return

  // ── 2. Active conversation check (customer reply or owner message) ────────
  const { data: activity } = await supabase
    .from('messages')
    .select('id')
    .eq('customer_id', lead.customer_id)
    .gte('created_at', lead.qualified_at)
    .or('direction.eq.in,sender.eq.owner')
    .limit(1)

  if ((activity ?? []).length > 0) {
    await supabase.from('leads').update({ followup_paused: true }).eq('id', lead.id)
    return
  }

  // ── 3. Resolve customer ───────────────────────────────────────────────────
  const customer = Array.isArray(lead.customer) ? lead.customer[0] : lead.customer
  if (!customer?.phone) {
    console.error(`[followup-cron] No customer data for lead ${lead.id}`)
    return
  }

  const displayName = customer.name ?? customer.phone
  const garment     = lead.garment_type ?? 'garment'

  // ── 4. Attempt send ───────────────────────────────────────────────────────
  let sendErr: Error | null = null
  let eventStatus: string   = 'sent'

  try {
    if (transition.sendStage === '2h') {
      await sendFreeform(customer.phone, FOLLOWUP_2H_MESSAGE(displayName, garment))
    } else {
      const tmpl = FOLLOWUP_TEMPLATES[transition.sendStage]
      await sendTemplate(customer.phone, tmpl.name, tmpl.variables(displayName, garment))
    }
  } catch (err) {
    sendErr = err as Error
    eventStatus =
      err instanceof WA_WINDOW_CLOSED || err instanceof TEMPLATE_PENDING
        ? 'skipped_template_pending'
        : 'error'
  }

  // ── 5. Log followup_event ─────────────────────────────────────────────────
  const templateName =
    transition.sendStage === '2h'
      ? null
      : FOLLOWUP_TEMPLATES[transition.sendStage].name

  await supabase.from('followup_events').insert({
    lead_id:       lead.id,
    stage:         transition.sendStage,
    channel:       'whatsapp',
    template_name: templateName,
    status:        eventStatus,
    error:         sendErr?.message ?? null,
  })

  // ── 6. On success: advance followup_stage ────────────────────────────────
  if (eventStatus === 'sent') {
    await supabase
      .from('leads')
      .update({
        followup_stage:        transition.nextStage,
        last_followup_sent_at: new Date().toISOString(),
      })
      .eq('id', lead.id)
      .eq('followup_stage', lead.followup_stage) // optimistic: no-op if another instance raced
    return
  }

  // ── 7. On failure: count total failures for this stage; pause if >= 3 ────
  const { count } = await supabase
    .from('followup_events')
    .select('id', { count: 'exact', head: true })
    .eq('lead_id', lead.id)
    .eq('stage', transition.sendStage)
    .neq('status', 'sent')

  if ((count ?? 0) >= 3) {
    await supabase.from('leads').update({ followup_paused: true }).eq('id', lead.id)
  }
}
