import { TerminalHeader } from '@/components/layout/terminal-header'
import { StatMatrixWithYears } from '@/components/stats/stat-matrix-with-years'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import { SEED_PLAYERS_2026 } from '@/lib/data/seed-prospects-2026'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stat Matrix — NFL Draft Prospect Database',
  description:
    'Sortable, filterable database of NFL draft prospects with 30+ statistical metrics, combine measurables, and advanced analytics.',
}

export default function StatsPage() {
  return (
    <div>
      <TerminalHeader
        title="STAT_MATRIX"
        subtitle="NFL Draft Prospect Database"
        status="DATA_LOADED"
      />
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <StatMatrixWithYears
          allPlayers={{
            2026: SEED_PLAYERS_2026 as any,
            2025: SEED_PLAYERS as any,
          }}
        />
      </div>
    </div>
  )
}
