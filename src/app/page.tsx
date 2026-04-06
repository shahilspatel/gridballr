import { TerminalHeader } from '@/components/layout/terminal-header'
import { PlayerCard } from '@/components/player/player-card'
import { BigBoardFilters } from '@/components/draft/big-board-filters'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'

export default function HomePage() {
  const players = SEED_PLAYERS.sort((a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999))

  return (
    <div>
      <TerminalHeader
        title="BIG_BOARD"
        subtitle="2026 NFL Draft Consensus Rankings"
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
              2026 NFL DRAFT <span className="text-cyan glow">BIG BOARD</span>
            </h1>
            <p className="max-w-lg text-sm text-muted">
              Consensus prospect rankings powered by advanced analytics, scouting reports, and
              combine data. Updated in real-time.
            </p>
            <div className="mt-2 flex items-center gap-4 text-[10px] text-muted">
              <span>
                <span className="text-cyan">{players.length}</span> PROSPECTS LOADED
              </span>
              <span>
                <span className="text-cyan">2026</span> DRAFT_CLASS
              </span>
              <span>
                LAST_SYNC:{' '}
                <span className="text-green">{new Date().toISOString().split('T')[0]}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <BigBoardFilters />

      {/* Board */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-2">
          {players.map((player, i) => (
            <PlayerCard
              key={player.slug}
              player={player as any}
              rank={player.big_board_rank ?? i + 1}
            />
          ))}
        </div>

        {/* Footer status */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-muted">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan" />
          <span>END_OF_BOARD // {players.length} PROSPECTS // DRAFT_YEAR:2026</span>
        </div>
      </div>
    </div>
  )
}
