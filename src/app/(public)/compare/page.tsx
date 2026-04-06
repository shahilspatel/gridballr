import { TerminalHeader } from '@/components/layout/terminal-header'
import { CompareView } from '@/components/player/compare-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Engine — Head-to-Head Prospect Comparison',
  description:
    'Compare NFL draft prospects side-by-side with visual stat bars, measurables, and scouting analysis.',
}

export default function ComparePage() {
  return (
    <div>
      <TerminalHeader
        title="COMPARE_ENGINE"
        subtitle="Head-to-Head Prospect Analysis"
        status="READY"
      />
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <CompareView />
      </div>
    </div>
  )
}
