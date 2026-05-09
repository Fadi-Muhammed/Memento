'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ease = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease, delay: i * 0.07 },
  }),
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="text-center space-y-3"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-xl">
                ✉️
              </div>
              <p className="text-base font-semibold text-text-primary">Check your email</p>
              <p className="text-sm text-text-secondary">
                We sent a magic link to{' '}
                <span className="font-medium text-text-primary">{email}</span>.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-xs text-text-tertiary hover:text-text-secondary transition-colors duration-base mt-1"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-8">
              <div className="space-y-1">
                <motion.h1
                  custom={0}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="text-2xl font-semibold tracking-tight text-text-primary"
                >
                  Memento
                </motion.h1>
                <motion.p
                  custom={1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="text-sm text-text-secondary"
                >
                  Sign in to manage your shop
                </motion.p>
              </div>

              <motion.form
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <Input
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error || undefined}
                  required
                  autoFocus
                  autoComplete="email"
                />
                <Button type="submit" className="w-full" loading={loading}>
                  Send login link
                </Button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
