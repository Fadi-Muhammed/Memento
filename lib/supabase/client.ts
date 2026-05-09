'use client'

import { createBrowserClient } from '@supabase/ssr'

// For client components — uses the anon key, subject to RLS
// Used only for auth flows (magic-link sign-in). Never for data queries.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
