'use client'

import { useState, useMemo } from 'react'
import { PlayerCard } from '@/components/player/player-card'
import type { SeedPlayer } from '@/types'

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DL', 'LB', 'CB', 'S']

export function BigBoard({ players }: { players: SeedPlayer[] }) {
  const [position, setPosition] = useState('ALL')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = [...players]

    if (position !== 'ALL') {
      result = result.filter((p) => p.position === position)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
          p.school.toLowerCase().includes(q),
      )
    }

    return result
  }, [players, position, search])

  return (
    <>
      {/* Filters */}
      <div className="border-b border-border bg-background px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex flex-wrap items-center gap-1"
            role="group"
            aria-label="Position filters"
          >
            <span className="mr-1 text-[10px] text-muted">POS:</span>
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                aria-pressed={position === pos}
                aria-label={`Filter by ${pos === 'ALL' ? 'all positions' : pos}`}
                className={`px-2 py-1 text-[10px] font-medium tracking-wide transition-colors ${
                  position === pos
                    ? 'bg-cyan/10 text-cyan border border-cyan/30'
                    : 'text-muted hover:text-foreground border border-transparent'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-cyan">
              &gt;
            </span>
            <input
              type="text"
              placeholder="SEARCH_PROSPECT..."
              aria-label="Search prospects by name or school"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-border bg-surface py-1.5 pl-6 pr-3 text-[11px] text-foreground placeholder:text-muted focus:border-cyan focus:outline-none sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="text-[10px] text-muted">
          SHOWING: <span className="text-cyan">{filtered.length}</span> / {players.length} PROSPECTS
          {position !== 'ALL' && (
            <span>
              {' '}
              {'//'} FILTER: <span className="text-cyan">{position}</span>
            </span>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-2">
          {filtered.map((player, i) => (
            <PlayerCard key={player.slug} player={player} rank={player.big_board_rank ?? i + 1} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="border border-border bg-surface p-8 text-center">
            <span className="text-xs text-muted">NO_RESULTS // Adjust filters</span>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-muted">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan" />
          <span>
            END_OF_BOARD // {filtered.length} PROSPECTS // DRAFT_YEAR:
            {players[0]?.draft_year ?? 2026}
          </span>
        </div>
      </div>
    </>
  )
}
