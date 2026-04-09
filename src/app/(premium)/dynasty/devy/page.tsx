import { TerminalHeader } from '@/components/layout/terminal-header'
import { DevyTracker } from '@/components/dynasty/devy-tracker'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Devy Tracker — Dynasty Prospect Tracking',
  description:
    'Track college underclassmen 2-3 years before the NFL draft. Devy rankings for dynasty fantasy football leagues.',
}

export default function DevyPage() {
  return (
    <div>
      <TerminalHeader
        title="DEVY_TRACKER"
        subtitle="Developmental Prospect Intelligence"
        status="ACTIVE"
      />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <DevyTracker />
      </div>
    </div>
  )
}
