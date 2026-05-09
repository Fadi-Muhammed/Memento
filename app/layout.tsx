// Root layout — wraps every route, imports global styles
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Memento',
  description: 'WhatsApp lead and order management for tailoring shops',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
