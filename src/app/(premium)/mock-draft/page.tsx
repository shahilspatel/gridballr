import { TerminalHeader } from '@/components/layout/terminal-header'
import { MockDraftEngine } from '@/components/draft/mock-draft-engine'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mock Draft Simulator',
  description:
    'Simulate the 2025 NFL Draft with solo and multiplayer modes. Trade picks, draft prospects, and compete.',
}

export default function MockDraftPage() {
  return (
    <div>
      <TerminalHeader title="MOCK_DRAFT" subtitle="Draft Simulation Engine" status="READY" />
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <MockDraftEngine />
      </div>
    </div>
  )
}
