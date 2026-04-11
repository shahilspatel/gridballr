'use client'

import { useState, useEffect, useRef } from 'react'
import { SEED_PLAYERS_2026 } from '@/lib/data/seed-prospects-2026'
import { getPositionColor } from '@/lib/utils/format'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import type { SeedPlayer } from '@/types'

const INITIAL_PLAYERS = SEED_PLAYERS_2026.slice().sort(
  (a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999),
)

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type RankingEntry = { slug: string; notes: string | null }

const LS_KEY = 'gridballr_my_board'

function boardToRankings(board: SeedPlayer[], notes: Record<string, string>): RankingEntry[] {
  return board.map((p) => ({ slug: p.slug, notes: notes[p.slug] || null }))
}

function rankingsToBoard(
  rankings: RankingEntry[],
  allPlayers: SeedPlayer[],
): { board: SeedPlayer[]; notes: Record<string, string> } {
  const playerMap = new Map(allPlayers.map((p) => [p.slug, p]))
  const board: SeedPlayer[] = []
  const notes: Record<string, string> = {}

  for (const entry of rankings) {
    const player = playerMap.get(entry.slug)
    if (player) {
      board.push(player)
      if (entry.notes) notes[entry.slug] = entry.notes
      playerMap.delete(entry.slug)
    }
  }

  // Append any new players not in saved rankings
  for (const player of INITIAL_PLAYERS) {
    if (playerMap.has(player.slug)) {
      board.push(player)
    }
  }

  return { board, notes }
}

export function MyBoardBuilder() {
  const { toast } = useToast()
  const [board, setBoard] = useState<SeedPlayer[]>(INITIAL_PLAYERS)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [userId, setUserId] = useState<string | null>(null)
  const [boardId, setBoardId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  // Load board on mount
  useEffect(() => {
    async function load() {
      const supabase = getSupabase()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('draft_boards')
          .select('id, rankings')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single()

        if (data?.rankings) {
          const { board: restored, notes: restoredNotes } = rankingsToBoard(
            data.rankings as RankingEntry[],
            INITIAL_PLAYERS,
          )
          setBoard(restored)
          setNotes(restoredNotes)
          setBoardId(data.id)
        }
      } else {
        // Anonymous: load from localStorage
        try {
          const stored = localStorage.getItem(LS_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            // Guard against corrupted or stale-shape localStorage data.
            if (!Array.isArray(parsed)) throw new Error('stored rankings is not an array')
            const rankings = parsed as RankingEntry[]
            const { board: restored, notes: restoredNotes } = rankingsToBoard(
              rankings,
              INITIAL_PLAYERS,
            )
            setBoard(restored)
            setNotes(restoredNotes)
          }
        } catch {
          // Ignore corrupt localStorage
        }
      }
      setLoaded(true)
    }
    load()
  }, [])

  // Auto-save with debounce
  useEffect(() => {
    if (!loaded) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      const rankings = boardToRankings(board, notes)

      if (userId) {
        const supabase = getSupabase()
        setSaveStatus('saving')
        try {
          if (boardId) {
            const { error } = await supabase
              .from('draft_boards')
              .update({ rankings, updated_at: new Date().toISOString() })
              .eq('id', boardId)
            if (error) throw error
          } else {
            const { data, error } = await supabase
              .from('draft_boards')
              .insert({ user_id: userId, name: 'My Board', rankings })
              .select('id')
              .single()
            if (error) throw error
            if (data) setBoardId(data.id)
          }
          setSaveStatus('saved')
        } catch {
          setSaveStatus('error')
        }
      } else {
        // Anonymous: save to localStorage
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(rankings))
          setSaveStatus('saved')
        } catch {
          setSaveStatus('error')
        }
      }
    }, 1500)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [board, notes, loaded, userId, boardId])

  const handleDragStart = (idx: number) => {
    setDragIdx(idx)
  }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return

    const newBoard = [...board]
    const [dragged] = newBoard.splice(dragIdx, 1)
    newBoard.splice(idx, 0, dragged)
    setBoard(newBoard)
    setDragIdx(idx)
  }

  const handleDragEnd = () => {
    setDragIdx(null)
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    const newBoard = [...board]
    ;[newBoard[idx - 1], newBoard[idx]] = [newBoard[idx], newBoard[idx - 1]]
    setBoard(newBoard)
  }

  const moveDown = (idx: number) => {
    if (idx === board.length - 1) return
    const newBoard = [...board]
    ;[newBoard[idx], newBoard[idx + 1]] = [newBoard[idx + 1], newBoard[idx]]
    setBoard(newBoard)
  }

  const resetBoard = async () => {
    setBoard(INITIAL_PLAYERS)
    setNotes({})
    if (userId && boardId) {
      await getSupabase()
        .from('draft_boards')
        .update({
          rankings: boardToRankings(INITIAL_PLAYERS, {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', boardId)
    } else {
      localStorage.removeItem(LS_KEY)
    }
    setSaveStatus('saved')
    toast('BOARD_RESET // Default rankings restored')
  }

  const exportBoard = () => {
    const text = board
      .map(
        (p, i) =>
          `${i + 1}. ${p.first_name} ${p.last_name} (${p.position}, ${p.school})${notes[p.slug] ? ` — ${notes[p.slug]}` : ''}`,
      )
      .join('\n')
    navigator.clipboard.writeText(text)
    toast('BOARD_EXPORTED // Copied to clipboard')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-muted">
          <span className="text-cyan">{board.length}</span> PROSPECTS // DRAG TO REORDER
        </div>
        <div className="flex items-center gap-2">
          {saveStatus !== 'idle' && (
            <span
              className={`text-[9px] font-bold tracking-widest ${
                saveStatus === 'saving'
                  ? 'text-yellow'
                  : saveStatus === 'saved'
                    ? 'text-green'
                    : 'text-red'
              }`}
            >
              {saveStatus === 'saving'
                ? 'SAVING...'
                : saveStatus === 'saved'
                  ? 'SAVED'
                  : 'SAVE_ERROR'}
            </span>
          )}
          <button
            onClick={exportBoard}
            className="border border-border px-3 py-1.5 text-[10px] font-bold text-muted transition-colors hover:border-cyan hover:text-cyan"
          >
            COPY_BOARD
          </button>
          <button
            onClick={resetBoard}
            className="border border-border px-3 py-1.5 text-[10px] font-bold text-muted transition-colors hover:border-red hover:text-red"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="border border-border bg-surface">
        <div className="border-b border-border bg-surface-2 px-4 py-2">
          <div className="grid grid-cols-[2.5rem_2.5rem_1fr_3rem_6rem_auto] items-center gap-2 text-[10px] font-bold tracking-widest text-muted">
            <span>RK</span>
            <span></span>
            <span>PLAYER</span>
            <span>POS</span>
            <span>SCHOOL</span>
            <span></span>
          </div>
        </div>
        <div className="divide-y divide-border/30">
          {board.map((player, idx) => (
            <div
              key={player.slug}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`grid grid-cols-[2.5rem_2.5rem_1fr_3rem_6rem_auto] items-center gap-2 px-4 py-2 transition-colors hover:bg-surface-2 cursor-grab active:cursor-grabbing ${
                dragIdx === idx ? 'bg-cyan/5 border-l-2 border-l-cyan' : ''
              }`}
            >
              <span className="text-xs font-bold tabular-nums text-muted">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveUp(idx)}
                  className="text-[8px] text-muted hover:text-cyan leading-none"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  className="text-[8px] text-muted hover:text-cyan leading-none"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-foreground truncate">
                  {player.first_name} {player.last_name}
                </span>
                {notes[player.slug] && (
                  <div className="text-[9px] text-muted truncate">{notes[player.slug]}</div>
                )}
              </div>
              <span
                className="text-[10px] font-bold"
                style={{ color: getPositionColor(player.position) }}
              >
                {player.position}
              </span>
              <span className="text-[10px] text-muted truncate">{player.school}</span>
              <button
                onClick={() => setEditingNote(editingNote === player.slug ? null : player.slug)}
                className="text-[9px] text-muted hover:text-cyan transition-colors"
              >
                {notes[player.slug] ? 'EDIT' : '+NOTE'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Note editor */}
      {editingNote && (
        <div className="border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-widest text-cyan">
              NOTE // {board.find((p) => p.slug === editingNote)?.first_name}{' '}
              {board.find((p) => p.slug === editingNote)?.last_name}
            </span>
            <button
              onClick={() => setEditingNote(null)}
              className="text-[10px] text-muted hover:text-foreground"
            >
              CLOSE
            </button>
          </div>
          <textarea
            value={notes[editingNote] ?? ''}
            onChange={(e) => setNotes({ ...notes, [editingNote]: e.target.value })}
            placeholder="Add scouting notes..."
            className="w-full border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted focus:border-cyan focus:outline-none resize-none"
            rows={3}
          />
        </div>
      )}
    </div>
  )
}
