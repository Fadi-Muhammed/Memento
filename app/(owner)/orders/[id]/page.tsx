import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { OrderInfoEditor } from '@/components/orders/order-info-editor'
import { StageControl } from '@/components/orders/stage-control'

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const shopId  = process.env.SHOP_ID!
  const orderId = params.id

  const [{ data: order }, { data: stageEvents }] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('*, customer:customers(id, name, phone)')
      .eq('id', orderId)
      .eq('shop_id', shopId)
      .single(),

    supabaseAdmin
      .from('stage_events')
      .select('id, from_stage, to_stage, changed_at, customer_notified')
      .eq('order_id', orderId)
      .order('changed_at', { ascending: false }),
  ])

  if (!order) notFound()

  const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer

  return (
    <div className="space-y-4 animate-fade-up">
      <Link
        href="/orders"
        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        ← Orders
      </Link>

      {/* Section 1 — Order info (editable) */}
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-base font-semibold text-text-primary">{order.garment_type}</h1>
            {customer && (
              <p className="text-xs text-text-tertiary mt-0.5">
                {customer.name ?? customer.phone}
              </p>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <OrderInfoEditor
            orderId={orderId}
            agreedPrice={order.agreed_price}
            fabricDetails={order.fabric_details}
            promisedDate={order.promised_date}
            notes={order.notes}
          />
        </CardBody>
      </Card>

      {/* Section 2 — Stage control */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-text-primary">Stage</h2>
        </CardHeader>
        <CardBody>
          <StageControl orderId={orderId} stage={order.stage} />
        </CardBody>
      </Card>

      {/* Section 3 — Stage history */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-text-primary">
            History ({stageEvents?.length ?? 0})
          </h2>
        </CardHeader>
        {stageEvents?.length ? (
          <div className="divide-y divide-border">
            {stageEvents.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between px-4 py-3">
                <div className="space-y-0.5">
                  <p className="text-sm text-text-primary capitalize">
                    {ev.from_stage
                      ? `${ev.from_stage.replace('_', ' ')} → ${ev.to_stage.replace('_', ' ')}`
                      : `Started at ${ev.to_stage.replace('_', ' ')}`}
                  </p>
                  <p className="text-xs text-text-tertiary">{formatDate(ev.changed_at)}</p>
                </div>
                {ev.customer_notified && (
                  <span className="text-xs text-green-600 shrink-0 ml-3">Notified</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <CardBody>
            <p className="text-sm text-text-tertiary">No history yet</p>
          </CardBody>
        )}
      </Card>

      {/* Section 4 — Customer link */}
      {customer && (
        <Card>
          <CardBody>
            <Link
              href={`/customers/${customer.id}`}
              className="flex items-center justify-between group"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-text-primary">
                  {customer.name ?? '—'}
                </p>
                <p className="text-xs text-text-tertiary">{customer.phone}</p>
              </div>
              <span className="text-text-tertiary group-hover:text-text-primary transition-colors text-sm">›</span>
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
