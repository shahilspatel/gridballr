import { TerminalHeader } from '@/components/layout/terminal-header'
import { BigBoard } from '@/components/draft/big-board'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import type { Player } from '@/types'

export default function HomePage() {
  const players = (SEED_PLAYERS as Player[]).sort(
    (a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999),
  )

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

      <BigBoard players={players} />
    </div>
  )
}
