import { TerminalHeader } from '@/components/layout/terminal-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comp Galaxy — 3D Prospect Visualization',
  description:
    'Explore NFL draft prospects in an interactive 3D galaxy mapped by statistical similarity.',
}

export default function GalaxyPage() {
  return (
    <div>
      <TerminalHeader
        title="COMP_GALAXY"
        subtitle="3D Prospect Similarity Map"
        status="INITIALIZING"
      />
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-3 w-3 rounded-full bg-cyan shadow-[0_0_12px_var(--cyan)] animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-cyan glow">GALAXY_MODULE</span>
          <span className="text-[10px] text-muted">
            3D visualization loading... // Three.js engine initializing
          </span>
          <span className="mt-2 border border-amber/30 bg-amber/5 px-3 py-1.5 text-[10px] text-amber">
            PRO FEATURE — Sign up for full access
          </span>
        </div>
      </div>
    </div>
  )
}
