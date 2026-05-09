import twilio from 'twilio'

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid) throw new Error('Missing TWILIO_ACCOUNT_SID')
  if (!authToken) throw new Error('Missing TWILIO_AUTH_TOKEN')

  return twilio(accountSid, authToken)
}
