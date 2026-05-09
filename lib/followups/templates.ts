export const FOLLOWUP_TEMPLATES = {
  '24h': {
    name: 'memento_followup_24h',
    variables: (name: string, garment: string) => [name, garment],
  },
  '72h': {
    name: 'memento_followup_72h',
    variables: (name: string, garment: string) => [name, garment],
  },
} as const

export const FOLLOWUP_2H_MESSAGE = (name: string, garment: string) =>
  `Hi ${name}! Just checking in — would you like to come by for measurements, or should we send pricing for the ${garment}?`
