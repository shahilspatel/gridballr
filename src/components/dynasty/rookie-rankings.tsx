'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DYNASTY_ROOKIE_VALUES,
  DYNASTY_ROOKIE_VALUES_2026,
  type DynastyPlayerValue,
} from '@/lib/data/dynasty-values'
import { getPositionColor } from '@/lib/utils/format'

const YEAR_TABS = [
  { year: 2026, label: 'UPCOMING', players: DYNASTY_ROOKIE_VALUES_2026 },
  { year: 2025, label: 'COMPLETED', players: DYNASTY_ROOKIE_VALUES },
]

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE']

function getTrendIcon(trend: string) {
  if (trend === 'up') return '\u2191'
  if (trend === 'down') return '\u2193'
  return '\u2014'
}

function getTrendColor(trend: string) {
  if (trend === 'up') return 'text-green'
  if (trend === 'down') return 'text-red'
  return 'text-muted'
}

function getTierColor(tier: string) {
  switch (tier) {
    case 'Elite':
      return 'text-cyan border-cyan/30 bg-cyan/5'
    case 'Premium':
      return 'text-green border-green/30 bg-green/5'
    case 'Strong':
      return 'text-amber border-amber/30 bg-amber/5'
    case 'Solid':
      return 'text-foreground/60 border-border bg-surface-2'
    default:
      return 'text-muted border-border bg-surface-2'
  }
}

export function RookieRankings() {
  const [activeYear, setActiveYear] = useState(2026)
  const [posFilter, setPosFilter] = useState('ALL')

  const yearData = YEAR_TABS.find((t) => t.year === activeYear)!
  const players = yearData.players
    .filter((p) => posFilter === 'ALL' || p.position === posFilter)
    .sort((a, b) => b.value - a.value)

  return (
    <div className="flex flex-col gap-4">
      {/* Year toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          {YEAR_TABS.map((t) => (
            <button
              key={t.year}
              onClick={() => setActiveYear(t.year)}
              className={`px-3 py-1.5 text-[11px] font-bold tracking-wider transition-colors ${
                activeYear === t.year
                  ? 'bg-cyan/10 text-cyan border border-cyan/30'
                  : 'text-muted hover:text-foreground border border-transparent'
              }`}
            >
              {t.year}
              <span
                className={`ml-1.5 text-[8px] ${
                  activeYear === t.year ? 'text-cyan/70' : 'text-muted'
                }`}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Position filter */}
        <div className="flex items-center gap-1">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosFilter(pos)}
              className={`px-2 py-1 text-[10px] font-bold transition-colors ${
                posFilter === pos
                  ? 'bg-cyan/10 text-cyan border border-cyan/30'
                  : 'text-muted hover:text-foreground border border-transparent'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings table */}
      <div className="border border-border bg-surface">
        <div className="border-b border-border bg-surface-2 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-cyan">
              {activeYear}_ROOKIE_CLASS
            </span>
            <span className="text-[9px] text-muted">
              {players.length} PROSPECTS // SUPERFLEX VALUES
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_3rem_4rem_3.5rem_4rem] items-center gap-2 border-b border-border px-4 py-2 text-[9px] font-bold tracking-widest text-muted sm:grid-cols-[2rem_1fr_4rem_5rem_4rem_5rem]">
          <span>RK</span>
          <span>PLAYER</span>
          <span>POS</span>
          <span className="text-right">VALUE</span>
          <span className="text-center">TREND</span>
          <span className="text-right">TIER</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {players.map((player, i) => (
            <RookieRow key={player.slug} player={player} rank={i + 1} />
          ))}
        </div>

        {players.length === 0 && (
          <div className="px-4 py-8 text-center text-[10px] text-muted">
            NO PROSPECTS AT THIS POSITION
          </div>
        )}
      </div>
    </div>
  )
}

function RookieRow({ player, rank }: { player: DynastyPlayerValue; rank: number }) {
  const posColor = getPositionColor(player.position)

  return (
    <div className="grid grid-cols-[2rem_1fr_3rem_4rem_3.5rem_4rem] items-center gap-2 px-4 py-2.5 transition-colors hover:bg-surface-2 sm:grid-cols-[2rem_1fr_4rem_5rem_4rem_5rem]">
      <span className="text-[10px] font-bold tabular-nums text-muted">
        {String(rank).padStart(2, '0')}
      </span>
      <Link
        href={`/players/${player.slug}`}
        className="text-xs font-medium text-foreground transition-colors hover:text-cyan"
      >
        {player.name}
      </Link>
      <span className="text-[10px] font-bold" style={{ color: posColor }}>
        {player.position}
      </span>
      <span className="text-right text-xs font-bold tabular-nums text-foreground">
        {player.value.toLocaleString()}
      </span>
      <span className={`text-center text-xs font-bold ${getTrendColor(player.trend)}`}>
        {getTrendIcon(player.trend)}
      </span>
      <span
        className={`border px-1.5 py-0.5 text-right text-[9px] font-bold ${getTierColor(player.tier)}`}
      >
        {player.tier.toUpperCase()}
      </span>
    </div>
  )
}
