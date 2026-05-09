import { getTwilioClient } from './client'

// ─────────────────────────────────────────────
// Typed errors
// ─────────────────────────────────────────────

export class WA_WINDOW_CLOSED extends Error {
  readonly code = 63016
  constructor(to: string) {
    super(`WhatsApp 24-hour window closed for ${to}`)
    this.name = 'WA_WINDOW_CLOSED'
  }
}

export class TEMPLATE_PENDING extends Error {
  readonly code = 63007
  constructor(templateName: string) {
    super(`WhatsApp template not found or pending approval: ${templateName}`)
    this.name = 'TEMPLATE_PENDING'
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function toWhatsApp(number: string): string {
  return number.startsWith('whatsapp:') ? number : `whatsapp:${number}`
}

function getFromNumber(): string {
  const n = process.env.TWILIO_WHATSAPP_NUMBER
  if (!n) throw new Error('Missing TWILIO_WHATSAPP_NUMBER')
  return toWhatsApp(n)
}

// Maps Twilio error codes to typed errors
function handleTwilioError(err: unknown, context: { to?: string; templateName?: string }): never {
  const code = (err as { code?: number }).code
  if (code === 63016) throw new WA_WINDOW_CLOSED(context.to ?? '')
  if (code === 63007) throw new TEMPLATE_PENDING(context.templateName ?? '')
  throw err
}

// ─────────────────────────────────────────────
// Template registry
// Variables are positional: variables[0] → {{1}}, variables[1] → {{2}}
// ─────────────────────────────────────────────

const TEMPLATES: Record<string, string> = {
  memento_followup_24h:
    "Hi {{1}}, following up on your enquiry about a {{2}}. Reply YES if you'd like to continue, or let us know if you've changed your mind.",
  memento_followup_72h:
    "Hi {{1}}, last note from us — we still have your enquiry about a {{2}} on file. If you'd like to proceed, just reply and we'll pick up where we left off.",
}

function renderTemplate(templateName: string, variables: string[]): string {
  const template = TEMPLATES[templateName]
  if (!template) throw new TEMPLATE_PENDING(templateName)
  return template.replace(/\{\{(\d+)\}\}/g, (_, i) => variables[Number(i) - 1] ?? '')
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export async function sendFreeform(to: string, body: string): Promise<string> {
  try {
    const msg = await getTwilioClient().messages.create({
      from: getFromNumber(),
      to: toWhatsApp(to),
      body,
    })
    return msg.sid
  } catch (err) {
    handleTwilioError(err, { to })
  }
}

export async function sendTemplate(
  to: string,
  templateName: string,
  variables: string[]
): Promise<string> {
  const body = renderTemplate(templateName, variables)
  try {
    const msg = await getTwilioClient().messages.create({
      from: getFromNumber(),
      to: toWhatsApp(to),
      body,
    })
    return msg.sid
  } catch (err) {
    handleTwilioError(err, { to, templateName })
  }
}
