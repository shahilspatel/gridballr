import { TerminalHeader } from '@/components/layout/terminal-header'
import { ScoutsFeed } from '@/components/scouts/scouts-feed'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scouts Community — Scouting Reports',
  description: 'Community-driven scouting reports with tier ratings, badges, and reactions.',
}

export default function ScoutsPage() {
  return (
    <div>
      <TerminalHeader
        title="SCOUTS_COMMUNITY"
        subtitle="User Scouting Reports"
        status="FEED_ACTIVE"
      />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <ScoutsFeed />
      </div>
    </div>
  )
}
