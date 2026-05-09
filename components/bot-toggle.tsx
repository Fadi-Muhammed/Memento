'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

export function BotToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    const next = !enabled
    setEnabled(next)
    setLoading(true)

    try {
      const res = await fetch('/api/shops/me/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      })
      if (!res.ok) setEnabled(!next)
    } catch {
      setEnabled(!next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <label htmlFor="bot-toggle" className="text-sm font-medium text-text-primary">
        Bot is {enabled ? 'ON' : 'OFF'}
      </label>
      <Switch
        id="bot-toggle"
        checked={enabled}
        onCheckedChange={toggle}
        disabled={loading}
      />
    </div>
  )
}
