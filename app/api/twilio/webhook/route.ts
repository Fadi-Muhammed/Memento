import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendFreeform } from '@/lib/twilio/send'
import { advanceLeadBot } from '@/lib/bot/state-machine'
import { notifyOwner } from '@/lib/notify/owner'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const EMPTY_TWIML = '<Response></Response>'

function twimlOk() {
  return new NextResponse(EMPTY_TWIML, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

// ─────────────────────────────────────────────
// POST /api/twilio/webhook
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const shopId    = process.env.SHOP_ID!

  // Read form body once — Twilio sends application/x-www-form-urlencoded
  const formData = await request.formData()
  const params: Record<string, string> = {}
  formData.forEach((value, key) => { params[key] = String(value) })

  // ── 1. Validate Twilio signature ─────────────────────────────────────────
  if (!authToken) {
    console.error('webhook: TWILIO_AUTH_TOKEN is not set')
    return twimlOk()
  }

  const sig = request.headers.get('x-twilio-signature') ?? ''
  // Allow explicit override for local dev (e.g. ngrok URL).
  // On Vercel, request.url is the correct public URL.
  const webhookUrl = process.env.TWILIO_WEBHOOK_BASE_URL
    ? `${process.env.TWILIO_WEBHOOK_BASE_URL}/api/twilio/webhook`
    : request.url

  if (!twilio.validateRequest(authToken, sig, webhookUrl, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ── 2. Parse fields ───────────────────────────────────────────────────────
  const from       = params['From']       ?? ''
  const body       = params['Body']       ?? ''
  const messageSid = params['MessageSid'] ?? ''

  if (!from) return twimlOk()

  const db = supabaseAdmin

  try {
    // ── 3-4. Look up or create customer ──────────────────────────────────────
    const { data: existingCustomer } = await db
      .from('customers')
      .select('id, phone, name')
      .eq('shop_id', shopId)
      .eq('phone', from)
      .maybeSingle()

    let customer: { id: string; phone: string; name: string | null }

    if (existingCustomer) {
      customer = existingCustomer
    } else {
      const { data: newCustomer, error: insertErr } = await db
        .from('customers')
        .insert({ shop_id: shopId, phone: from })
        .select('id, phone, name')
        .single()

      if (insertErr || !newCustomer) {
        console.error('webhook: customer insert failed', insertErr)
        return twimlOk()
      }
      customer = newCustomer
    }

    // ── 5. Touch last_contact_at ──────────────────────────────────────────────
    await db
      .from('customers')
      .update({ last_contact_at: new Date().toISOString() })
      .eq('id', customer.id)

    // ── 6. Insert inbound message (idempotent on whatsapp_message_id) ─────────
    await db.from('messages').upsert(
      {
        shop_id:             shopId,
        customer_id:         customer.id,
        whatsapp_message_id: messageSid,
        direction:           'in',
        sender:              'customer',
        body,
      },
      { onConflict: 'whatsapp_message_id', ignoreDuplicates: true }
    )

    // ── 7. Check bot_enabled ──────────────────────────────────────────────────
    const { data: shop } = await db
      .from('shops')
      .select('bot_enabled')
      .eq('id', shopId)
      .single()

    if (!shop?.bot_enabled) {
      const ownerPhone = process.env.SHOP_OWNER_PHONE
      if (ownerPhone) {
        await sendFreeform(
          ownerPhone,
          `📩 Message from ${customer.name ?? customer.phone} (bot is off):\n"${body}"`
        ).catch((err) => console.error('webhook: owner ping failed', err))
      }
      return twimlOk()
    }

    // ── 8. Find most recent active lead for this customer ─────────────────────
    const { data: activeLead } = await db
      .from('leads')
      .select('id')
      .eq('shop_id', shopId)
      .eq('customer_id', customer.id)
      .in('status', ['new', 'qualifying'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // ── 9. Create lead if none exists ─────────────────────────────────────────
    let leadId: string

    if (activeLead) {
      leadId = activeLead.id
    } else {
      const { data: newLead, error: leadErr } = await db
        .from('leads')
        .insert({ shop_id: shopId, customer_id: customer.id, status: 'qualifying', source: 'meta_ad' })
        .select('id')
        .single()

      if (leadErr || !newLead) {
        console.error('webhook: lead insert failed', leadErr)
        return twimlOk()
      }
      leadId = newLead.id
    }

    // ── 10. Advance bot ───────────────────────────────────────────────────────
    let reply     = "Thanks for reaching out! We'll be in touch shortly."
    let qualified = false

    try {
      const result = await advanceLeadBot({ leadId, customerMessage: body, supabase: db })
      reply     = result.reply
      qualified = result.qualified
    } catch (botErr) {
      // 12. Bot threw — static fallback, log, continue to send
      console.error('webhook: advanceLeadBot failed', botErr)
    }

    // Send reply outbound
    const outSid = await sendFreeform(from, reply).catch((err) => {
      console.error('webhook: sendFreeform failed', err)
      return null
    })

    // Insert outbound message row
    if (outSid) {
      await db.from('messages').insert({
        shop_id:             shopId,
        customer_id:         customer.id,
        whatsapp_message_id: outSid,
        direction:           'out',
        sender:              'bot',
        body:                reply,
      })
    }

    // ── 11. Notify owner on qualification ─────────────────────────────────────
    if (qualified) {
      const { data: freshLead } = await db
        .from('leads')
        .select('id, garment_type, fabric_pref, deadline, is_returning')
        .eq('id', leadId)
        .single()

      if (freshLead) {
        await notifyOwner({ ...freshLead, customer }).catch((err) =>
          console.error('webhook: notifyOwner failed', err)
        )
      }
    }
  } catch (err) {
    console.error('webhook: unhandled error', err)
  }

  // ── 13. Always return valid TwiML ─────────────────────────────────────────
  return twimlOk()
}
