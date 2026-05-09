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

  const { error } = await supabaseAdmin
    .from('leads')
    .update({ followup_paused: true })
    .eq('id', leadId)
    .eq('shop_id', shopId)

  if (error) return json({ error: 'Failed to pause followup' }, 500)

  return json({ ok: true })
}
