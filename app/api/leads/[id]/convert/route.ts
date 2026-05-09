import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { notifyCustomerStageChange } from '@/lib/notify/customer'
import { requireAuth, json } from '@/lib/api/require-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const shopId = process.env.SHOP_ID!
  const leadId = params.id
  const db     = supabaseAdmin

  // Fetch lead — must belong to this shop and be qualified
  const { data: lead } = await db
    .from('leads')
    .select('id, status, customer_id')
    .eq('id', leadId)
    .eq('shop_id', shopId)
    .single()

  if (!lead)                         return json({ error: 'Lead not found' }, 404)
  if (lead.status !== 'qualified')   return json({ error: 'Lead is not qualified' }, 400)

  const body = await request.json() as {
    garment_type:  string
    fabric_details?: string
    agreed_price?: number
    promised_date?: string
  }

  if (!body.garment_type) return json({ error: 'garment_type is required' }, 400)

  // Fetch customer phone and shop name for notification
  const [{ data: customer }, { data: shop }] = await Promise.all([
    db.from('customers').select('phone').eq('id', lead.customer_id).single(),
    db.from('shops').select('name').eq('id', shopId).single(),
  ])

  // INSERT order
  const { data: order, error: orderErr } = await db
    .from('orders')
    .insert({
      shop_id:       shopId,
      customer_id:   lead.customer_id,
      lead_id:       leadId,
      garment_type:  body.garment_type,
      fabric_details: body.fabric_details ?? null,
      agreed_price:  body.agreed_price   ?? null,
      promised_date: body.promised_date  ?? null,
      stage:         'confirmed',
    })
    .select('id')
    .single()

  if (orderErr || !order) return json({ error: 'Failed to create order' }, 500)

  // INSERT stage_event
  const { data: stageEvent } = await db
    .from('stage_events')
    .insert({ order_id: order.id, from_stage: null, to_stage: 'confirmed' })
    .select('id')
    .single()

  // UPDATE lead — close followup sequence
  await db
    .from('leads')
    .update({ status: 'converted', followup_stage: 'done', followup_paused: true })
    .eq('id', leadId)

  // Notify customer; update stage_event.customer_notified
  if (customer && shop) {
    const notified = await notifyCustomerStageChange({
      customerPhone: customer.phone,
      stage:         'confirmed',
      shopName:      shop.name,
    })

    if (notified && stageEvent) {
      await db
        .from('stage_events')
        .update({ customer_notified: true })
        .eq('id', stageEvent.id)
    }
  }

  return json({ orderId: order.id })
}
