'use client'

import { TerminalHeader } from '@/components/layout/terminal-header'
import { PLANS } from '@/lib/stripe/plans'
import { useState } from 'react'

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async (cycle: 'monthly' | 'annual') => {
    setLoading(true)
    setError(null)
    try {
      const priceId =
        cycle === 'monthly' ? PLANS.pro.stripePriceIdMonthly : PLANS.pro.stripePriceIdAnnual

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      // Handle non-2xx by status code, not by string match. The previous
      // version silently swallowed 401 (unauthenticated) and 429 (rate
      // limited) — the button would flicker and the user got no feedback.
      if (response.status === 401) {
        setError('Sign in to upgrade to Pro.')
        return
      }
      if (response.status === 429) {
        setError('Too many checkout attempts — try again in a minute.')
        return
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data?.error ?? 'Checkout failed. Please try again.')
        return
      }

      const { sessionUrl } = await response.json()
      if (sessionUrl) {
        window.location.href = sessionUrl
      } else {
        setError('Checkout did not return a session — please contact support.')
      }
    } catch {
      setError('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <TerminalHeader title="PRICING" subtitle="GridBallr Pro Access" status="PLANS_AVAILABLE" />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            UPGRADE TO <span className="text-cyan glow">PRO</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            Unlock the full scouting suite. Advanced analytics, film, mock drafts, and dynasty
            tools.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red/30 bg-red/5 px-4 py-3 text-center text-xs text-red">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Free */}
          <div className="border border-border bg-surface p-6">
            <div className="mb-4">
              <span className="text-xs font-bold tracking-widest text-muted">
                {PLANS.free.name.toUpperCase()}
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">$0</span>
                <span className="text-sm text-muted">/forever</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">{PLANS.free.description}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {PLANS.free.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-foreground/70">
                  <span className="text-green">+</span> {f}
                </li>
              ))}
            </ul>
            <button className="mt-6 w-full border border-border py-2.5 text-[11px] font-bold tracking-wider text-muted">
              CURRENT_PLAN
            </button>
          </div>

          {/* Pro */}
          <div className="border-2 border-cyan bg-surface p-6 relative">
            <div className="absolute -top-3 left-4 bg-cyan px-2 py-0.5 text-[9px] font-bold tracking-widest text-background">
              RECOMMENDED
            </div>
            <div className="mb-4">
              <span className="text-xs font-bold tracking-widest text-cyan">
                {PLANS.pro.name.toUpperCase()}
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  ${PLANS.pro.priceMonthly}
                </span>
                <span className="text-sm text-muted">/month</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                or ${PLANS.pro.priceYearly}/year (save 44%)
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {PLANS.pro.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-foreground/70">
                  <span className="text-cyan">+</span> {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => handleUpgrade('monthly')}
                disabled={loading}
                className="w-full border border-cyan bg-cyan/10 py-2.5 text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-50"
              >
                {loading ? 'PROCESSING...' : `$${PLANS.pro.priceMonthly}/MONTH`}
              </button>
              <button
                onClick={() => handleUpgrade('annual')}
                disabled={loading}
                className="w-full border border-cyan bg-cyan/10 py-2.5 text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-50"
              >
                {loading ? 'PROCESSING...' : `$${PLANS.pro.priceYearly}/YEAR`}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-muted">
          SECURE_CHECKOUT // POWERED BY STRIPE // CANCEL ANYTIME
        </div>
      </div>
    </div>
  )
}
