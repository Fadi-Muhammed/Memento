import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { CustomerInfoEditor } from '@/components/customers/customer-info-editor'
import { MeasurementsEditor } from '@/components/customers/measurements-editor'

const STAGE_STYLES: Record<string, string> = {
  confirmed: 'bg-blue-50 text-blue-700',
  cut:       'bg-amber-50 text-amber-700',
  stitched:  'bg-orange-50 text-orange-700',
  fitting:   'bg-purple-50 text-purple-700',
  ready:     'bg-green-50 text-green-700',
  picked_up: 'bg-surface-2 text-text-tertiary',
}

function formatMessageTime(dateStr: string): string {
  const d   = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function CustomerProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const shopId     = process.env.SHOP_ID!
  const customerId = params.id

  const [{ data: customer }, { data: orders }, { data: messages }] = await Promise.all([
    supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('shop_id', shopId)
      .single(),

    supabaseAdmin
      .from('orders')
      .select('id, garment_type, stage, agreed_price, promised_date')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false }),

    supabaseAdmin
      .from('messages')
      .select('id, direction, sender, body, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true }),
  ])

  if (!customer) notFound()

  const measurements = (customer.measurements ?? {}) as Record<string, number>

  return (
    <div className="space-y-4 animate-fade-up">
      <Link
        href="/customers"
        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        ← Customers
      </Link>

      {/* Section 1 — Editable header */}
      <Card>
        <CardHeader>
          <h1 className="text-base font-semibold text-text-primary">
            {customer.name ?? customer.phone}
          </h1>
        </CardHeader>
        <CardBody>
          <CustomerInfoEditor
            customerId={customerId}
            name={customer.name}
            phone={customer.phone}
            email={customer.email}
          />
        </CardBody>
      </Card>

      {/* Section 2 — Measurements & preferences */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-text-primary">Measurements & Preferences</h2>
        </CardHeader>
        <CardBody>
          <MeasurementsEditor
            customerId={customerId}
            measurements={measurements}
            fabric_preferences={customer.fabric_preferences}
            notes={customer.notes}
          />
        </CardBody>
      </Card>

      {/* Section 3 — Past orders */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-text-primary">
            Orders ({orders?.length ?? 0})
          </h2>
        </CardHeader>
        {orders?.length ? (
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-surface-1 transition-colors duration-base"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {order.garment_type}
                  </p>
                  {order.promised_date && (
                    <p className="text-xs text-text-tertiary">Due {order.promised_date}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {order.agreed_price != null && (
                    <span className="text-xs font-medium text-text-secondary">
                      QAR {Number(order.agreed_price).toFixed(0)}
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STAGE_STYLES[order.stage] ?? 'bg-surface-2 text-text-tertiary'}`}>
                    {order.stage.replace('_', ' ')}
                  </span>
                  <span className="text-text-tertiary text-sm">›</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <CardBody>
            <p className="text-sm text-text-tertiary">No orders yet</p>
          </CardBody>
        )}
      </Card>

      {/* Section 4 — Message history */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-text-primary">
            Messages ({messages?.length ?? 0})
          </h2>
        </CardHeader>
        <CardBody>
          {!messages?.length ? (
            <p className="text-sm text-text-tertiary">No messages yet</p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto -mx-4 px-4">
              {messages.map((msg) => {
                const isIncoming = msg.direction === 'in'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-0.5 ${isIncoming ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                        isIncoming
                          ? 'bg-surface-2 text-text-primary rounded-tl-sm'
                          : 'bg-[--accent] text-white rounded-tr-sm'
                      }`}
                    >
                      {msg.body}
                    </div>
                    <p className="text-[10px] text-text-tertiary px-1">
                      {msg.sender} · {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
