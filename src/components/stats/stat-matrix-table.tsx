'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Player } from '@/types'
import { formatHeight, getPositionColor } from '@/lib/utils/format'

type SortKey = keyof Player | 'name'
type SortDir = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string; width: string }[] = [
  { key: 'big_board_rank', label: 'RK', width: 'w-12' },
  { key: 'name', label: 'PLAYER', width: 'w-48' },
  { key: 'position', label: 'POS', width: 'w-14' },
  { key: 'school', label: 'SCHOOL', width: 'w-32' },
  { key: 'height_inches', label: 'HT', width: 'w-16' },
  { key: 'weight_lbs', label: 'WT', width: 'w-16' },
  { key: 'forty_yard', label: '40YD', width: 'w-16' },
  { key: 'vertical_jump', label: 'VERT', width: 'w-16' },
  { key: 'broad_jump', label: 'BROAD', width: 'w-16' },
  { key: 'bench_press', label: 'BENCH', width: 'w-16' },
  { key: 'three_cone', label: '3CON', width: 'w-16' },
  { key: 'arm_length', label: 'ARM', width: 'w-16' },
  { key: 'hand_size', label: 'HAND', width: 'w-16' },
  { key: 'tier', label: 'TIER', width: 'w-20' },
]

const POSITION_FILTERS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DL', 'LB', 'CB', 'S']

export function StatMatrixTable({ players }: { players: Player[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('big_board_rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [posFilter, setPosFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = [...players]

    if (posFilter !== 'ALL') {
      result = result.filter((p) => p.position === posFilter)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
          p.school.toLowerCase().includes(q),
      )
    }

    result.sort((a, b) => {
      let aVal: any
      let bVal: any

      if (sortKey === 'name') {
        aVal = `${a.last_name} ${a.first_name}`
        bVal = `${b.last_name} ${b.first_name}`
      } else {
        aVal = a[sortKey as keyof Player]
        bVal = b[sortKey as keyof Player]
      }

      if (aVal == null) return 1
      if (bVal == null) return -1
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [players, posFilter, search, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-[10px] text-muted">FILTER:</span>
          {POSITION_FILTERS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosFilter(pos)}
              className={`px-2 py-1 text-[10px] font-medium tracking-wide transition-colors ${
                posFilter === pos
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
            placeholder="SEARCH..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-border bg-surface py-1.5 pl-6 pr-3 text-[11px] text-foreground placeholder:text-muted focus:border-cyan focus:outline-none sm:w-56"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-2 text-[10px] text-muted">
        RESULTS: <span className="text-cyan">{filtered.length}</span> / {players.length} PROSPECTS
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`${col.width} cursor-pointer px-2 py-2 text-left text-[10px] font-bold tracking-wider text-muted transition-colors hover:text-cyan`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-cyan">{sortDir === 'asc' ? '^' : 'v'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((player) => (
              <tr
                key={player.slug}
                className="border-b border-border/50 transition-colors hover:bg-surface"
              >
                <td className="px-2 py-2 text-xs font-bold tabular-nums text-muted">
                  {player.big_board_rank ?? '—'}
                </td>
                <td className="px-2 py-2">
                  <Link
                    href={`/players/${player.slug}`}
                    className="text-xs font-medium text-foreground hover:text-cyan transition-colors"
                  >
                    {player.first_name} {player.last_name}
                  </Link>
                </td>
                <td className="px-2 py-2">
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: getPositionColor(player.position) }}
                  >
                    {player.position}
                  </span>
                </td>
                <td className="px-2 py-2 text-xs text-muted">{player.school}</td>
                <td className="px-2 py-2 text-xs tabular-nums text-muted">
                  {formatHeight(player.height_inches)}
                </td>
                <td className="px-2 py-2 text-xs tabular-nums text-muted">
                  {player.weight_lbs ?? '—'}
                </td>
                <td className="px-2 py-2 text-xs tabular-nums text-muted">
                  {player.forty_yard?.toFixed(2) ?? '—'}
                </td>
                <td className="px-2 py-2 text-xs tabular-nums text-muted">
                  {player.vertical_jump ?? '—'}
                </td>
                <td className="px-2 py-2 text-xs tabular-nums text-muted">
                  {player.broad_jump ?? '—'}
                </td>
                <td className="px-2 py-2 text-xs tabular-nums text-muted">
                  {player.bench_press ?? '—'}
                </td>
                <td className="px-2 py-2 text-xs tabular-nums text-muted">
                  {player.three_cone?.toFixed(2) ?? '—'}
                </td>
                <td className="px-2 py-2 text-xs tabular-nums text-muted">
                  {player.arm_length ?? '—'}
                </td>
                <td className="px-2 py-2 text-xs tabular-nums text-muted">
                  {player.hand_size ?? '—'}
                </td>
                <td className="px-2 py-2">
                  {player.tier && (
                    <span
                      className={`text-[9px] font-bold tracking-wider tier-${player.tier.toLowerCase().replace('_', '-')}`}
                    >
                      {player.tier.replace('_', ' ')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
