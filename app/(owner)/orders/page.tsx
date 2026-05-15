import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { OrderTabs } from '@/components/orders/order-tabs'
import { cn } from '@/lib/utils'

const STAGE_STYLES: Record<string, string> = {
  confirmed: 'bg-blue-50 text-blue-700',
  cut:       'bg-amber-50 text-amber-700',
  stitched:  'bg-orange-50 text-orange-700',
  fitting:   'bg-purple-50 text-purple-700',
  ready:     'bg-green-50 text-green-700',
  picked_up: 'bg-surface-2 text-text-tertiary',
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const shopId = process.env.SHOP_ID!
  const filter = searchParams.filter ?? ''

  let query = supabaseAdmin
    .from('orders')
    .select('id, garment_type, stage, agreed_price, promised_date, customer:customers(id, name, phone)')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (filter === 'active')   query = query.neq('stage', 'picked_up')
  else if (filter === 'ready') query = query.eq('stage', 'ready')
  else if (filter === 'done')  query = query.eq('stage', 'picked_up')

  const { data: orders } = await query

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-xl font-semibold text-text-primary">Orders</h1>

      <OrderTabs />

      {!orders?.length ? (
        <p className="text-sm text-text-tertiary py-8 text-center">No orders found</p>
      ) : (
        <Card variant="flat" className="divide-y divide-border overflow-hidden">
          {orders.map((order) => {
            const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer
            const display  = customer?.name ?? customer?.phone ?? '—'

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-surface-1 transition-colors duration-base"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-text-primary truncate">{display}</p>
                  <p className="text-xs text-text-tertiary truncate">
                    {[
                      order.garment_type,
                      order.promised_date ? `Due ${order.promised_date}` : null,
                    ].filter(Boolean).join(' · ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {order.agreed_price != null && (
                    <span className="text-xs text-text-secondary hidden sm:block">
                      QAR {Number(order.agreed_price).toFixed(0)}
                    </span>
                  )}
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                    STAGE_STYLES[order.stage] ?? 'bg-surface-2 text-text-tertiary'
                  )}>
                    {order.stage.replace('_', ' ')}
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
