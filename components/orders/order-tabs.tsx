'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'All',       value: '' },
  { label: 'Active',    value: 'active' },
  { label: 'Ready',     value: 'ready' },
  { label: 'Picked Up', value: 'done' },
] as const

export function OrderTabs() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const current      = searchParams.get('filter') ?? ''

  function navigate(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('filter', value)
    else params.delete('filter')
    router.push(`/orders?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5 -mx-4 px-4">
      {TABS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => navigate(value)}
          className={cn(
            'shrink-0 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-base ease-out-quart',
            current === value
              ? 'bg-surface-2 text-text-primary'
              : 'text-text-secondary hover:bg-surface-1 hover:text-text-primary'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
