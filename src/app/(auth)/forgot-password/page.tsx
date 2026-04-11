'use client'

import { useState } from 'react'
import { TerminalHeader } from '@/components/layout/terminal-header'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?redirect=/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setStatus('error')
      return
    }

    setStatus('sent')
  }

  return (
    <div>
      <TerminalHeader title="RESET_PASSWORD" subtitle="Recover your account" status="AUTH_FLOW" />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="border border-border bg-surface p-6">
          {status === 'sent' ? (
            <div className="flex flex-col gap-3 text-center">
              <span className="text-xs font-bold tracking-widest text-cyan glow">
                CHECK_YOUR_EMAIL
              </span>
              <p className="text-xs text-muted">
                If an account exists for {email}, we sent a password reset link. Check your inbox
                (and spam folder).
              </p>
              <a href="/login" className="mt-4 text-[10px] text-cyan hover:underline">
                BACK_TO_LOGIN
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="mb-2 flex flex-col gap-1">
                <span className="text-xs font-bold tracking-widest text-cyan glow">
                  FORGOT_PASSWORD
                </span>
                <span className="text-[10px] text-muted">
                  Enter your email and we&apos;ll send a reset link
                </span>
              </div>

              {error && (
                <div className="border border-red/30 bg-red/5 px-3 py-2 text-[11px] text-red">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold tracking-widest text-muted">EMAIL</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scout@gridballr.com"
                  className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="border border-cyan bg-cyan/10 px-4 py-2.5 text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-50"
              >
                {status === 'loading' ? 'SENDING...' : 'SEND_RESET_LINK'}
              </button>

              <a href="/login" className="text-center text-[10px] text-muted hover:text-cyan">
                BACK_TO_LOGIN
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
