import { TerminalHeader } from '@/components/layout/terminal-header'
import { StatMatrixTable } from '@/components/stats/stat-matrix-table'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stat Matrix — NFL Draft Prospect Database',
  description:
    'Sortable, filterable database of NFL draft prospects with 30+ statistical metrics, combine measurables, and advanced analytics.',
}

export default function StatsPage() {
  const players = SEED_PLAYERS.sort((a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999))

  return (
    <div>
      <TerminalHeader
        title="STAT_MATRIX"
        subtitle="NFL Draft Prospect Database"
        status="DATA_LOADED"
      />
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <StatMatrixTable players={players as any} />
      </div>
    </div>
  )
}
