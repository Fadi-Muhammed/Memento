import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { runFollowupCron } from '@/lib/followups/scheduler'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const auth       = request.headers.get('authorization')

  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await runFollowupCron(supabaseAdmin)
    return NextResponse.json({ ran: true, timestamp: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[cron/followups]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
