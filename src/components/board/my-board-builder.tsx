'use client'

import { useState, useCallback } from 'react'
import { SEED_PLAYERS_2026 } from '@/lib/data/seed-prospects-2026'
import { getPositionColor } from '@/lib/utils/format'
import { useToast } from '@/components/ui/toast'
import type { Player } from '@/types'

const INITIAL_PLAYERS = (SEED_PLAYERS_2026 as Player[]).sort(
  (a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999),
)

export function MyBoardBuilder() {
  const { toast } = useToast()
  const [board, setBoard] = useState<Player[]>(INITIAL_PLAYERS)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [editingNote, setEditingNote] = useState<string | null>(null)

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

  const resetBoard = () => {
    setBoard(INITIAL_PLAYERS)
    setNotes({})
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
