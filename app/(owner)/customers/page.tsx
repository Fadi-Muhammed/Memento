import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { CustomerSearch } from '@/components/customers/customer-search'
import { timeAgo } from '@/lib/utils'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const shopId = process.env.SHOP_ID!
  const q = searchParams.q?.trim() ?? ''

  let query = supabaseAdmin
    .from('customers')
    .select('id, phone, name, last_contact_at, lifetime_value')
    .eq('shop_id', shopId)
    .order('last_contact_at', { ascending: false })

  if (q) {
    query = query.ilike('phone', `%${q}%`)
  }

  const { data: customers } = await query

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-xl font-semibold text-text-primary">Customers</h1>

      <CustomerSearch />

      {!customers?.length ? (
        <p className="text-sm text-text-tertiary py-8 text-center">
          {q ? `No customers matching "${q}"` : 'No customers yet'}
        </p>
      ) : (
        <Card variant="flat" className="divide-y divide-border overflow-hidden">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-surface-1 transition-colors duration-base"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-text-primary truncate">
                  {c.name ?? '—'}
                </p>
                <p className="text-xs text-text-tertiary">{c.phone}</p>
              </div>

              <div className="flex flex-col items-end shrink-0 ml-3 gap-0.5">
                <p className="text-xs font-medium text-text-primary">
                  QAR {Number(c.lifetime_value).toFixed(0)}
                </p>
                <p className="text-xs text-text-tertiary">{timeAgo(c.last_contact_at)}</p>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
