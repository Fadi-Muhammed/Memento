'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FollowupControlsProps {
  leadId:  string
  paused:  boolean
  status:  string
}

export function FollowupControls({ leadId, paused, status }: FollowupControlsProps) {
  const router   = useRouter()
  const [loading, setLoading] = useState(false)
  const canResume = status === 'qualified'

  async function handleToggle() {
    setLoading(true)
    const endpoint = paused
      ? `/api/leads/${leadId}/followup/resume`
      : `/api/leads/${leadId}/followup/pause`

    try {
      const res = await fetch(endpoint, { method: 'POST' })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (paused) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading || !canResume}
        className="text-sm font-medium px-3 py-1.5 rounded-md bg-surface-1 border border-border text-text-primary hover:bg-surface-2 disabled:opacity-40 transition-colors duration-base"
      >
        {loading ? 'Resuming…' : 'Resume follow-ups'}
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="text-sm font-medium px-3 py-1.5 rounded-md bg-surface-1 border border-border text-text-secondary hover:bg-surface-2 disabled:opacity-40 transition-colors duration-base"
    >
      {loading ? 'Pausing…' : 'Pause follow-ups'}
    </button>
  )
}
