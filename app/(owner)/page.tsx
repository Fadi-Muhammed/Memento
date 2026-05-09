import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Card, CardBody } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { BotToggle } from '@/components/bot-toggle'

export default async function TodayPage() {
  const shopId = process.env.SHOP_ID!
  const twentyFourHoursAgo = new Date(Date.now() - 86_400_000).toISOString()
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0]

  const [
    { count: newLeads },
    { count: dueThisWeek },
    { count: readyPickup },
    { data: shop },
  ] = await Promise.all([
    supabaseAdmin
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .in('status', ['new', 'qualifying'])
      .gte('created_at', twentyFourHoursAgo),

    supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .neq('stage', 'picked_up')
      .gte('promised_date', today)
      .lte('promised_date', nextWeek),

    supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .eq('stage', 'ready'),

    supabaseAdmin
      .from('shops')
      .select('bot_enabled')
      .eq('id', shopId)
      .single(),
  ])

  const stats = [
    { label: 'New Leads (24h)', value: newLeads ?? 0 },
    { label: 'Due This Week',   value: dueThisWeek ?? 0 },
    { label: 'Ready for Pickup', value: readyPickup ?? 0 },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="text-xl font-semibold text-text-primary">Today</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value }, i) => (
          <Card
            key={label}
            className={i === 2 ? 'col-span-2 sm:col-span-1' : undefined}
          >
            <CardBody className="space-y-1">
              <p className="text-xs text-text-secondary">{label}</p>
              <p className="text-2xl font-semibold text-text-primary tabular-nums">{value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <BotToggle initialEnabled={shop?.bot_enabled ?? true} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/leads" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
          View Leads
        </Link>
        <Link href="/orders" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
          View Orders
        </Link>
        <Link href="/customers" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
          View Customers
        </Link>
        <Link href="#" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
          Settings
        </Link>
      </div>
    </div>
  )
}
