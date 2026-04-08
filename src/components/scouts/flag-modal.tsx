'use client'

import { useState } from 'react'

const FLAG_REASONS = [
  { value: 'profanity', label: 'Profanity / Inappropriate language' },
  { value: 'spam', label: 'Spam or self-promotion' },
  { value: 'harassment', label: 'Harassment or personal attacks' },
  { value: 'misinformation', label: 'Intentional misinformation' },
  { value: 'other', label: 'Other' },
] as const

interface FlagModalProps {
  reportId: string
  onClose: () => void
}

export function FlagModal({ reportId, onClose }: FlagModalProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!reason) {
      setError('Select a reason')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/scouts/reports/${reportId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details: details || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to flag report')
      }

      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flag')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t border-red/30 bg-red/5 px-4 py-3">
      {done ? (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground">
            Report flagged. Thanks for helping keep the community clean.
          </span>
          <button onClick={onClose} className="text-[10px] text-muted hover:text-foreground">
            CLOSE
          </button>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-red">FLAG_REPORT</span>
            <button onClick={onClose} className="text-[10px] text-muted hover:text-foreground">
              CANCEL
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {FLAG_REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2 text-[10px] text-foreground">
                <input
                  type="radio"
                  name="flag-reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="accent-red"
                />
                {r.label}
              </label>
            ))}

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Additional details (optional)..."
              rows={2}
              className="border border-border bg-background p-2 text-[10px] text-foreground placeholder:text-muted focus:border-red focus:outline-none"
            />

            {error && <p className="text-[9px] text-red">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="border border-red bg-red/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-red transition-colors hover:bg-red/20 disabled:opacity-50"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT_FLAG'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
