import { twilioClient, WHATSAPP_NUMBER } from './client'

// Send a free-form WhatsApp message — only valid within 24h of last customer inbound
export async function sendFreeform(to: string, body: string): Promise<string> {
  const msg = await twilioClient.messages.create({
    from: `whatsapp:${WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`,
    body,
  })
  return msg.sid
}

// Send a pre-approved WhatsApp template message — works outside the 24h window
export async function sendTemplate(
  to: string,
  templateName: string,
  variables: Record<string, string>
): Promise<string> {
  const body = buildTemplateBody(templateName, variables)
  const msg = await twilioClient.messages.create({
    from: `whatsapp:${WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`,
    body,
  })
  return msg.sid
}

// Replaces {{1}}, {{2}} placeholders with actual variable values
function buildTemplateBody(templateName: string, variables: Record<string, string>): string {
  const templates: Record<string, string> = {
    memento_followup_24h:
      'Hi {{1}}, following up on your enquiry about a {{2}}. Reply YES if you\'d like to continue, or let us know if you\'ve changed your mind.',
    memento_followup_72h:
      'Hi {{1}}, last note from us — we still have your enquiry about a {{2}} on file. If you\'d like to proceed, just reply and we\'ll pick up where we left off.',
  }

  const template = templates[templateName]
  if (!template) throw new Error(`Unknown template: ${templateName}`)

  return template.replace(/\{\{(\d+)\}\}/g, (_, i) => variables[i] ?? '')
}
