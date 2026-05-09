import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { requireAuth, json } from '@/lib/api/require-auth'

const STAGES = ['confirmed', 'cut', 'stitched', 'fitting', 'ready', 'picked_up'] as const
type Stage = (typeof STAGES)[number]

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const shopId  = process.env.SHOP_ID!
  const orderId = params.id
  const db      = supabaseAdmin

  const { data: order } = await db
    .from('orders')
    .select('id, stage')
    .eq('id', orderId)
    .eq('shop_id', shopId)
    .single()

  if (!order) return json({ error: 'Order not found' }, 404)
  if (order.stage === 'confirmed') return json({ error: 'Order is already at the first stage' }, 400)

  const currentIdx = STAGES.indexOf(order.stage as Stage)
  if (currentIdx <= 0) return json({ error: 'Unknown stage' }, 500)

  const prevStage = STAGES[currentIdx - 1]

  await db
    .from('orders')
    .update({ stage: prevStage, completed_at: null })
    .eq('id', orderId)

  await db
    .from('stage_events')
    .insert({ order_id: orderId, from_stage: order.stage, to_stage: prevStage })

  return json({ stage: prevStage })
}
