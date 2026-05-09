import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { requireAuth, json } from '@/lib/api/require-auth'

const ALLOWED_FIELDS = ['name', 'email', 'measurements', 'fabric_preferences', 'notes'] as const
type AllowedField = (typeof ALLOWED_FIELDS)[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const shopId     = process.env.SHOP_ID!
  const customerId = params.id

  const body = await request.json() as Partial<Record<AllowedField, unknown>>

  const patch: Partial<Record<AllowedField, unknown>> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in body) patch[field] = body[field]
  }

  if (Object.keys(patch).length === 0) {
    return json({ error: 'No valid fields provided' }, 400)
  }

  const { error } = await supabaseAdmin
    .from('customers')
    .update(patch)
    .eq('id', customerId)
    .eq('shop_id', shopId)

  if (error) return json({ error: 'Failed to update customer' }, 500)

  return json({ ok: true })
}
