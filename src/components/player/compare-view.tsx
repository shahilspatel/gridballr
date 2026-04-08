'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import type { Player } from '@/types'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import { SEED_PLAYERS_2026 } from '@/lib/data/seed-prospects-2026'
import { formatHeight, formatWeight, getPositionColor, getTierColor } from '@/lib/utils/format'

const ALL_PROSPECTS = [...(SEED_PLAYERS_2026 as Player[]), ...(SEED_PLAYERS as Player[])]

type CompStat = {
  label: string
  key: keyof Player
  format?: 'height' | 'weight' | 'time' | 'number' | 'inches'
  higherBetter?: boolean
  lowerBetter?: boolean
}

const COMP_STATS: CompStat[] = [
  { label: 'HEIGHT', key: 'height_inches', format: 'height', higherBetter: true },
  { label: 'WEIGHT', key: 'weight_lbs', format: 'number', higherBetter: true },
  { label: '40-YARD', key: 'forty_yard', format: 'time', lowerBetter: true },
  { label: 'VERTICAL', key: 'vertical_jump', format: 'inches', higherBetter: true },
  { label: 'BROAD JUMP', key: 'broad_jump', format: 'number', higherBetter: true },
  { label: 'BENCH', key: 'bench_press', format: 'number', higherBetter: true },
  { label: '3-CONE', key: 'three_cone', format: 'time', lowerBetter: true },
  { label: 'SHUTTLE', key: 'shuttle', format: 'time', lowerBetter: true },
  { label: 'ARM LENGTH', key: 'arm_length', format: 'inches', higherBetter: true },
  { label: 'HAND SIZE', key: 'hand_size', format: 'inches', higherBetter: true },
  { label: 'BOARD RANK', key: 'big_board_rank', format: 'number', lowerBetter: true },
]

export function CompareView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [slugA, setSlugA] = useState<string>(searchParams.get('a') ?? 'fernando-mendoza')
  const [slugB, setSlugB] = useState<string>(searchParams.get('b') ?? 'jeremiyah-love')

  // Update URL when players change (shareable links)
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('a', slugA)
    params.set('b', slugB)
    router.replace(`/compare?${params.toString()}`, { scroll: false })
  }, [slugA, slugB, router])

  const playerA = ALL_PROSPECTS.find((p) => p.slug === slugA) as Player | undefined
  const playerB = ALL_PROSPECTS.find((p) => p.slug === slugB) as Player | undefined

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/compare?a=${slugA}&b=${slugB}` : ''

  return (
    <div className="flex flex-col gap-6">
      {/* Player selectors + share */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4">
          <PlayerSelector value={slugA} onChange={setSlugA} label="PLAYER_A" exclude={slugB} />
          <PlayerSelector value={slugB} onChange={setSlugB} label="PLAYER_B" exclude={slugA} />
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(shareUrl)
            toast('LINK_COPIED // Share this comparison')
          }}
          className="self-end border border-border px-3 py-1 text-[10px] text-muted transition-colors hover:border-cyan hover:text-cyan"
          aria-label="Copy shareable comparison link"
        >
          COPY_SHARE_LINK
        </button>
      </div>

      {playerA && playerB && (
        <>
          {/* Player headers */}
          <div className="grid grid-cols-2 gap-4">
            <PlayerHeader player={playerA as Player} />
            <PlayerHeader player={playerB as Player} />
          </div>

          {/* Stat comparison */}
          <div className="border border-border bg-surface">
            <div className="border-b border-border bg-surface-2 px-4 py-2">
              <span className="text-[10px] font-bold tracking-widest text-cyan">
                MEASURABLES_COMPARISON
              </span>
            </div>
            <div className="divide-y divide-border/50">
              {COMP_STATS.map((stat) => (
                <CompareRow
                  key={stat.key}
                  stat={stat}
                  valA={playerA[stat.key] as number | null}
                  valB={playerB[stat.key] as number | null}
                />
              ))}
            </div>
          </div>

          {/* Scouting comparison */}
          <div className="grid grid-cols-2 gap-4">
            <ScoutingPanel player={playerA as Player} />
            <ScoutingPanel player={playerB as Player} />
          </div>
        </>
      )}
    </div>
  )
}

function PlayerSelector({
  value,
  onChange,
  label,
  exclude,
}: {
  value: string
  onChange: (slug: string) => void
  label: string
  exclude: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold tracking-widest text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-cyan focus:outline-none"
      >
        {[2026, 2025].map((year) => (
          <optgroup key={year} label={`${year} Draft Class`}>
            {ALL_PROSPECTS.filter((p) => p.slug !== exclude && p.draft_year === year)
              .sort((a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999))
              .map((p) => (
                <option key={p.slug} value={p.slug}>
                  #{p.big_board_rank} {p.first_name} {p.last_name} — {p.position} — {p.school}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}

function PlayerHeader({ player }: { player: Player }) {
  const posColor = getPositionColor(player.position)
  return (
    <div className="border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-foreground">
          {player.first_name} {player.last_name}
        </span>
        <span
          className="border px-1.5 py-0.5 text-[10px] font-bold"
          style={{ color: posColor, borderColor: posColor }}
        >
          {player.position}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted">
        <span>#{player.big_board_rank}</span>
        <span className="text-border">|</span>
        <span>{player.school}</span>
        <span className="text-border">|</span>
        <span>{player.conference}</span>
      </div>
      {player.player_comp && (
        <div className="mt-1 text-[10px] text-muted">
          <span className="text-cyan/60">COMP:</span> {player.player_comp}
        </div>
      )}
    </div>
  )
}

function CompareRow({
  stat,
  valA,
  valB,
}: {
  stat: CompStat
  valA: number | null
  valB: number | null
}) {
  const formatVal = (v: number | null) => {
    if (v == null) return '—'
    switch (stat.format) {
      case 'height':
        return formatHeight(v)
      case 'weight':
        return `${v}`
      case 'time':
        return v.toFixed(2)
      case 'inches':
        return `${v}"`
      default:
        return `${v}`
    }
  }

  let winA = false
  let winB = false
  if (valA != null && valB != null) {
    if (stat.higherBetter) {
      winA = valA > valB
      winB = valB > valA
    } else if (stat.lowerBetter) {
      winA = valA < valB
      winB = valB < valA
    }
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5">
      <div className="flex justify-end">
        <span
          className={`text-xs font-bold tabular-nums ${winA ? 'text-cyan' : 'text-foreground/60'}`}
        >
          {formatVal(valA)}
        </span>
      </div>
      <div className="px-4">
        <span className="text-[9px] font-bold tracking-widest text-muted">{stat.label}</span>
      </div>
      <div>
        <span
          className={`text-xs font-bold tabular-nums ${winB ? 'text-cyan' : 'text-foreground/60'}`}
        >
          {formatVal(valB)}
        </span>
      </div>
    </div>
  )
}

function ScoutingPanel({ player }: { player: Player }) {
  return (
    <div className="border border-border bg-surface p-4">
      <h3 className="mb-2 text-[10px] font-bold tracking-widest text-cyan">SCOUTING_REPORT</h3>
      <p className="mb-3 text-[11px] leading-relaxed text-foreground/70">
        {player.scouting_summary}
      </p>
      <div className="flex flex-col gap-2">
        <div>
          <span className="text-[9px] font-bold tracking-widest text-green">+ STRENGTHS</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {player.strengths.map((s) => (
              <span
                key={s}
                className="border border-green/20 bg-green/5 px-1.5 py-0.5 text-[9px] text-green"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[9px] font-bold tracking-widest text-red">- WEAKNESSES</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {player.weaknesses.map((w) => (
              <span
                key={w}
                className="border border-red/20 bg-red/5 px-1.5 py-0.5 text-[9px] text-red"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
