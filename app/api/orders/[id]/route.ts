import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { requireAuth, json } from '@/lib/api/require-auth'

const ALLOWED_FIELDS = ['agreed_price', 'fabric_details', 'promised_date', 'notes', 'deposit_paid'] as const
type AllowedField = (typeof ALLOWED_FIELDS)[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const shopId  = process.env.SHOP_ID!
  const orderId = params.id

  const body = await request.json() as Partial<Record<AllowedField, unknown>>

  const patch: Partial<Record<AllowedField, unknown>> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in body) patch[field] = body[field]
  }

  if (Object.keys(patch).length === 0) {
    return json({ error: 'No valid fields provided' }, 400)
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update(patch)
    .eq('id', orderId)
    .eq('shop_id', shopId)

  if (error) return json({ error: 'Failed to update order' }, 500)

  return json({ ok: true })
}
