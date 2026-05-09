import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type AuthResult =
  | { ok: true }
  | { ok: false; response: NextResponse }

export async function requireAuth(): Promise<AuthResult> {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { ok: true }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}
