import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { StatusTabs } from '@/components/leads/status-tabs'
import { cn, timeAgo } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  new:        'bg-blue-50 text-blue-700',
  qualifying: 'bg-amber-50 text-amber-700',
  qualified:  'bg-green-50 text-green-700',
  converted:  'bg-indigo-50 text-indigo-700',
  lost:       'bg-surface-2 text-text-tertiary',
}

const VALID_STATUSES = ['new', 'qualifying', 'qualified', 'converted', 'lost']

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const shopId = process.env.SHOP_ID!
  const status = searchParams.status ?? ''

  let query = supabaseAdmin
    .from('leads')
    .select('id, status, garment_type, deadline, created_at, customer:customers(id, name, phone)')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (status && VALID_STATUSES.includes(status)) {
    query = query.eq('status', status)
  }

  const { data: leads } = await query

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-xl font-semibold text-text-primary">Leads</h1>

      <StatusTabs />

      {!leads?.length ? (
        <p className="text-sm text-text-tertiary py-8 text-center">No leads found</p>
      ) : (
        <Card variant="flat" className="divide-y divide-border overflow-hidden">
          {leads.map((lead) => {
            const customer = Array.isArray(lead.customer)
              ? lead.customer[0]
              : lead.customer
            const display = customer?.name ?? customer?.phone ?? '—'

            return (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-surface-1 transition-colors duration-base"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-text-primary truncate">{display}</p>
                  <p className="text-xs text-text-tertiary truncate">
                    {[lead.garment_type, lead.deadline].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                      STATUS_STYLES[lead.status] ?? 'bg-surface-2 text-text-tertiary'
                    )}
                  >
                    {lead.status}
                  </span>
                  <span className="text-xs text-text-tertiary hidden sm:block">
                    {timeAgo(lead.created_at)}
                  </span>
                  <span className="text-text-tertiary text-sm">›</span>
                </div>
              </Link>
            )
          })}
        </Card>
      )}
    </div>
  )
}
