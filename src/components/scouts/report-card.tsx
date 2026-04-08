'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getPositionColor, getTierColor } from '@/lib/utils/format'
import { CommentSection } from './comment-section'
import { FlagModal } from './flag-modal'

interface ReportCardProps {
  report: {
    id: string
    tier: string
    summary: string
    strengths: string[]
    weaknesses: string[]
    badges: string[]
    grade: number | null
    reactions: { fire: number; brain: number; cap: number }
    created_at: string
    profile?: {
      scout_alias: string | null
      scout_theme: string
      reputation?: number
    }
    player?: {
      slug: string
      first_name: string
      last_name: string
      position: string
      school: string
    }
  }
  onVote: (reportId: string, voteType: 'fire' | 'brain' | 'cap') => Promise<void>
}

const THEME_COLORS: Record<string, string> = {
  cyan: '#00f0ff',
  green: '#00ff88',
  red: '#ff3b3b',
  amber: '#ffb800',
}

export function ReportCard({ report, onVote }: ReportCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showFlag, setShowFlag] = useState(false)
  const [voting, setVoting] = useState(false)

  const posColor = report.player ? getPositionColor(report.player.position) : '#71717a'
  const tierColor = getTierColor(report.tier)
  const themeColor = THEME_COLORS[report.profile?.scout_theme ?? 'cyan'] ?? '#00f0ff'
  const alias = report.profile?.scout_alias ?? 'ANON_SCOUT'
  const timeAgo = formatTimeAgo(report.created_at)

  async function handleVote(type: 'fire' | 'brain' | 'cap') {
    if (voting) return
    setVoting(true)
    try {
      await onVote(report.id, type)
    } finally {
      setVoting(false)
    }
  }

  return (
    <div className="border border-border bg-surface transition-colors hover:border-border/80">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: themeColor }} />
          <span className="text-[10px] font-bold text-foreground">{alias}</span>
          {report.profile?.reputation !== undefined && report.profile.reputation > 50 && (
            <span className="border border-amber/30 bg-amber/5 px-1 py-px text-[7px] font-bold tracking-wider text-amber">
              TRUSTED
            </span>
          )}
          <span className="text-[9px] text-muted">{timeAgo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="border px-1.5 py-0.5 text-[9px] font-bold tracking-wider"
            style={{ color: tierColor, borderColor: tierColor }}
          >
            {report.tier.replace('_', ' ')}
          </span>
          <button
            onClick={() => setShowFlag(true)}
            className="text-[9px] text-muted transition-colors hover:text-red"
            title="Flag this report"
          >
            FLAG
          </button>
        </div>
      </div>

      {/* Player info */}
      {report.player && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/players/${report.player.slug}`}
              className="text-sm font-bold text-foreground hover:text-cyan"
            >
              {report.player.first_name} {report.player.last_name}
            </Link>
            <span
              className="border px-1.5 py-0.5 text-[9px] font-bold"
              style={{ color: posColor, borderColor: posColor }}
            >
              {report.player.position}
            </span>
            <span className="text-[10px] text-muted">{report.player.school}</span>
            {report.grade !== null && (
              <span className="ml-auto text-sm font-bold tabular-nums text-cyan">
                {report.grade}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="px-4 py-3">
        <p className="text-[11px] leading-relaxed text-foreground/70">{report.summary}</p>
      </div>

      {/* Badges */}
      {report.badges.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-2">
          {report.badges.map((badge) => (
            <span
              key={badge}
              className="border border-cyan/20 bg-cyan/5 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-cyan"
            >
              {badge.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Strengths/Weaknesses */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-3">
        <div className="flex flex-wrap gap-1">
          {report.strengths.map((s) => (
            <span key={s} className="text-[9px] text-green">
              +{s}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {report.weaknesses.map((w) => (
            <span key={w} className="text-[9px] text-red">
              -{w}
            </span>
          ))}
        </div>
      </div>

      {/* Reactions + Comments toggle */}
      <div className="flex items-center justify-between border-t border-border/50 px-4 py-2">
        <div className="flex items-center gap-3">
          {(['fire', 'brain', 'cap'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleVote(type)}
              disabled={voting}
              className="flex items-center gap-1 text-[10px] text-muted transition-colors hover:text-foreground disabled:opacity-50"
            >
              <span>{type.toUpperCase()}</span>
              <span className="tabular-nums text-foreground">{report.reactions[type] ?? 0}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-[10px] text-muted transition-colors hover:text-cyan"
        >
          {showComments ? 'HIDE' : 'COMMENTS'}
        </button>
      </div>

      {/* Comments section */}
      {showComments && <CommentSection reportId={report.id} />}

      {/* Flag modal */}
      {showFlag && <FlagModal reportId={report.id} onClose={() => setShowFlag(false)} />}
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
