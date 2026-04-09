'use client'

import { useState } from 'react'
import { DEVY_PROSPECTS, type DevyProspect } from '@/lib/data/devy-prospects'
import { getPositionColor } from '@/lib/utils/format'

const YEAR_TABS = [
  { year: 2027, label: 'NEXT' },
  { year: 2028, label: 'FUTURE' },
]

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'DEF']

const DEF_POSITIONS = new Set(['CB', 'S', 'LB', 'DL', 'EDGE'])

type SortKey =
  | 'ranking'
  | 'name'
  | 'position'
  | 'school'
  | 'class_year'
  | 'stars'
  | 'tier'
  | 'trend'
type SortDir = 'asc' | 'desc'

const TIER_ORDER: Record<string, number> = { ELITE: 0, PREMIUM: 1, RISING: 2, WATCH: 3 }
const TREND_ORDER: Record<string, number> = { up: 0, stable: 1, down: 2 }

function getTierBadge(tier: string) {
  switch (tier) {
    case 'ELITE':
      return 'text-cyan border-cyan/30 bg-cyan/5'
    case 'PREMIUM':
      return 'text-green border-green/30 bg-green/5'
    case 'RISING':
      return 'text-amber border-amber/30 bg-amber/5'
    case 'WATCH':
      return 'text-foreground/60 border-border bg-surface-2'
    default:
      return 'text-muted border-border bg-surface-2'
  }
}

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

function renderStars(count: number) {
  return '\u2605'.repeat(count) + '\u2606'.repeat(5 - count)
}

export function DevyTracker() {
  const [activeYear, setActiveYear] = useState(2027)
  const [posFilter, setPosFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('ranking')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const prospects = DEVY_PROSPECTS.filter((p) => p.draft_eligible === activeYear)
    .filter((p) => {
      if (posFilter === 'ALL') return true
      if (posFilter === 'DEF') return DEF_POSITIONS.has(p.position)
      return p.position === posFilter
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'ranking':
          return (a.ranking - b.ranking) * dir
        case 'name':
          return a.name.localeCompare(b.name) * dir
        case 'position':
          return a.position.localeCompare(b.position) * dir
        case 'school':
          return a.school.localeCompare(b.school) * dir
        case 'class_year':
          return a.class_year.localeCompare(b.class_year) * dir
        case 'stars':
          return (a.stars - b.stars) * dir
        case 'tier':
          return ((TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99)) * dir
        case 'trend':
          return ((TREND_ORDER[a.trend] ?? 99) - (TREND_ORDER[b.trend] ?? 99)) * dir
        default:
          return 0
      }
    })

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

      {/* Devy table */}
      <div className="border border-border bg-surface">
        <div className="border-b border-border bg-surface-2 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-cyan">
              {activeYear}_DEVY_CLASS
            </span>
            <span className="text-[9px] text-muted">
              {prospects.length} PROSPECTS // DEVELOPMENTAL
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_3rem_4.5rem_2.5rem_3.5rem_4rem_2.5rem] items-center gap-1.5 border-b border-border px-4 py-2 text-[9px] font-bold tracking-widest text-muted sm:grid-cols-[2rem_1fr_3.5rem_5rem_3rem_4rem_4.5rem_3rem]">
          <SortHeader
            label="RK"
            sortKey="ranking"
            current={sortKey}
            dir={sortDir}
            onSort={handleSort}
          />
          <SortHeader
            label="PLAYER"
            sortKey="name"
            current={sortKey}
            dir={sortDir}
            onSort={handleSort}
          />
          <SortHeader
            label="POS"
            sortKey="position"
            current={sortKey}
            dir={sortDir}
            onSort={handleSort}
          />
          <SortHeader
            label="SCHOOL"
            sortKey="school"
            current={sortKey}
            dir={sortDir}
            onSort={handleSort}
          />
          <SortHeader
            label="YR"
            sortKey="class_year"
            current={sortKey}
            dir={sortDir}
            onSort={handleSort}
          />
          <SortHeader
            label="STARS"
            sortKey="stars"
            current={sortKey}
            dir={sortDir}
            onSort={handleSort}
          />
          <SortHeader
            label="TIER"
            sortKey="tier"
            current={sortKey}
            dir={sortDir}
            onSort={handleSort}
            align="right"
          />
          <SortHeader
            label="TRD"
            sortKey="trend"
            current={sortKey}
            dir={sortDir}
            onSort={handleSort}
            align="center"
          />
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {prospects.map((p) => (
            <DevyRow
              key={p.slug}
              prospect={p}
              expanded={expandedSlug === p.slug}
              onToggle={() => setExpandedSlug(expandedSlug === p.slug ? null : p.slug)}
            />
          ))}
        </div>

        {prospects.length === 0 && (
          <div className="px-4 py-8 text-center text-[10px] text-muted">
            NO PROSPECTS AT THIS POSITION
          </div>
        )}
      </div>
    </div>
  )
}

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
  align,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
  align?: 'left' | 'center' | 'right'
}) {
  const active = current === sortKey
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`${alignClass} text-[9px] font-bold tracking-widest transition-colors ${
        active ? 'text-cyan' : 'text-muted hover:text-foreground'
      }`}
    >
      {label}
      {active && <span className="ml-0.5">{dir === 'asc' ? '\u25B2' : '\u25BC'}</span>}
    </button>
  )
}

function DevyRow({
  prospect,
  expanded,
  onToggle,
}: {
  prospect: DevyProspect
  expanded: boolean
  onToggle: () => void
}) {
  const posColor = getPositionColor(prospect.position)

  return (
    <div>
      <button
        onClick={onToggle}
        className="grid w-full grid-cols-[2rem_1fr_3rem_4.5rem_2.5rem_3.5rem_4rem_2.5rem] items-center gap-1.5 px-4 py-2.5 text-left transition-colors hover:bg-surface-2 sm:grid-cols-[2rem_1fr_3.5rem_5rem_3rem_4rem_4.5rem_3rem]"
      >
        <span className="text-[10px] font-bold tabular-nums text-muted">
          {String(prospect.ranking).padStart(2, '0')}
        </span>
        <span className="truncate text-xs font-medium text-foreground">{prospect.name}</span>
        <span className="text-[10px] font-bold" style={{ color: posColor }}>
          {prospect.position}
        </span>
        <span className="truncate text-[10px] text-muted">{prospect.school}</span>
        <span className="text-[10px] text-muted">{prospect.class_year}</span>
        <span className="text-[10px] text-amber">{renderStars(prospect.stars)}</span>
        <span
          className={`border px-1.5 py-0.5 text-right text-[9px] font-bold ${getTierBadge(prospect.tier)}`}
        >
          {prospect.tier}
        </span>
        <span className={`text-center text-xs font-bold ${getTrendColor(prospect.trend)}`}>
          {getTrendIcon(prospect.trend)}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border/30 bg-surface-2 px-4 py-2.5">
          <div className="flex items-start gap-2">
            <span className="text-[9px] font-bold tracking-widest text-cyan">SCOUT_NOTE:</span>
            <span className="text-[11px] text-foreground/80">{prospect.scouting_note}</span>
          </div>
        </div>
      )}
    </div>
  )
}
