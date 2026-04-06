import { notFound } from 'next/navigation'
import { TerminalHeader } from '@/components/layout/terminal-header'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import {
  formatHeight,
  formatWeight,
  formatTime,
  getPositionColor,
  getTierColor,
} from '@/lib/utils/format'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const player = SEED_PLAYERS.find((p) => p.slug === slug)
  if (!player) return { title: 'Player Not Found' }
  return {
    title: `${player.first_name} ${player.last_name} — ${player.position} | ${player.school}`,
    description: player.scouting_summary ?? undefined,
  }
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params
  const player = SEED_PLAYERS.find((p) => p.slug === slug)
  if (!player) notFound()

  const posColor = getPositionColor(player.position)
  const tierColor = player.tier ? getTierColor(player.tier) : '#71717a'

  return (
    <div>
      <TerminalHeader
        title="PLAYER_PROFILE"
        subtitle={`${player.first_name} ${player.last_name}`}
        status="DATA_LOADED"
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Player header */}
        <div className="border border-border bg-surface p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] text-muted">
                <span>RANK #{player.big_board_rank ?? '—'}</span>
                <span className="text-border">|</span>
                <span>{player.school}</span>
                <span className="text-border">|</span>
                <span>{player.conference}</span>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {player.first_name} <span className="text-cyan glow">{player.last_name}</span>
                </h1>
                <span
                  className="border px-2 py-0.5 text-xs font-bold"
                  style={{ color: posColor, borderColor: posColor }}
                >
                  {player.position}
                </span>
                {player.tier && (
                  <span
                    className="border px-2 py-0.5 text-[10px] font-bold tracking-wider"
                    style={{ color: tierColor, borderColor: tierColor }}
                  >
                    {player.tier.replace('_', ' ')}
                  </span>
                )}
              </div>

              {player.player_comp && (
                <div className="text-xs text-muted">
                  <span className="text-cyan/60">PLAYER_COMP:</span> {player.player_comp}
                </div>
              )}
            </div>

            {/* Draft info */}
            <div className="flex flex-col items-end gap-1 text-[10px] text-muted">
              <span>DRAFT_YEAR: {player.draft_year}</span>
              <span>CLASS: {player.class_year ?? '—'}</span>
              {player.hs_ranking && <span>HS_RANK: #{player.hs_ranking}</span>}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {/* Measurables */}
          <div className="border border-border bg-surface p-4">
            <h2 className="mb-3 text-xs font-bold tracking-widest text-cyan">MEASURABLES</h2>
            <div className="grid grid-cols-2 gap-3">
              <MeasurableItem label="HEIGHT" value={formatHeight(player.height_inches)} />
              <MeasurableItem label="WEIGHT" value={formatWeight(player.weight_lbs)} />
              <MeasurableItem
                label="40-YARD"
                value={player.forty_yard ? `${formatTime(player.forty_yard)}s` : '—'}
              />
              <MeasurableItem
                label="BENCH"
                value={player.bench_press ? `${player.bench_press} reps` : '—'}
              />
              <MeasurableItem
                label="VERTICAL"
                value={player.vertical_jump ? `${player.vertical_jump}"` : '—'}
              />
              <MeasurableItem
                label="BROAD"
                value={player.broad_jump ? `${player.broad_jump}"` : '—'}
              />
              <MeasurableItem
                label="3-CONE"
                value={player.three_cone ? `${formatTime(player.three_cone)}s` : '—'}
              />
              <MeasurableItem
                label="SHUTTLE"
                value={player.shuttle ? `${formatTime(player.shuttle)}s` : '—'}
              />
              <MeasurableItem
                label="ARM"
                value={player.arm_length ? `${player.arm_length}"` : '—'}
              />
              <MeasurableItem
                label="HAND"
                value={player.hand_size ? `${player.hand_size}"` : '—'}
              />
            </div>
          </div>

          {/* Scouting Report */}
          <div className="border border-border bg-surface p-4 lg:col-span-2">
            <h2 className="mb-3 text-xs font-bold tracking-widest text-cyan">SCOUTING_REPORT</h2>
            <p className="mb-4 text-sm leading-relaxed text-foreground/80">
              {player.scouting_summary}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Strengths */}
              <div>
                <h3 className="mb-2 text-[10px] font-bold tracking-widest text-green">
                  + STRENGTHS
                </h3>
                <ul className="flex flex-col gap-1">
                  {player.strengths.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-xs text-foreground/70">
                      <span className="text-green">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 className="mb-2 text-[10px] font-bold tracking-widest text-red">
                  - WEAKNESSES
                </h3>
                <ul className="flex flex-col gap-1">
                  {player.weaknesses.map((w) => (
                    <li key={w} className="flex items-center gap-2 text-xs text-foreground/70">
                      <span className="text-red">-</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation placeholder */}
        <div className="mt-4 border border-border bg-surface">
          <div className="flex border-b border-border">
            {['STATS', 'FILM', 'COMPS', 'GAME_LOG'].map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-2.5 text-[11px] font-medium tracking-wide transition-colors ${
                  i === 0 ? 'border-b-2 border-cyan text-cyan' : 'text-muted hover:text-foreground'
                }`}
              >
                [{tab}]
              </button>
            ))}
          </div>
          <div className="p-6 text-center text-xs text-muted">
            <div className="flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber" />
              <span>STATS_MODULE // LOADING DATA...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MeasurableItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-medium tracking-widest text-muted">{label}</span>
      <span className="text-sm font-bold tabular-nums text-foreground">{value}</span>
    </div>
  )
}
