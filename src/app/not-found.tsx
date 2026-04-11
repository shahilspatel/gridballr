import { TerminalHeader } from '@/components/layout/terminal-header'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <TerminalHeader title="ERROR_404" status="NOT_FOUND" />
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="border border-border bg-surface p-8">
          <div className="mb-4 text-6xl font-bold text-cyan glow">404</div>
          <div className="mb-2 text-xs font-bold tracking-widest text-foreground">
            PAGE_NOT_FOUND
          </div>
          <p className="mb-6 text-[11px] text-muted">
            The requested resource does not exist or has been moved.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/"
              className="border border-cyan bg-cyan/10 px-6 py-2.5 text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20"
            >
              RETURN_TO_BOARD
            </Link>
            <div className="flex items-center gap-3 text-[10px] text-muted">
              <Link href="/stats" className="hover:text-cyan">
                STATS
              </Link>
              <span className="text-border">|</span>
              <Link href="/compare" className="hover:text-cyan">
                COMPARE
              </Link>
              <span className="text-border">|</span>
              <Link href="/pricing" className="hover:text-cyan">
                PRICING
              </Link>
              <span className="text-border">|</span>
              <Link href="/early-access" className="hover:text-cyan">
                WAITLIST
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
