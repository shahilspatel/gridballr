import { TerminalHeader } from '@/components/layout/terminal-header'
import { BigBoard } from '@/components/draft/big-board'
import { DraftYearToggle } from '@/components/draft/draft-year-toggle'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import { SEED_PLAYERS_2026 } from '@/lib/data/seed-prospects-2026'
import type { Player } from '@/types'

const DRAFT_YEARS = {
  2026: {
    players: SEED_PLAYERS_2026 as Player[],
    label: 'UPCOMING',
    status: 'PROJECTIONS',
  },
  2025: {
    players: SEED_PLAYERS as Player[],
    label: 'COMPLETED',
    status: 'FINAL',
  },
}

export default function HomePage() {
  const defaultYear = 2026
  const data = DRAFT_YEARS[defaultYear]
  const players = data.players.sort((a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999))

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
        years={[2026, 2025]}
        defaultYear={defaultYear}
        allPlayers={{ 2026: DRAFT_YEARS[2026].players, 2025: DRAFT_YEARS[2025].players }}
        labels={{ 2026: 'UPCOMING', 2025: 'COMPLETED' }}
      />
    </div>
  )
}
