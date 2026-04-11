'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// Soft (nudge) paywall: tracks visits in localStorage and shows a dismissable
// overlay after N free views. Bypassable on purpose — the goal is conversion,
// not enforcement. Hard enforcement happens via Supabase + the proxy layer
// once a user is on Pro.
//
// Usage: drop <SoftPaywall featureKey="galaxy" freeViews={3} /> at the bottom
// of any premium-leaning page. The page renders normally; the overlay sits
// on top once the threshold is crossed.

type Props = {
  featureKey: string
  freeViews?: number
  title?: string
  body?: string
}

const STORAGE_PREFIX = 'gb_views_'

type Status = 'loading' | 'hidden' | 'shown'

export function SoftPaywall({
  featureKey,
  freeViews = 3,
  title = "YOU'RE_HOOKED",
  body = "You've hit your free preview limit. Join the waitlist for founder pricing or upgrade to Pro for unlimited access.",
}: Props) {
  // Single state, single setState in the effect. The React 19 lint rule
  // `react-hooks/set-state-in-effect` is conservative and flags any setState
  // in an effect body, but here we're doing exactly what the rule docs allow:
  // synchronizing with an external system (browser storage) on first mount.
  // The ref guard ensures the effect runs once; the setState fires once.
  const [status, setStatus] = useState<Status>('loading')
  const ranRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (ranRef.current) return
    ranRef.current = true

    const key = STORAGE_PREFIX + featureKey
    const dismissKey = key + '_dismissed'

    // Compute the next status purely, then set state once at the end.
    let nextStatus: Status = 'hidden'

    if (sessionStorage.getItem(dismissKey)) {
      nextStatus = 'hidden'
    } else {
      try {
        const raw = localStorage.getItem(key)
        const current = raw ? parseInt(raw, 10) || 0 : 0
        const next = current + 1
        localStorage.setItem(key, String(next))
        nextStatus = next > freeViews ? 'shown' : 'hidden'
      } catch {
        // Storage disabled — fail open.
        nextStatus = 'hidden'
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot mount sync with browser storage; cannot use useState initializer because storage is unavailable during SSR
    setStatus(nextStatus)
  }, [featureKey, freeViews])

  if (status !== 'shown') return null

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_PREFIX + featureKey + '_dismissed', '1')
    } catch {
      // ignore
    }
    setStatus('hidden')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="soft-paywall-title"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-background/70 p-4 backdrop-blur-sm sm:items-center"
      onKeyDown={(e) => e.key === 'Escape' && handleDismiss()}
    >
      <div className="w-full max-w-md border border-cyan bg-surface p-6 shadow-[0_0_24px_rgba(34,211,238,0.15)]">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan shadow-[0_0_6px_var(--cyan)]" />
          <span className="text-[10px] font-bold tracking-widest text-cyan">FREE_PREVIEW_USED</span>
        </div>
        <h2 id="soft-paywall-title" className="text-lg font-bold tracking-wider text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-xs text-muted">{body}</p>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href="/pricing"
            className="border border-cyan bg-cyan/10 px-4 py-2.5 text-center text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20"
          >
            UPGRADE_TO_PRO
          </Link>
          <Link
            href="/early-access"
            className="border border-border px-4 py-2 text-center text-[11px] font-medium text-muted transition-colors hover:border-foreground hover:text-foreground"
          >
            JOIN_WAITLIST_INSTEAD
          </Link>
          <button
            onClick={handleDismiss}
            className="mt-1 text-center text-[10px] text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            Keep browsing for now
          </button>
        </div>

        <div className="mt-4 border-t border-border pt-3 text-[9px] text-muted">
          PRO_INCLUDES: Galaxy + Film + Dynasty Sync + Mock Draft Rooms + Scout Reports
        </div>
      </div>
    </div>
  )
}
