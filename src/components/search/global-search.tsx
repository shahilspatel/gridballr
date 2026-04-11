'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import { SEED_PLAYERS_2026 } from '@/lib/data/seed-prospects-2026'
import { getPositionColor } from '@/lib/utils/format'
const ALL_PROSPECTS = [...SEED_PLAYERS_2026, ...SEED_PLAYERS]

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    return ALL_PROSPECTS.filter(
      (p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
        p.school.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q),
    ).slice(0, 8)
  }, [query])

  // Cmd+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const selectPlayer = (slug: string) => {
    setOpen(false)
    setQuery('')
    router.push(`/players/${slug}`)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => {
          setOpen(false)
          setQuery('')
        }}
      />

      {/* Search panel */}
      <div className="relative w-full max-w-lg mx-4">
        <div className="border border-border bg-surface shadow-2xl shadow-cyan/5">
          {/* Input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="text-[10px] text-cyan">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prospects, schools, positions..."
              aria-label="Search prospects"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
            <kbd className="border border-border px-1.5 py-0.5 text-[9px] text-muted">ESC</kbd>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              {results.map((player) => (
                <button
                  key={player.slug}
                  onClick={() => selectPlayer(player.slug)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cyan/5 border-b border-border/30 last:border-0"
                >
                  <span className="w-8 text-xs font-bold tabular-nums text-muted">
                    #{player.big_board_rank}
                  </span>
                  <span
                    className="w-10 text-[10px] font-bold"
                    style={{ color: getPositionColor(player.position) }}
                  >
                    {player.position}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-foreground">
                      {player.first_name} {player.last_name}
                    </span>
                    <span className="ml-2 text-[10px] text-muted">{player.school}</span>
                  </div>
                  <span className="text-[9px] text-muted">{player.draft_year}</span>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] text-muted">
              NO_RESULTS // Try a different search
            </div>
          )}

          {query.length < 2 && (
            <div className="px-4 py-4 text-[10px] text-muted">
              <span>Search across all {ALL_PROSPECTS.length} prospects (2025 + 2026 classes)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
