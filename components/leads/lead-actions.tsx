'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Input } from '@/components/ui/input'

const ease = [0.16, 1, 0.3, 1] as const

interface LeadActionsProps {
  leadId:      string
  status:      string
  garmentType: string | null
}

export function LeadActions({ leadId, status, garmentType }: LeadActionsProps) {
  if (status !== 'qualified') return null

  return (
    <div className="flex flex-col gap-3">
      <ConvertButton leadId={leadId} garmentType={garmentType} />
      <MarkLostButton leadId={leadId} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Convert to Order
// ─────────────────────────────────────────────

function ConvertButton({
  leadId,
  garmentType,
}: {
  leadId: string
  garmentType: string | null
}) {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const body = {
      garment_type:  garmentType ?? (form.get('garment_type') as string),
      agreed_price:  form.get('agreed_price') ? Number(form.get('agreed_price')) : undefined,
      promised_date: form.get('promised_date') as string || undefined,
    }

    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        return
      }

      const { orderId } = await res.json()
      router.push(`/orders/${orderId}`)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full h-11 rounded-md bg-[--accent] text-white text-sm font-medium hover:bg-[--accent-hover] transition-colors duration-base"
      >
        Convert to Order
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => !loading && setOpen(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ ease, duration: 0.38 }}
              className="relative w-full sm:max-w-sm bg-surface-0 rounded-t-xl sm:rounded-xl shadow-elevated"
            >
              <div className="px-5 pt-5 pb-2">
                <h2 className="text-base font-semibold text-text-primary">Convert to Order</h2>
              </div>

              <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">
                <Input
                  label="Garment"
                  name="garment_type"
                  defaultValue={garmentType ?? ''}
                  disabled={!!garmentType}
                  required
                />
                <Input
                  label="Agreed price (QAR)"
                  name="agreed_price"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="e.g. 350"
                />
                <Input
                  label="Promised date"
                  name="promised_date"
                  type="date"
                />

                {error && <p className="text-xs text-red-500">{error}</p>}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    className="flex-1 h-10 rounded-md border border-border text-sm font-medium text-text-secondary hover:bg-surface-1 disabled:opacity-40 transition-colors duration-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-10 rounded-md bg-[--accent] text-white text-sm font-medium hover:bg-[--accent-hover] disabled:opacity-40 transition-colors duration-base"
                  >
                    {loading ? 'Converting…' : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─────────────────────────────────────────────
// Mark Lost
// ─────────────────────────────────────────────

function MarkLostButton({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading]       = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/lost`, { method: 'POST' })
      if (res.ok) router.push('/leads')
    } finally {
      setLoading(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="flex-1 h-10 rounded-md border border-border text-sm font-medium text-text-secondary hover:bg-surface-1 disabled:opacity-40 transition-colors duration-base"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 h-10 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40 transition-colors duration-base"
        >
          {loading ? 'Marking…' : 'Confirm lost'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full h-11 rounded-md border border-border text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-base"
    >
      Mark as Lost
    </button>
  )
}
