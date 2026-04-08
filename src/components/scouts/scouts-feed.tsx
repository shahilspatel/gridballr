'use client'

import { useState, useEffect, useCallback } from 'react'
import { ReportForm } from './report-form'
import { ReportCard } from './report-card'

interface Report {
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

type SortMode = 'recent' | 'popular' | 'discussed'

export function ScoutsFeed() {
  const [activeFilter, setActiveFilter] = useState<SortMode>('recent')
  const [showForm, setShowForm] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/scouts/reports?sort=${activeFilter}`)
      if (!res.ok) throw new Error('Failed to load reports')
      setReports(await res.json())
    } catch {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [activeFilter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  async function handleSubmitReport(data: {
    player_id: string
    tier: string
    summary: string
    strengths: string[]
    weaknesses: string[]
    badges: string[]
    grade: number
  }) {
    const res = await fetch('/api/scouts/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? 'Failed to create report')
    }

    // Refresh feed
    await fetchReports()
  }

  async function handleVote(reportId: string, voteType: 'fire' | 'brain' | 'cap') {
    const res = await fetch(`/api/scouts/reports/${reportId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote_type: voteType }),
    })

    if (!res.ok) {
      const err = await res.json()
      if (err.error === 'Not authenticated') {
        setError('Sign in to vote')
        return
      }
    }

    // Optimistic update: adjust count locally
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r
        const reactions = { ...r.reactions }
        // Toggle: we don't know server state, just bump for responsiveness
        reactions[voteType] = (reactions[voteType] ?? 0) + 1
        return { ...r, reactions }
      }),
    )

    // Then refresh to get accurate server state
    await fetchReports()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['recent', 'popular', 'discussed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 text-[10px] font-medium tracking-wide transition-colors ${
                activeFilter === tab
                  ? 'bg-cyan/10 text-cyan border border-cyan/30'
                  : 'text-muted hover:text-foreground border border-transparent'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border border-cyan bg-cyan/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20"
        >
          + NEW_REPORT
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red/30 bg-red/5 px-3 py-2 text-[10px] text-red">{error}</div>
      )}

      {/* Report form */}
      {showForm && <ReportForm onClose={() => setShowForm(false)} onSubmit={handleSubmitReport} />}

      {/* Reports */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse border border-border bg-surface" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="border border-border bg-surface px-6 py-12 text-center">
          <p className="text-[11px] text-muted">
            No reports yet. Be the first scout to submit one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onVote={handleVote} />
          ))}
        </div>
      )}
    </div>
  )
}
