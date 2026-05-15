'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

interface CustomerInfoEditorProps {
  customerId: string
  name:       string | null
  phone:      string
  email:      string | null
}

export function CustomerInfoEditor({ customerId, name, phone, email }: CustomerInfoEditorProps) {
  const router  = useRouter()
  const [editing, setEditing]   = useState(false)
  const [nameVal, setNameVal]   = useState(name ?? '')
  const [emailVal, setEmailVal] = useState(email ?? '')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function save() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: nameVal || null, email: emailVal || null }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to save')
        return
      }
      setEditing(false)
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  function cancel() {
    setNameVal(name ?? '')
    setEmailVal(email ?? '')
    setEditing(false)
    setError('')
  }

  return (
    <div className="space-y-3">
      {editing ? (
        <>
          <Input
            label="Name"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            placeholder="Customer name"
            autoFocus
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Phone</label>
            <p className="flex h-11 items-center px-3.5 text-sm text-text-tertiary rounded-md border border-border bg-surface-1">
              {phone}
            </p>
          </div>
          <Input
            label="Email"
            type="email"
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
            placeholder="email@example.com"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={cancel}
              disabled={loading}
              className="flex-1 h-10 rounded-md border border-border text-sm font-medium text-text-secondary hover:bg-surface-1 disabled:opacity-40 transition-colors duration-base"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="flex-1 h-10 rounded-md bg-[--accent] text-white text-sm font-medium hover:bg-[--accent-hover] disabled:opacity-40 transition-colors duration-base"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full text-left space-y-3 group"
        >
          <Field label="Name"  value={name  ?? '—'} />
          <Field label="Phone" value={phone}         />
          <Field label="Email" value={email ?? '—'}  />
          <p className="text-xs text-text-tertiary group-hover:text-text-secondary transition-colors duration-base">
            Tap to edit
          </p>
        </button>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  )
}
