import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

const NAV_LINKS = [
  { href: '/', label: 'Today' },
  { href: '/leads', label: 'Leads' },
  { href: '/customers', label: 'Customers' },
  { href: '/orders', label: 'Orders' },
]

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-1 px-4 h-12 overflow-x-auto">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 px-3 py-1.5 text-sm font-medium text-zinc-600 rounded-md hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {children}
      </main>
    </div>
  )
}
