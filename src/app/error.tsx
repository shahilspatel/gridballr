'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Surface the error to the browser console / Sentry on mount.
  useEffect(() => {
    console.error('Page error boundary:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md border border-border bg-surface p-8 text-center">
        <div className="mb-4 text-4xl font-bold text-red">ERROR</div>
        <div className="mb-2 text-xs font-bold tracking-widest text-foreground">SYSTEM_FAILURE</div>
        <p className="mb-6 text-[11px] text-muted">
          An unexpected error occurred. This has been logged for investigation.
        </p>
        {error.digest && (
          <p className="mb-4 font-mono text-[9px] text-muted/60">REF: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="border border-cyan bg-cyan/10 px-6 py-2.5 text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20"
        >
          RETRY
        </button>
      </div>
    </div>
  )
}
