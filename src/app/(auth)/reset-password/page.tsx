'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TerminalHeader } from '@/components/layout/terminal-header'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setStatus('loading')
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setStatus('error')
      return
    }

    setStatus('done')
    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 2000)
  }

  return (
    <div>
      <TerminalHeader title="NEW_PASSWORD" subtitle="Set a new password" status="AUTH_FLOW" />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="border border-border bg-surface p-6">
          {status === 'done' ? (
            <div className="flex flex-col gap-3 text-center">
              <span className="text-xs font-bold tracking-widest text-cyan glow">
                PASSWORD_UPDATED
              </span>
              <p className="text-xs text-muted">Redirecting to the homepage...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="mb-2 flex flex-col gap-1">
                <span className="text-xs font-bold tracking-widest text-cyan glow">
                  SET_NEW_PASSWORD
                </span>
              </div>

              {error && (
                <div className="border border-red/30 bg-red/5 px-3 py-2 text-[11px] text-red">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold tracking-widest text-muted">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold tracking-widest text-muted">CONFIRM</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="border border-cyan bg-cyan/10 px-4 py-2.5 text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-50"
              >
                {status === 'loading' ? 'UPDATING...' : 'UPDATE_PASSWORD'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
