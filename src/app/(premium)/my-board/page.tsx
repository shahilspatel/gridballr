import { TerminalHeader } from '@/components/layout/terminal-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Board — Custom Draft Board Builder',
  description: 'Build and customize your own NFL draft big board with drag-and-drop rankings.',
}

export default function MyBoardPage() {
  return (
    <div>
      <TerminalHeader title="MY_BOARD" subtitle="Custom Draft Board Builder" status="BOARD_READY" />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="border border-border bg-surface p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-amber shadow-[0_0_8px_#ffb80066]" />
            <span className="text-xs font-bold tracking-widest text-amber">LOGIN_REQUIRED</span>
            <p className="max-w-sm text-[11px] text-muted">
              Sign in to create custom draft boards. Drag and drop prospects, add notes, and share
              your rankings.
            </p>
            <a
              href="/login"
              className="mt-2 border border-cyan bg-cyan/10 px-4 py-2 text-[10px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20"
            >
              LOGIN
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
