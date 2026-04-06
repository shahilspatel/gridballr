import { TerminalHeader } from '@/components/layout/terminal-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scouts Community — Scouting Reports',
  description: 'Community-driven scouting reports with tier ratings, badges, and reactions.',
}

export default function ScoutsPage() {
  return (
    <div>
      <TerminalHeader
        title="SCOUTS_COMMUNITY"
        subtitle="User Scouting Reports"
        status="FEED_ACTIVE"
      />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {['RECENT', 'POPULAR', 'DISCUSSED'].map((tab, i) => (
              <button
                key={tab}
                className={`px-3 py-1.5 text-[10px] font-medium tracking-wide transition-colors ${
                  i === 0
                    ? 'bg-cyan/10 text-cyan border border-cyan/30'
                    : 'text-muted hover:text-foreground border border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="border border-cyan bg-cyan/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20">
            + NEW_REPORT
          </button>
        </div>

        {/* Empty state */}
        <div className="border border-border bg-surface p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-amber shadow-[0_0_8px_#ffb80066]" />
            <span className="text-xs font-bold tracking-widest text-amber">NO_REPORTS_YET</span>
            <p className="max-w-sm text-[11px] text-muted">
              Be the first to submit a scouting report. Share your analysis on any 2026 NFL draft
              prospect with the community.
            </p>
            <button className="mt-2 border border-cyan bg-cyan/10 px-4 py-2 text-[10px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20">
              CREATE_REPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
