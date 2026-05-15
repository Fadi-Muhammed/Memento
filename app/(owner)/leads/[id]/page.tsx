import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { FollowupControls } from '@/components/leads/followup-controls'
import { LeadActions } from '@/components/leads/lead-actions'
import { timeAgo } from '@/lib/utils'

const KEY_LABELS: Record<string, string> = {
  garment_type_raw:  'Garment type',
  fabric_pref_raw:   'Fabric preference',
  deadline_raw:      'Deadline',
  is_returning_raw:  'Returning customer',
}

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const shopId = process.env.SHOP_ID!

  const { data: lead } = await supabaseAdmin
    .from('leads')
    .select('*, customer:customers(id, name, phone)')
    .eq('id', params.id)
    .eq('shop_id', shopId)
    .single()

  if (!lead) notFound()

  const customer = Array.isArray(lead.customer) ? lead.customer[0] : lead.customer
  const rawQual  = (lead.raw_qualification ?? {}) as Record<string, unknown>
  const qaEntries = Object.entries(rawQual).filter(
    ([k]) => k !== 'state' && KEY_LABELS[k]
  )

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Back */}
      <Link href="/leads" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
        ← Leads
      </Link>

      {/* Section 1 — Lead summary */}
      <Card>
        <CardHeader>
          <h1 className="text-base font-semibold text-text-primary">
            {customer?.name ?? customer?.phone ?? 'Lead'}
          </h1>
        </CardHeader>
        <CardBody className="space-y-2">
          <Row label="Garment"    value={lead.garment_type} />
          <Row label="Fabric"     value={lead.fabric_pref} />
          <Row label="Deadline"   value={lead.deadline} />
          <Row label="Returning"  value={
            lead.is_returning === true ? 'Yes'
            : lead.is_returning === false ? 'No'
            : null
          } />
          <Row label="Qualified"  value={lead.qualified_at ? timeAgo(lead.qualified_at) : null} />
        </CardBody>
      </Card>

      {/* Section 2 — Q&A capture */}
      {qaEntries.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-text-primary">Qualification answers</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {qaEntries.map(([key, value]) => (
              <Row
                key={key}
                label={KEY_LABELS[key] ?? key}
                value={String(value)}
              />
            ))}
          </CardBody>
        </Card>
      )}

      {/* Section 3 — Customer info */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-text-primary">Customer</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          <Row label="Name"  value={customer?.name} />
          <Row label="Phone" value={customer?.phone} />
          {customer?.id && (
            <Link
              href={`/customers/${customer.id}`}
              className="text-sm text-text-secondary underline underline-offset-2 hover:text-text-primary transition-colors"
            >
              View customer profile →
            </Link>
          )}
        </CardBody>
      </Card>

      {/* Section 4 — Follow-up status */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-text-primary">Follow-ups</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <Row label="Stage"     value={lead.followup_stage} />
          <Row label="Status"    value={lead.followup_paused ? 'Paused' : 'Active'} />
          <Row label="Last sent" value={timeAgo(lead.last_followup_sent_at)} />
          <FollowupControls
            leadId={params.id}
            paused={lead.followup_paused}
            status={lead.status}
          />
        </CardBody>
      </Card>

      {/* Section 5 — Actions */}
      <LeadActions
        leadId={params.id}
        status={lead.status}
        garmentType={lead.garment_type}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-text-tertiary shrink-0">{label}</span>
      <span className="text-text-primary text-right">{value ?? '—'}</span>
    </div>
  )
}
