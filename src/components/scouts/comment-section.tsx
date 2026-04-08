'use client'

import { useState, useEffect, useCallback } from 'react'

interface Comment {
  id: string
  content: string
  created_at: string
  profile?: {
    scout_alias: string | null
    scout_theme: string
  }
}

const THEME_COLORS: Record<string, string> = {
  cyan: '#00f0ff',
  green: '#00ff88',
  red: '#ff3b3b',
  amber: '#ffb800',
}

export function CommentSection({ reportId }: { reportId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/scouts/reports/${reportId}/comments`)
    if (res.ok) {
      setComments(await res.json())
    }
    setLoading(false)
  }, [reportId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  async function handleSubmit() {
    if (!content.trim() || content.length < 10) {
      setError('Comment must be at least 10 characters')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/scouts/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to post comment')
      }

      const newComment = await res.json()
      setComments((prev) => [...prev, newComment])
      setContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t border-border/50 px-4 py-3">
      {loading ? (
        <p className="text-[10px] text-muted">Loading comments...</p>
      ) : (
        <>
          {comments.length === 0 && <p className="mb-2 text-[10px] text-muted">No comments yet</p>}
          <div className="flex flex-col gap-2">
            {comments.map((c) => {
              const alias = c.profile?.scout_alias ?? 'ANON'
              const color = THEME_COLORS[c.profile?.scout_theme ?? 'cyan'] ?? '#00f0ff'
              return (
                <div key={c.id} className="flex gap-2">
                  <div
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <span className="text-[9px] font-bold text-foreground">{alias}</span>
                    <p className="text-[10px] leading-relaxed text-foreground/70">{c.content}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Comment input */}
          <div className="mt-3 flex gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border border-border bg-background px-2 py-1.5 text-[10px] text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="border border-cyan bg-cyan/10 px-2 py-1.5 text-[9px] font-bold text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-50"
            >
              {submitting ? '...' : 'POST'}
            </button>
          </div>
          {error && <p className="mt-1 text-[9px] text-red">{error}</p>}
        </>
      )}
    </div>
  )
}
