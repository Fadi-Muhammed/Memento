import twilio from 'twilio'

if (!process.env.TWILIO_ACCOUNT_SID) throw new Error('Missing TWILIO_ACCOUNT_SID')
if (!process.env.TWILIO_AUTH_TOKEN) throw new Error('Missing TWILIO_AUTH_TOKEN')

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER!
