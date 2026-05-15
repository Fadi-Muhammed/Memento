'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function CustomerSearch() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('q', value.trim())
      } else {
        params.delete('q')
      }
      router.replace(`/customers?${params.toString()}`)
    }, 300)
    return () => clearTimeout(t)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search by phone…"
      className="flex h-11 w-full rounded-md border border-border bg-surface-0 px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-[border-color,box-shadow] duration-base ease-out-quart focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[--accent]"
    />
  )
}
