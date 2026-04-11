'use client'

import { useState } from 'react'
import { StatMatrixTable } from '@/components/stats/stat-matrix-table'
import type { Player } from '@/types'

type SeedPlayer = Omit<Player, 'id'>

interface StatMatrixWithYearsProps {
  allPlayers: Record<number, SeedPlayer[]>
}

export function StatMatrixWithYears({ allPlayers }: StatMatrixWithYearsProps) {
  const [activeYear, setActiveYear] = useState(2026)
  const years = Object.keys(allPlayers)
    .map(Number)
    .sort((a, b) => b - a)

  const players = (allPlayers[activeYear] ?? []).sort(
    (a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setActiveYear(year)}
            className={`px-3 py-1.5 text-[11px] font-bold tracking-wider transition-colors ${
              activeYear === year
                ? 'bg-cyan/10 text-cyan border border-cyan/30'
                : 'text-muted hover:text-foreground border border-transparent'
            }`}
          >
            {year}
            <span
              className={`ml-1.5 text-[8px] ${activeYear === year ? 'text-cyan/70' : 'text-muted'}`}
            >
              {year === 2026 ? 'UPCOMING' : 'COMPLETED'}
            </span>
          </button>
        ))}
        <span className="ml-auto text-[10px] text-muted">
          <span className="text-cyan">{players.length}</span> PROSPECTS
        </span>
      </div>
      <StatMatrixTable players={players} />
    </div>
  )
}
