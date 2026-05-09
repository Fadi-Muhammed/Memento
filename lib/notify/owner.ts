import { sendFreeform } from '@/lib/twilio/send'

interface Customer {
  id: string
  phone: string
  name?: string | null
}

interface Lead {
  id: string
  garment_type?: string | null
  fabric_pref?: string | null
  deadline?: string | null
  is_returning?: boolean | null
}

export async function notifyOwner(lead: Lead & { customer: Customer }): Promise<void> {
  const ownerPhone = process.env.SHOP_OWNER_PHONE
  if (!ownerPhone) throw new Error('Missing SHOP_OWNER_PHONE')

  const displayName = lead.customer.name || lead.customer.phone

  const message = [
    `🆕 New lead — ${displayName}`,
    `Garment: ${lead.garment_type ?? '—'}`,
    `Fabric: ${lead.fabric_pref ?? '—'}`,
    `Deadline: ${lead.deadline ?? '—'}`,
    `Returning: ${lead.is_returning === true ? 'yes' : lead.is_returning === false ? 'no' : '—'}`,
    `View: https://memento.app/leads/${lead.id}`,
  ].join('\n')

  await sendFreeform(ownerPhone, message)
}
