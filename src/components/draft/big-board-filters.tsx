'use client'

import { useState } from 'react'

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DL', 'LB', 'CB', 'S']
const TIERS = ['ALL', 'ELITE', 'FRANCHISE', 'ALL_STAR', 'STARTER', 'ROTATION']

export function BigBoardFilters() {
  const [activePosition, setActivePosition] = useState('ALL')
  const [search, setSearch] = useState('')

  return (
    <div className="border-b border-border bg-background px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Position filters */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-[10px] text-muted">POS:</span>
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setActivePosition(pos)}
              className={`px-2 py-1 text-[10px] font-medium tracking-wide transition-colors ${
                activePosition === pos
                  ? 'bg-cyan/10 text-cyan border border-cyan/30'
                  : 'text-muted hover:text-foreground border border-transparent'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-cyan">
            &gt;
          </span>
          <input
            type="text"
            placeholder="SEARCH_PROSPECT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-border bg-surface py-1.5 pl-6 pr-3 text-[11px] text-foreground placeholder:text-muted focus:border-cyan focus:outline-none sm:w-64"
          />
        </div>
      </div>
    </div>
  )
}
