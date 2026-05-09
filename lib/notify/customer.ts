import { sendFreeform } from '@/lib/twilio/send'

const STAGE_MESSAGES: Record<string, string> = {
  confirmed: "Your order is confirmed. We'll keep you updated.",
  fitting:   'Your garment is ready for fitting. When can you come in?',
  ready:     'Your order is ready for pickup.',
}

export async function notifyCustomerStageChange(params: {
  customerPhone: string
  stage: string
  shopName: string
}): Promise<boolean> {
  const { customerPhone, stage } = params

  const message = STAGE_MESSAGES[stage]
  if (!message) return false

  try {
    await sendFreeform(customerPhone, message)
    return true
  } catch (err) {
    console.error(`[notifyCustomerStageChange] Failed to notify ${customerPhone} for stage "${stage}":`, err)
    return false
  }
}
