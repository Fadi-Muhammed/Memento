import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { requireAuth, json } from '@/lib/api/require-auth'

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const shopId = process.env.SHOP_ID!

  const body = await request.json() as { enabled?: unknown }

  if (typeof body.enabled !== 'boolean') {
    return json({ error: 'enabled must be a boolean' }, 400)
  }

  const { error } = await supabaseAdmin
    .from('shops')
    .update({ bot_enabled: body.enabled })
    .eq('id', shopId)

  if (error) return json({ error: 'Failed to update shop' }, 500)

  return json({ ok: true })
}
