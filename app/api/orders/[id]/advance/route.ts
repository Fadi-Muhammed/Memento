import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { notifyCustomerStageChange } from '@/lib/notify/customer'
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
    .select('id, stage, customer_id')
    .eq('id', orderId)
    .eq('shop_id', shopId)
    .single()

  if (!order) return json({ error: 'Order not found' }, 404)
  if (order.stage === 'picked_up') return json({ error: 'Order is already complete' }, 400)

  const currentIdx = STAGES.indexOf(order.stage as Stage)
  if (currentIdx === -1) return json({ error: 'Unknown stage' }, 500)

  const nextStage = STAGES[currentIdx + 1]

  // UPDATE order; set completed_at when reaching picked_up
  const updatePayload: Record<string, unknown> = { stage: nextStage }
  if (nextStage === 'picked_up') updatePayload.completed_at = new Date().toISOString()

  await db.from('orders').update(updatePayload).eq('id', orderId)

  // INSERT stage_event
  const { data: stageEvent } = await db
    .from('stage_events')
    .insert({ order_id: orderId, from_stage: order.stage, to_stage: nextStage })
    .select('id')
    .single()

  // Notify customer for fitting and ready stages
  const notifyStages: Stage[] = ['fitting', 'ready']
  if (notifyStages.includes(nextStage)) {
    const [{ data: customer }, { data: shop }] = await Promise.all([
      db.from('customers').select('phone').eq('id', order.customer_id).single(),
      db.from('shops').select('name').eq('id', shopId).single(),
    ])

    if (customer && shop) {
      const notified = await notifyCustomerStageChange({
        customerPhone: customer.phone,
        stage:         nextStage,
        shopName:      shop.name,
      })

      if (notified && stageEvent) {
        await db
          .from('stage_events')
          .update({ customer_notified: true })
          .eq('id', stageEvent.id)
      }
    }
  }

  return json({ stage: nextStage })
}
