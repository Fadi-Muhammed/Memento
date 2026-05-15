'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const STAGES = ['confirmed', 'cut', 'stitched', 'fitting', 'ready', 'picked_up'] as const
type Stage = (typeof STAGES)[number]

const STAGE_LABELS: Record<Stage, string> = {
  confirmed: 'Confirmed',
  cut:       'Cut',
  stitched:  'Stitched',
  fitting:   'Fitting',
  ready:     'Ready',
  picked_up: 'Picked Up',
}

const STAGE_BADGE: Record<Stage, string> = {
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  cut:       'bg-amber-50 text-amber-700 border border-amber-200',
  stitched:  'bg-orange-50 text-orange-700 border border-orange-200',
  fitting:   'bg-purple-50 text-purple-700 border border-purple-200',
  ready:     'bg-green-50 text-green-700 border border-green-200',
  picked_up: 'bg-surface-2 text-text-tertiary border border-border',
}

function adjacentStage(current: Stage, direction: 'next' | 'prev'): Stage | null {
  const idx = STAGES.indexOf(current)
  if (direction === 'next') return idx < STAGES.length - 1 ? STAGES[idx + 1] : null
  return idx > 0 ? STAGES[idx - 1] : null
}

interface StageControlProps {
  orderId: string
  stage:   Stage
}

export function StageControl({ orderId, stage }: StageControlProps) {
  const router = useRouter()
  const [advancing,  setAdvancing]  = useState(false)
  const [reverting,  setReverting]  = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error,      setError]      = useState('')

  const next = adjacentStage(stage, 'next')
  const prev = adjacentStage(stage, 'prev')

  async function advance() {
    setAdvancing(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${orderId}/advance`, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to advance')
        return
      }
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setAdvancing(false)
    }
  }

  async function revert() {
    setReverting(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${orderId}/revert`, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to revert')
        return
      }
      setConfirming(false)
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setReverting(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Current stage badge */}
      <div className="flex justify-center py-2">
        <span className={cn(
          'text-base font-semibold px-5 py-2 rounded-full',
          STAGE_BADGE[stage] ?? 'bg-surface-2 text-text-tertiary border border-border'
        )}>
          {STAGE_LABELS[stage]}
        </span>
      </div>

      {/* Advance */}
      {next && (
        <button
          onClick={advance}
          disabled={advancing}
          className="w-full h-12 rounded-md bg-[--accent] text-white text-sm font-medium hover:bg-[--accent-hover] disabled:opacity-40 transition-colors duration-base"
        >
          {advancing ? 'Moving…' : `Advance to ${STAGE_LABELS[next]}`}
        </button>
      )}

      {/* Revert — with inline confirm */}
      {prev && (
        confirming ? (
          <div className="space-y-2">
            <p className="text-xs text-text-secondary text-center">
              Revert to {STAGE_LABELS[prev]}? No customer notification will be sent.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={reverting}
                className="flex-1 h-10 rounded-md border border-border text-sm font-medium text-text-secondary hover:bg-surface-1 disabled:opacity-40 transition-colors duration-base"
              >
                Cancel
              </button>
              <button
                onClick={revert}
                disabled={reverting}
                className="flex-1 h-10 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40 transition-colors duration-base"
              >
                {reverting ? 'Reverting…' : 'Confirm revert'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="w-full h-9 rounded-md border border-border text-xs font-medium text-text-secondary hover:bg-surface-1 hover:text-red-600 hover:border-red-200 transition-colors duration-base"
          >
            Revert to {STAGE_LABELS[prev]}
          </button>
        )
      )}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  )
}
