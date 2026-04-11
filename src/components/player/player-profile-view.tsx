'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Player, PlayerSeason } from '@/types'
import {
  formatHeight,
  formatWeight,
  formatTime,
  getPositionColor,
  getTierColor,
} from '@/lib/utils/format'
import { getClipsForPlayer } from '@/lib/data/film-clips'

type Tab = 'STATS' | 'FILM' | 'COMPS' | 'GAME_LOG'

export function PlayerProfileView({
  player,
  seasonStats,
}: {
  player: Player
  seasonStats: Omit<PlayerSeason, 'id' | 'player_id'> | null
}) {
  const [activeTab, setActiveTab] = useState<Tab>('STATS')
  const posColor = getPositionColor(player.position)
  const tierColor = player.tier ? getTierColor(player.tier) : '#71717a'
  const clips = getClipsForPlayer(player.slug)

  return (
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
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-col items-end gap-1 text-[10px] text-muted">
              <span>DRAFT_YEAR: {player.draft_year}</span>
              <span>CLASS: {player.class_year ?? '—'}</span>
              {player.hs_ranking && <span>HS_RANK: #{player.hs_ranking}</span>}
            </div>
            <Link
              href={`/compare?a=${player.slug}`}
              className="border border-border px-3 py-1.5 text-[10px] font-bold tracking-wider text-muted transition-colors hover:border-cyan hover:text-cyan"
            >
              COMPARE_WITH...
            </Link>
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
            <MeasurableItem label="ARM" value={player.arm_length ? `${player.arm_length}"` : '—'} />
            <MeasurableItem label="HAND" value={player.hand_size ? `${player.hand_size}"` : '—'} />
          </div>
        </div>

        {/* Scouting Report */}
        <div className="border border-border bg-surface p-4 lg:col-span-2">
          <h2 className="mb-3 text-xs font-bold tracking-widest text-cyan">SCOUTING_REPORT</h2>
          <p className="mb-4 text-sm leading-relaxed text-foreground/80">
            {player.scouting_summary}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-[10px] font-bold tracking-widest text-green">+ STRENGTHS</h3>
              <ul className="flex flex-col gap-1">
                {player.strengths.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-xs text-foreground/70">
                    <span className="text-green">+</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-[10px] font-bold tracking-widest text-red">- WEAKNESSES</h3>
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

      {/* Tabs */}
      <div className="mt-4 border border-border bg-surface">
        <div className="flex border-b border-border">
          {(['STATS', 'FILM', 'COMPS', 'GAME_LOG'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[11px] font-medium tracking-wide transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-cyan text-cyan'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              [{tab}]
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'STATS' && <StatsTab player={player} seasonStats={seasonStats} />}
          {activeTab === 'FILM' && <FilmTab clips={clips} />}
          {activeTab === 'COMPS' && <CompsTab player={player} />}
          {activeTab === 'GAME_LOG' && <GameLogTab />}
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

function StatsTab({
  player,
  seasonStats,
}: {
  player: Player
  seasonStats: Omit<PlayerSeason, 'id' | 'player_id'> | null
}) {
  if (!seasonStats) {
    return (
      <div className="text-center text-xs text-muted">
        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber" />
          <span>SEASON STATS LOADING // DATA PIPELINE IN PROGRESS</span>
        </div>
      </div>
    )
  }

  const isQB = player.position === 'QB'
  const isRB = player.position === 'RB'
  const isWR = player.position === 'WR' || player.position === 'TE'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[10px] text-muted">
        <span>
          SEASON: <span className="text-cyan">{seasonStats.season}</span>
        </span>
        <span className="text-border">|</span>
        <span>
          GP: <span className="text-foreground">{seasonStats.games_played}</span>
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Passing */}
        {isQB && (
          <StatBlock
            title="PASSING"
            stats={[
              {
                label: 'COMP/ATT',
                value: `${seasonStats.pass_completions}/${seasonStats.pass_attempts}`,
              },
              { label: 'YARDS', value: seasonStats.pass_yards?.toLocaleString() ?? '—' },
              { label: 'TDS', value: `${seasonStats.pass_tds}` },
              { label: 'INT', value: `${seasonStats.interceptions}` },
              { label: 'COMP%', value: `${seasonStats.completion_pct?.toFixed(1)}%` },
              { label: 'YPA', value: seasonStats.yards_per_attempt?.toFixed(1) ?? '—' },
              { label: 'RATING', value: seasonStats.passer_rating?.toFixed(1) ?? '—' },
            ]}
          />
        )}

        {/* Rushing */}
        {(isQB || isRB) && (
          <StatBlock
            title="RUSHING"
            stats={[
              { label: 'ATT', value: `${seasonStats.rush_attempts}` },
              { label: 'YARDS', value: seasonStats.rush_yards?.toLocaleString() ?? '—' },
              { label: 'TDS', value: `${seasonStats.rush_tds}` },
              { label: 'YPC', value: seasonStats.yards_per_carry?.toFixed(1) ?? '—' },
            ]}
          />
        )}

        {/* Receiving */}
        {(isWR || isRB) && seasonStats.receptions != null && (
          <StatBlock
            title="RECEIVING"
            stats={[
              { label: 'REC', value: `${seasonStats.receptions}` },
              { label: 'YARDS', value: seasonStats.rec_yards?.toLocaleString() ?? '—' },
              { label: 'TDS', value: `${seasonStats.rec_tds}` },
              { label: 'YPR', value: seasonStats.yards_per_reception?.toFixed(1) ?? '—' },
            ]}
          />
        )}

        {/* Advanced */}
        {seasonStats.epa_per_play != null && (
          <StatBlock
            title="ADVANCED"
            stats={[
              { label: 'EPA/PLAY', value: seasonStats.epa_per_play?.toFixed(3) ?? '—' },
              {
                label: 'SUCCESS%',
                value: seasonStats.success_rate
                  ? `${(seasonStats.success_rate * 100).toFixed(1)}%`
                  : '—',
              },
              { label: 'SNAPS', value: seasonStats.total_snaps?.toLocaleString() ?? '—' },
            ]}
          />
        )}
      </div>
    </div>
  )
}

function StatBlock({ title, stats }: { title: string; stats: { label: string; value: string }[] }) {
  return (
    <div className="border border-border bg-surface-2 p-3">
      <h4 className="mb-2 text-[9px] font-bold tracking-widest text-cyan">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className="text-[8px] font-bold tracking-widest text-muted">{s.label}</span>
            <span className="text-sm font-bold tabular-nums text-foreground">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FilmTab({
  clips,
}: {
  clips: { youtubeId: string; title: string; sourceChannel: string; clipType: string }[]
}) {
  if (clips.length === 0) {
    return (
      <div className="text-center text-xs text-muted">
        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber" />
          <span>NO FILM CLIPS AVAILABLE // CHECK BACK SOON</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-video bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${clips[0].youtubeId}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={clips[0].title}
        />
      </div>
      {clips.length > 1 && (
        <div className="border border-border bg-surface-2">
          {clips.map((clip, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border/50 px-3 py-2 last:border-0"
            >
              <span className="text-[9px] font-bold text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] text-foreground">{clip.title}</span>
                <span className="text-[9px] text-muted">
                  {clip.sourceChannel} {'//'} {clip.clipType.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CompsTab({ player }: { player: Player }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {player.player_comp ? (
        <div className="border border-border bg-surface-2 p-6 text-center">
          <span className="text-[10px] font-bold tracking-widest text-muted">PRIMARY COMP</span>
          <div className="mt-2 text-xl font-bold text-cyan glow">{player.player_comp}</div>
          <p className="mt-2 max-w-md text-[11px] text-muted">
            Statistical similarity analysis and scouting profile comparison. Full comp galaxy
            visualization available with Pro access.
          </p>
          <Link
            href="/galaxy"
            className="mt-3 inline-block border border-cyan/30 bg-cyan/5 px-4 py-1.5 text-[10px] font-bold text-cyan transition-colors hover:bg-cyan/10"
          >
            VIEW IN GALAXY
          </Link>
        </div>
      ) : (
        <div className="text-center text-xs text-muted">
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber" />
            <span>COMP ANALYSIS IN PROGRESS</span>
          </div>
        </div>
      )}
    </div>
  )
}

function GameLogTab() {
  return (
    <div className="text-center text-xs text-muted">
      <div className="flex items-center justify-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-amber" />
        <span>GAME LOG DATA LOADING // CFBD API INTEGRATION IN PROGRESS</span>
      </div>
    </div>
  )
}
