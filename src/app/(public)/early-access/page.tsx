'use client'

import { useState } from 'react'
import { TerminalHeader } from '@/components/layout/terminal-header'

export default function EarlyAccessPage() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (website) return // bot
    setStatus('loading')
    setError(null)

    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          source: typeof window !== 'undefined' ? window.location.search : undefined,
          website,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setError(data?.error ?? 'Something went wrong')
        return
      }
      setStatus('done')
    } catch {
      setStatus('error')
      setError('Network error — try again')
    }
  }

  return (
    <div>
      <TerminalHeader
        title="EARLY_ACCESS"
        subtitle="Founder pricing for the first 500 scouts"
        status="WAITLIST_OPEN"
      />

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            GET <span className="text-cyan glow">FIRST LOOK</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Join the GridBallr waitlist. First 500 signups get a lifetime 50% discount on Pro and
            early access to dynasty league sync, film breakdowns, and the galaxy view.
          </p>
        </div>

        <div className="border border-border bg-surface p-6">
          {status === 'done' ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="text-xs font-bold tracking-widest text-cyan glow">
                YOU&apos;RE_ON_THE_LIST
              </div>
              <p className="text-xs text-muted">
                We&apos;ll email you the moment GridBallr Pro is live. No spam, ever.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Honeypot */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

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

              {error && (
                <div className="border border-red/30 bg-red/5 px-3 py-2 text-[11px] text-red">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="border border-cyan bg-cyan/10 px-4 py-2.5 text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-50"
              >
                {status === 'loading' ? 'JOINING...' : 'JOIN_WAITLIST'}
              </button>

              <p className="text-[9px] text-muted">
                NO_SPAM // UNSUBSCRIBE_ANYTIME // FIRST 500 ONLY
              </p>
            </form>
          )}
        </div>

        <div className="mt-10 grid gap-4 text-center sm:grid-cols-3">
          <Perk title="LIFETIME_50%" body="Founder pricing locked forever" />
          <Perk title="DYNASTY_SYNC" body="Sleeper league import on day 1" />
          <Perk title="FILM_TERMINAL" body="Curated coaching tape per prospect" />
        </div>
      </div>
    </div>
  )
}

function Perk({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="text-[10px] font-bold tracking-widest text-cyan">{title}</div>
      <div className="mt-1 text-[11px] text-muted">{body}</div>
    </div>
  )
}
