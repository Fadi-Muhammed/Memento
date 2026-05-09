import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { NavLink } from '@/components/ui/nav-link'

const NAV_LINKS = [
  { href: '/',          label: 'Today',     exact: true },
  { href: '/leads',     label: 'Leads' },
  { href: '/customers', label: 'Customers' },
  { href: '/orders',    label: 'Orders' },
]

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-surface-0">
      <nav className="glass sticky top-0 z-20">
        <div className="flex items-center gap-1 px-4 h-12 max-w-2xl mx-auto overflow-x-auto">
          <span className="text-sm font-semibold text-text-primary mr-3 shrink-0">Memento</span>
          {NAV_LINKS.map(({ href, label, exact }) => (
            <NavLink key={href} href={href} label={label} exact={exact} />
          ))}
        </div>
      </nav>
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {children}
      </main>
    </div>
  )
}
