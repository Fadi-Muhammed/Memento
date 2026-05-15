/**
 * Smoke tests — Node built-in test runner (no Jest/Vitest).
 * Run with: npm test
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

// ─── Shared chain factory ─────────────────────────────────────────────────────

/** Returns a chainable Supabase-style builder that resolves to { data, error: null }. */
function makeChain(data: any = null): any {
  const c: any = {}
  const noop = () => c
  for (const m of ['select', 'eq', 'neq', 'in', 'or', 'gte', 'limit', 'order']) c[m] = noop
  c.maybeSingle = async () => ({ data, error: null })
  c.single      = async () => ({ data, error: null })
  c.update      = noop
  c.upsert      = noop
  c.insert      = async () => ({ data: null, error: null })
  c.then        = (resolve: any) => Promise.resolve({ data, error: null }).then(resolve)
  return c
}

// ─── Test 1: Webhook upserts the inbound message row ─────────────────────────

test('webhook upserts inbound message with direction=in and correct message SID', async () => {
  process.env.SHOP_ID                        = 'shop-1'
  process.env.TWILIO_AUTH_TOKEN              = 'test-token'
  // Supabase client validates the URL at instantiation time (module load)
  process.env.NEXT_PUBLIC_SUPABASE_URL       ??= 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  ??= 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY      ??= 'test-service-role-key'

  // ── Patch twilio.validateRequest on the shared CJS singleton ─────────────
  // Both this test and the route get the same cached require('twilio') object.
  const twilioMod = await import('twilio') as any
  const twilioDefault = twilioMod.default ?? twilioMod
  const origValidate = twilioDefault.validateRequest
  twilioDefault.validateRequest = () => true

  // ── Patch supabaseAdmin.from on the shared singleton ─────────────────────
  // bot_enabled=false causes an early return *after* the messages upsert —
  // so we get the assertion we need without having to mock sendFreeform/bot.
  const upsertRows: any[] = []
  const mockCustomer = { id: 'cust-1', phone: 'whatsapp:+9745551234', name: 'Hamood' }

  const { supabaseAdmin } = await import('@/lib/supabase/server')
  const origFrom = (supabaseAdmin as any).from?.bind(supabaseAdmin)

  ;(supabaseAdmin as any).from = (table: string) => {
    if (table === 'customers') return makeChain(mockCustomer)
    if (table === 'shops')     return makeChain({ bot_enabled: false }) // early-exit path
    if (table === 'messages') {
      const c = makeChain(null)
      c.upsert = (row: any) => { upsertRows.push({ ...row, _table: table }); return c }
      return c
    }
    return makeChain(null)
  }

  try {
    const { POST }        = await import('@/app/api/twilio/webhook/route')
    const { NextRequest } = await import('next/server')

    const formBody = new URLSearchParams({
      From:       'whatsapp:+9745551234',
      Body:       'I need a kandura',
      MessageSid: 'SMsmoke001',
    }).toString()

    const res = await POST(
      new NextRequest('http://localhost/api/twilio/webhook', {
        method:  'POST',
        headers: {
          'content-type':       'application/x-www-form-urlencoded',
          'x-twilio-signature': 'dummy-sig',
        },
        body: formBody,
      })
    )

    assert.equal(res.status, 200, 'always returns 200 TwiML')

    const msgRow = upsertRows.find((r) => r._table === 'messages')
    assert.ok(msgRow,                                        'messages table received an upsert')
    assert.equal(msgRow.direction,             'in',         'direction is in')
    assert.equal(msgRow.whatsapp_message_id,   'SMsmoke001', 'correct whatsapp_message_id')
    assert.equal(msgRow.sender,                'customer',   'sender is customer')
  } finally {
    // Restore originals to avoid polluting other tests
    twilioDefault.validateRequest = origValidate
    ;(supabaseAdmin as any).from = origFrom
  }
})

// ─── Test 2: Follow-up scheduler sends 2h freeform ───────────────────────────

test('runFollowupCron calls sendFreeform once for a lead 3h past qualified_at with followup_stage=none', async () => {
  process.env.SHOP_ID = 'shop-1'

  // Lead that qualified 3 hours ago — the 2h followup is due
  const qualifiedAt = new Date(Date.now() - 3 * 3_600_000).toISOString()

  const lead = {
    id:             'lead-smoke-1',
    customer_id:    'cust-smoke-1',
    followup_stage: 'none',
    qualified_at:   qualifiedAt,
    garment_type:   'kandura',
    customer: { id: 'cust-smoke-1', phone: '+9745551234', name: 'Alice' },
  }

  const followupInserts: any[] = []
  let leadsFromCalls = 0

  const fakeSupabase: any = {
    from: (table: string) => {
      if (table === 'leads') {
        leadsFromCalls++
        return leadsFromCalls === 1 ? makeChain([lead]) : makeChain(null) // 1st=SELECT, rest=UPDATE
      }
      if (table === 'messages')       return makeChain([]) // no activity → not paused
      if (table === 'followup_events') {
        const c = makeChain(null)
        c.insert = async (row: any) => {
          followupInserts.push({ ...row, _table: table })
          return { data: null, error: null }
        }
        return c
      }
      return makeChain(null)
    },
  }

  // Inject fake send functions — no module mocking needed
  let sendFreeformCalls = 0
  const fakeDeps = {
    sendFreeform:  async (_phone: string) => { sendFreeformCalls++; return 'SMfollowup' },
    sendTemplate:  async () => 'SMtmpl',
  }

  const { runFollowupCron } = await import('@/lib/followups/scheduler')
  await runFollowupCron(fakeSupabase, fakeDeps as any)

  assert.equal(sendFreeformCalls, 1, 'sendFreeform called exactly once')

  const ev = followupInserts.find((r) => r._table === 'followup_events')
  assert.ok(ev,                    'followup_events row was inserted')
  assert.equal(ev.stage,  '2h',   'stage is 2h')
  assert.equal(ev.status, 'sent', 'status is sent')
})
