'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  label: string
  exact?: boolean
}

export function NavLink({ href, label, exact = false }: NavLinkProps) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'shrink-0 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-base ease-out-quart',
        active
          ? 'bg-surface-2 text-text-primary'
          : 'text-text-secondary hover:bg-surface-1 hover:text-text-primary'
      )}
    >
      {label}
    </Link>
  )
}
