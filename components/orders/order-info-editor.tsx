'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

interface OrderInfoEditorProps {
  orderId:        string
  agreedPrice:    number | null
  fabricDetails:  string | null
  promisedDate:   string | null
  notes:          string | null
}

export function OrderInfoEditor({
  orderId,
  agreedPrice,
  fabricDetails,
  promisedDate,
  notes,
}: OrderInfoEditorProps) {
  const router = useRouter()

  const [price,    setPrice]    = useState(agreedPrice    != null ? String(agreedPrice) : '')
  const [fabric,   setFabric]   = useState(fabricDetails  ?? '')
  const [date,     setDate]     = useState(promisedDate   ?? '')
  const [notesVal, setNotesVal] = useState(notes          ?? '')
  const [loading,  setLoading]  = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  async function save() {
    setLoading(true)
    setError('')
    setSaved(false)

    const body: Record<string, unknown> = {}
    if (price !== '')  body.agreed_price  = Number(price)
    if (fabric !== '') body.fabric_details = fabric
    if (date !== '')   body.promised_date  = date
    body.notes = notesVal || null

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
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
      <Input
        label="Agreed price (QAR)"
        type="number"
        min={0}
        step={0.01}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="—"
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">Fabric details</label>
        <textarea
          value={fabric}
          onChange={(e) => setFabric(e.target.value)}
          rows={2}
          placeholder="e.g. navy linen, double-breasted"
          className="w-full rounded-md border border-border bg-surface-0 px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary resize-none transition-[border-color,box-shadow] duration-base ease-out-quart focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[--accent]"
        />
      </div>

      <Input
        label="Promised date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-primary">Notes</label>
        <textarea
          value={notesVal}
          onChange={(e) => setNotesVal(e.target.value)}
          rows={3}
          placeholder="Any notes about this order…"
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
