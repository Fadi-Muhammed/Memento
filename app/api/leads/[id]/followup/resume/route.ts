import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { requireAuth, json } from '@/lib/api/require-auth'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const shopId = process.env.SHOP_ID!
  const leadId = params.id

  // Only qualified leads may have their followup sequence resumed
  const { data: lead } = await supabaseAdmin
    .from('leads')
    .select('status')
    .eq('id', leadId)
    .eq('shop_id', shopId)
    .single()

  if (!lead)                       return json({ error: 'Lead not found' }, 404)
  if (lead.status !== 'qualified') return json({ error: 'Only qualified leads can be resumed' }, 400)

  const { error } = await supabaseAdmin
    .from('leads')
    .update({ followup_paused: false })
    .eq('id', leadId)

  if (error) return json({ error: 'Failed to resume followup' }, 500)

  return json({ ok: true })
}
