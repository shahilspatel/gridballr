import { TerminalHeader } from '@/components/layout/terminal-header'
import { DraftYearToggle } from '@/components/draft/draft-year-toggle'
import { DRAFT_YEARS, DEFAULT_DRAFT_YEAR, getAllYears, getYearLabels } from '@/lib/draft-config'
import type { Player } from '@/types'

export default function HomePage() {
  const allPlayers: Record<number, Player[]> = Object.fromEntries(
    DRAFT_YEARS.map((d) => [d.year, d.players]),
  )

  return (
    <div>
      <TerminalHeader
        title="BIG_BOARD"
        subtitle="NFL Draft Consensus Rankings"
        status="BOARD_ACTIVE"
      />

      {/* Hero */}
      <div className="relative border-b border-border bg-surface px-4 py-8 sm:px-6">
        <div className="scanlines mx-auto max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] text-muted">
              <span>SYS.INIT</span>
              <span className="text-border">&gt;</span>
              <span>GRIDBALLR_v0.1.0</span>
              <span className="text-border">&gt;</span>
              <span className="text-green">ALL_SYSTEMS_OPERATIONAL</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              NFL DRAFT <span className="text-cyan glow">BIG BOARD</span>
            </h1>
            <p className="max-w-lg text-sm text-muted">
              Consensus prospect rankings powered by advanced analytics, scouting reports, and
              combine data. Updated in real-time.
            </p>
          </div>
        </div>
      </div>

      <DraftYearToggle
        years={getAllYears()}
        defaultYear={DEFAULT_DRAFT_YEAR}
        allPlayers={allPlayers}
        labels={getYearLabels()}
      />
    </div>
  )
}
