import { TerminalHeader } from '@/components/layout/terminal-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mock Draft Simulator',
  description:
    'Simulate the 2026 NFL Draft with solo and multiplayer modes. Trade picks, draft prospects, and compete.',
}

export default function MockDraftPage() {
  return (
    <div>
      <TerminalHeader title="MOCK_DRAFT" subtitle="Draft Simulation Engine" status="READY" />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Solo mode */}
          <div className="border border-border bg-surface p-6 transition-colors hover:border-cyan/50">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold tracking-widest text-cyan">SOLO_MODE</span>
              <p className="text-[11px] text-muted">
                Draft against AI-controlled teams. Full 7-round mock draft with trade simulation.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-muted">
                <span>7 ROUNDS</span>
                <span className="text-border">|</span>
                <span>32 TEAMS</span>
                <span className="text-border">|</span>
                <span>TRADES ON</span>
              </div>
              <button className="mt-2 border border-cyan bg-cyan/10 px-4 py-2 text-[10px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20">
                START_DRAFT
              </button>
            </div>
          </div>

          {/* Multiplayer */}
          <div className="border border-border bg-surface p-6 transition-colors hover:border-cyan/50">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-cyan">MULTIPLAYER</span>
                <span className="border border-amber/30 bg-amber/5 px-1.5 py-0.5 text-[8px] font-bold text-amber">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Create or join a draft lobby. Draft against real users in real-time with live
                trades.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-muted">
                <span>2-32 PLAYERS</span>
                <span className="text-border">|</span>
                <span>LOBBIES</span>
                <span className="text-border">|</span>
                <span>LIVE</span>
              </div>
              <button className="mt-2 border border-border px-4 py-2 text-[10px] font-bold tracking-wider text-muted transition-colors hover:border-cyan hover:text-cyan">
                CREATE_LOBBY
              </button>
            </div>
          </div>
        </div>

        {/* Historical drafts */}
        <div className="mt-6 border border-border bg-surface p-6">
          <span className="text-xs font-bold tracking-widest text-cyan">HISTORICAL_REDRAFT</span>
          <p className="mt-2 text-[11px] text-muted">
            Redraft any NFL draft from 2001-2025 with the benefit of hindsight.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: 5 }, (_, i) => 2025 - i).map((year) => (
              <button
                key={year}
                className="border border-border px-3 py-1.5 text-[10px] font-medium text-muted transition-colors hover:border-cyan hover:text-cyan"
              >
                {year}
              </button>
            ))}
            <button className="border border-border px-3 py-1.5 text-[10px] font-medium text-muted transition-colors hover:border-cyan hover:text-cyan">
              MORE...
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
