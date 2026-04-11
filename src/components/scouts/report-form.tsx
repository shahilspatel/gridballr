'use client'

import { useState } from 'react'
import { DRAFT_YEARS } from '@/lib/draft-config'
import { cleanText } from '@/lib/moderation'
import type { Badge, Tier } from '@/types'

const BADGE_OPTIONS: Badge[] = [
  'SPEED_DEMON',
  'LOCKDOWN',
  'ROUTE_TECHNICIAN',
  'ARM_CANNON',
  'RUN_STUFFER',
  'BALL_HAWK',
  'PANCAKE_MACHINE',
  'PLAY_MAKER',
  'DUAL_THREAT',
  'RED_ZONE_THREAT',
  'PASS_RUSH_SPECIALIST',
  'COVERAGE_KING',
  'SURE_TACKLER',
  'YAC_MONSTER',
  'FIELD_GENERAL',
]

interface ReportFormProps {
  onClose: () => void
  onSubmit: (report: {
    player_slug: string
    tier: Tier
    summary: string
    strengths: string[]
    weaknesses: string[]
    badges: string[]
    grade: number
  }) => Promise<void>
}

export function ReportForm({ onClose, onSubmit }: ReportFormProps) {
  const [playerId, setPlayerId] = useState('')
  const [tier, setTier] = useState<Tier | ''>('')
  const [summary, setSummary] = useState('')
  const [strengths, setStrengths] = useState([''])
  const [weaknesses, setWeaknesses] = useState([''])
  const [badges, setBadges] = useState<string[]>([])
  const [grade, setGrade] = useState('')
  const [gradeError, setGradeError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleGradeChange(val: string) {
    setGrade(val)
    const num = parseFloat(val)
    if (val && (isNaN(num) || num < 0 || num > 10)) {
      setGradeError('Grade must be between 0 and 10')
    } else {
      setGradeError('')
    }
  }

  function toggleBadge(badge: string) {
    setBadges((prev) =>
      prev.includes(badge)
        ? prev.filter((b) => b !== badge)
        : prev.length < 3
          ? [...prev, badge]
          : prev,
    )
  }

  function updateListItem(
    list: string[],
    setList: (v: string[]) => void,
    idx: number,
    val: string,
  ) {
    const next = [...list]
    next[idx] = val
    setList(next)
  }

  function addListItem(list: string[], setList: (v: string[]) => void) {
    if (list.length < 5) setList([...list, ''])
  }

  function removeListItem(list: string[], setList: (v: string[]) => void, idx: number) {
    if (list.length > 1) setList(list.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    setError('')
    const gradeNum = parseFloat(grade)

    if (!playerId || !tier || !summary || isNaN(gradeNum)) {
      setError('Fill in all required fields')
      return
    }

    if (summary.length < 50) {
      setError('Summary must be at least 50 characters')
      return
    }

    const filteredStrengths = strengths.filter((s) => s.trim())
    const filteredWeaknesses = weaknesses.filter((w) => w.trim())

    if (filteredStrengths.length === 0 || filteredWeaknesses.length === 0) {
      setError('At least 1 strength and 1 weakness required')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        // playerId state is the player slug (the option value in the select).
        // The route resolves it to a UUID server-side.
        player_slug: playerId,
        tier: tier as Tier,
        summary: cleanText(summary),
        strengths: filteredStrengths.map(cleanText),
        weaknesses: filteredWeaknesses.map(cleanText),
        badges,
        grade: gradeNum,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border border-cyan/30 bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest text-cyan">NEW_REPORT</span>
        <button onClick={onClose} className="text-[10px] text-muted hover:text-red">
          CLOSE
        </button>
      </div>

      {error && (
        <div className="mb-3 border border-red/30 bg-red/5 px-3 py-2 text-[10px] text-red">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Prospect select */}
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-cyan focus:outline-none"
        >
          <option value="">Select prospect...</option>
          {DRAFT_YEARS.map((d) => (
            <optgroup key={d.year} label={`${d.year} Draft Class (${d.label})`}>
              {d.players
                .slice()
                .sort((a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999))
                .map((p) => (
                  <option key={p.slug} value={p.slug}>
                    #{p.big_board_rank} {p.first_name} {p.last_name} — {p.position}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>

        {/* Tier + Grade */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as Tier)}
            className="border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-cyan focus:outline-none"
          >
            <option value="">Tier...</option>
            <option>ELITE</option>
            <option>FRANCHISE</option>
            <option>ALL_STAR</option>
            <option>STARTER</option>
            <option>ROTATION</option>
            <option>DEPTH</option>
          </select>
          <div className="flex flex-col gap-1">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={grade}
              onChange={(e) => handleGradeChange(e.target.value)}
              placeholder="Grade (0-10)"
              className={`border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none ${
                gradeError ? 'border-red focus:border-red' : 'border-border focus:border-cyan'
              }`}
            />
            {gradeError && <span className="text-[9px] text-red">{gradeError}</span>}
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-1">
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Your scouting analysis (min 50 chars)..."
            rows={4}
            className="border border-border bg-background p-3 text-[11px] text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
          />
          <span className="text-[9px] text-muted">{summary.length}/2000</span>
        </div>

        {/* Strengths */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold tracking-wider text-green">STRENGTHS</span>
          {strengths.map((s, i) => (
            <div key={i} className="flex gap-1">
              <input
                value={s}
                onChange={(e) => updateListItem(strengths, setStrengths, i, e.target.value)}
                placeholder={`Strength ${i + 1}`}
                className="flex-1 border border-border bg-background px-2 py-1 text-[10px] text-foreground placeholder:text-muted focus:border-green focus:outline-none"
              />
              {strengths.length > 1 && (
                <button
                  onClick={() => removeListItem(strengths, setStrengths, i)}
                  className="px-1 text-[10px] text-muted hover:text-red"
                >
                  x
                </button>
              )}
            </div>
          ))}
          {strengths.length < 5 && (
            <button
              onClick={() => addListItem(strengths, setStrengths)}
              className="text-left text-[9px] text-green hover:text-green/80"
            >
              + Add strength
            </button>
          )}
        </div>

        {/* Weaknesses */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold tracking-wider text-red">WEAKNESSES</span>
          {weaknesses.map((w, i) => (
            <div key={i} className="flex gap-1">
              <input
                value={w}
                onChange={(e) => updateListItem(weaknesses, setWeaknesses, i, e.target.value)}
                placeholder={`Weakness ${i + 1}`}
                className="flex-1 border border-border bg-background px-2 py-1 text-[10px] text-foreground placeholder:text-muted focus:border-red focus:outline-none"
              />
              {weaknesses.length > 1 && (
                <button
                  onClick={() => removeListItem(weaknesses, setWeaknesses, i)}
                  className="px-1 text-[10px] text-muted hover:text-red"
                >
                  x
                </button>
              )}
            </div>
          ))}
          {weaknesses.length < 5 && (
            <button
              onClick={() => addListItem(weaknesses, setWeaknesses)}
              className="text-left text-[9px] text-red hover:text-red/80"
            >
              + Add weakness
            </button>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold tracking-wider text-cyan">
            BADGES ({badges.length}/3)
          </span>
          <div className="flex flex-wrap gap-1">
            {BADGE_OPTIONS.map((badge) => (
              <button
                key={badge}
                onClick={() => toggleBadge(badge)}
                className={`border px-1.5 py-0.5 text-[8px] font-bold tracking-wider transition-colors ${
                  badges.includes(badge)
                    ? 'border-cyan/40 bg-cyan/10 text-cyan'
                    : 'border-border text-muted hover:border-cyan/20 hover:text-foreground'
                }`}
              >
                {badge.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="border border-cyan bg-cyan/10 px-4 py-2 text-[10px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-50"
        >
          {submitting ? 'SUBMITTING...' : 'SUBMIT_REPORT'}
        </button>
      </div>
    </div>
  )
}
