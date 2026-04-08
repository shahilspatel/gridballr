'use client'

import { useState } from 'react'
import { BigBoard } from '@/components/draft/big-board'
import type { Player } from '@/types'

interface DraftYearToggleProps {
  years: number[]
  defaultYear: number
  allPlayers: Record<number, Player[]>
  labels: Record<number, string>
}

export function DraftYearToggle({ years, defaultYear, allPlayers, labels }: DraftYearToggleProps) {
  const [activeYear, setActiveYear] = useState(defaultYear)

  const players = (allPlayers[activeYear] ?? []).sort(
    (a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999),
  )

  return (
    <>
      {/* Year selector + stats */}
      <div className="border-b border-border bg-surface-2 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  className={`ml-1.5 text-[8px] ${
                    activeYear === year ? 'text-cyan/70' : 'text-muted'
                  }`}
                >
                  {labels[year]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[10px] text-muted">
            <span>
              <span className="text-cyan">{players.length}</span> PROSPECTS
            </span>
            <span>
              <span className="text-cyan">{activeYear}</span> DRAFT_CLASS
            </span>
            {labels[activeYear] === 'UPCOMING' && (
              <span className="border border-amber/30 bg-amber/5 px-1.5 py-0.5 text-[8px] font-bold text-amber">
                EARLY PROJECTIONS
              </span>
            )}
            {labels[activeYear] === 'COMPLETED' && (
              <span className="border border-green/30 bg-green/5 px-1.5 py-0.5 text-[8px] font-bold text-green">
                FINAL BOARD
              </span>
            )}
          </div>
        </div>
      </div>

      <BigBoard players={players} />
    </>
  )
}
