import { TerminalHeader } from '@/components/layout/terminal-header'
import { RookieRankings } from '@/components/dynasty/rookie-rankings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dynasty Rookie Rankings',
  description:
    'Dynasty fantasy football rookie rankings for the 2026 and 2025 draft classes. Tiered by value with trends.',
}

export default function RookieRankingsPage() {
  return (
    <div>
      <TerminalHeader
        title="ROOKIE_RANKINGS"
        subtitle="Dynasty Rookie Class Values"
        status="ACTIVE"
      />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <RookieRankings />
      </div>
    </div>
  )
}
