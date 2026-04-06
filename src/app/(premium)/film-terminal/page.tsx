import { TerminalHeader } from '@/components/layout/terminal-header'
import { FilmTerminalView } from '@/components/film/film-terminal-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Film Terminal — Prospect Film Review',
  description:
    'Multi-panel film review workspace with YouTube highlights, notes, and quantitative overlay.',
}

export default function FilmTerminalPage() {
  return (
    <div>
      <TerminalHeader
        title="FILM_TERMINAL"
        subtitle="Prospect Film Review Workspace"
        status="ONLINE"
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <FilmTerminalView />
      </div>
    </div>
  )
}
