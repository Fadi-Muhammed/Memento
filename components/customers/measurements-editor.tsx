'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

type Measurements = {
  chest?:    number | string
  waist?:    number | string
  sleeve?:   number | string
  shoulder?: number | string
  length?:   number | string
}

interface MeasurementsEditorProps {
  customerId:          string
  measurements:        Measurements
  fabric_preferences:  string | null
  notes:               string | null
}

const MEASUREMENT_FIELDS: { key: keyof Measurements; label: string }[] = [
  { key: 'chest',    label: 'Chest (cm)' },
  { key: 'waist',    label: 'Waist (cm)' },
  { key: 'sleeve',   label: 'Sleeve (cm)' },
  { key: 'shoulder', label: 'Shoulder (cm)' },
  { key: 'length',   label: 'Length (cm)' },
]

export function MeasurementsEditor({
  customerId,
  measurements,
  fabric_preferences,
  notes,
}: MeasurementsEditorProps) {
  const router = useRouter()

  const [m, setM] = useState<Measurements>({
    chest:    measurements.chest    ?? '',
    waist:    measurements.waist    ?? '',
    sleeve:   measurements.sleeve   ?? '',
    shoulder: measurements.shoulder ?? '',
    length:   measurements.length   ?? '',
  })
  const [fabric, setFabric] = useState(fabric_preferences ?? '')
  const [notesVal, setNotes] = useState(notes ?? '')
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  async function save() {
    setLoading(true)
    setError('')
    setSaved(false)

    const cleanM: Measurements = {}
    for (const { key } of MEASUREMENT_FIELDS) {
      const v = m[key]
      if (v !== '' && v !== undefined) cleanM[key] = Number(v)
    }

    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          measurements:       cleanM,
          fabric_preferences: fabric || null,
          notes:              notesVal || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to save')
        return
      }
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {MEASUREMENT_FIELDS.map(({ key, label }) => (
          <Input
            key={key}
            label={label}
            type="number"
            min={0}
            step={0.5}
            value={m[key] ?? ''}
            onChange={(e) => setM((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder="—"
          />
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">Fabric preferences</label>
        <textarea
          value={fabric}
          onChange={(e) => setFabric(e.target.value)}
          rows={2}
          placeholder="e.g. prefers linen, no synthetic"
          className="w-full rounded-md border border-border bg-surface-0 px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary resize-none transition-[border-color,box-shadow] duration-base ease-out-quart focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[--accent]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">Notes</label>
        <textarea
          value={notesVal}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any notes about this customer…"
          className="w-full rounded-md border border-border bg-surface-0 px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary resize-none transition-[border-color,box-shadow] duration-base ease-out-quart focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[--accent]"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={save}
        disabled={loading}
        className="w-full h-10 rounded-md bg-[--accent] text-white text-sm font-medium hover:bg-[--accent-hover] disabled:opacity-40 transition-colors duration-base"
      >
        {loading ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
      </button>
    </div>
  )
}
