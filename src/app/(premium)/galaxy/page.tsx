import { TerminalHeader } from '@/components/layout/terminal-header'
import { GalaxyView } from '@/components/galaxy/galaxy-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comp Galaxy — 3D Prospect Visualization',
  description:
    'Explore NFL draft prospects in an interactive 3D galaxy mapped by statistical similarity.',
}

export default function GalaxyPage() {
  return (
    <div>
      <TerminalHeader title="COMP_GALAXY" subtitle="3D Prospect Similarity Map" status="ONLINE" />
      <GalaxyView />
    </div>
  )
}
