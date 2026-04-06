'use client'

import { useState } from 'react'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import { FILM_CLIPS, getClipsForPlayer } from '@/lib/data/film-clips'
import { getPositionColor } from '@/lib/utils/format'
import type { Player } from '@/types'

export function FilmTerminalView() {
  const [selectedSlug, setSelectedSlug] = useState('shedeur-sanders')
  const [activeClipIdx, setActiveClipIdx] = useState(0)
  const [notes, setNotes] = useState('')

  const player = SEED_PLAYERS.find((p) => p.slug === selectedSlug) as Player | undefined
  const clips = getClipsForPlayer(selectedSlug)
  const activeClip = clips[activeClipIdx]

  return (
    <div className="flex flex-col gap-4">
      {/* Player selector */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-widest text-muted">PROSPECT:</span>
        <select
          value={selectedSlug}
          onChange={(e) => {
            setSelectedSlug(e.target.value)
            setActiveClipIdx(0)
          }}
          className="border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:border-cyan focus:outline-none"
        >
          {(SEED_PLAYERS as Player[])
            .sort((a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999))
            .map((p) => (
              <option key={p.slug} value={p.slug}>
                #{p.big_board_rank} {p.first_name} {p.last_name} — {p.position}
              </option>
            ))}
        </select>
        {player && (
          <span
            className="border px-1.5 py-0.5 text-[10px] font-bold"
            style={{
              color: getPositionColor(player.position),
              borderColor: getPositionColor(player.position),
            }}
          >
            {player.position}
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Video panel */}
        <div className="border border-border bg-surface lg:col-span-2">
          <div className="border-b border-border bg-surface-2 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-cyan">VIDEO_FEED</span>
              <span className="text-[9px] text-muted">{clips.length} CLIPS AVAILABLE</span>
            </div>
          </div>
          {activeClip ? (
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeClip.youtubeId}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeClip.title}
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-black">
              <span className="text-[10px] text-muted">NO CLIPS AVAILABLE FOR THIS PROSPECT</span>
            </div>
          )}
          {/* Clip list */}
          {clips.length > 0 && (
            <div className="border-t border-border">
              {clips.map((clip, i) => (
                <button
                  key={i}
                  onClick={() => setActiveClipIdx(i)}
                  className={`flex w-full items-center gap-3 border-b border-border/50 px-3 py-2 text-left transition-colors ${
                    i === activeClipIdx ? 'bg-cyan/5' : 'hover:bg-surface-2'
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold ${
                      i === activeClipIdx ? 'text-cyan' : 'text-muted'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-foreground">{clip.title}</span>
                    <span className="text-[9px] text-muted">
                      {clip.sourceChannel} // {clip.clipType.toUpperCase()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Side panels */}
        <div className="flex flex-col gap-4">
          {/* Scouting summary */}
          {player && (
            <div className="border border-border bg-surface">
              <div className="border-b border-border bg-surface-2 px-3 py-2">
                <span className="text-[10px] font-bold tracking-widest text-cyan">INTEL</span>
              </div>
              <div className="p-3">
                <p className="text-[11px] leading-relaxed text-foreground/70">
                  {player.scouting_summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
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
            </div>
          )}

          {/* Notes */}
          <div className="border border-border bg-surface">
            <div className="border-b border-border bg-surface-2 px-3 py-2">
              <span className="text-[10px] font-bold tracking-widest text-cyan">NOTES</span>
            </div>
            <div className="p-3">
              <textarea
                placeholder="Your scouting notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-32 w-full resize-none border border-border bg-background p-2 text-[11px] text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
              />
            </div>
          </div>

          {/* Measurables quick view */}
          {player && (
            <div className="border border-border bg-surface">
              <div className="border-b border-border bg-surface-2 px-3 py-2">
                <span className="text-[10px] font-bold tracking-widest text-cyan">QUANT</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {[
                  { label: '40YD', val: player.forty_yard?.toFixed(2) },
                  { label: 'VERT', val: player.vertical_jump ? `${player.vertical_jump}"` : null },
                  { label: 'BROAD', val: player.broad_jump ? `${player.broad_jump}"` : null },
                  { label: 'BENCH', val: player.bench_press ? `${player.bench_press}` : null },
                ].map(({ label, val }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-[8px] font-bold tracking-widest text-muted">{label}</span>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {val ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
