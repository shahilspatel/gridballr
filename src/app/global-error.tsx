'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-[#e0e0e8] font-mono flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center p-8 border border-[#1a1a2e]">
          <div className="text-[10px] tracking-widest text-[#ff4444] mb-4">SYSTEM_FAILURE</div>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-[#6b6b80] mb-6">
            An unexpected error occurred. Our team has been notified.
          </p>
          {error.digest && <p className="text-[10px] text-[#6b6b80] mb-4">REF: {error.digest}</p>}
          <button
            onClick={reset}
            className="border border-[#00f0ff] bg-[#00f0ff]/10 px-6 py-2 text-[11px] font-bold tracking-wider text-[#00f0ff] hover:bg-[#00f0ff]/20 transition-colors"
          >
            RETRY
          </button>
        </div>
      </body>
    </html>
  )
}
