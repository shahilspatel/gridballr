import { TerminalHeader } from '@/components/layout/terminal-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Film Terminal — Prospect Film Review',
  description:
    'Multi-panel film review workspace with YouTube highlights, notes, chat, and quantitative overlay.',
}

export default function FilmTerminalPage() {
  return (
    <div>
      <TerminalHeader
        title="FILM_TERMINAL"
        subtitle="Prospect Film Review Workspace"
        status="STANDBY"
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Video panel */}
          <div className="border border-border bg-surface lg:col-span-2">
            <div className="border-b border-border bg-surface-2 px-3 py-2">
              <span className="text-[10px] font-bold tracking-widest text-cyan">VIDEO_FEED</span>
            </div>
            <div className="flex aspect-video items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-muted">SELECT A PROSPECT TO LOAD FILM</span>
                <span className="border border-amber/30 bg-amber/5 px-3 py-1.5 text-[10px] text-amber">
                  PRO FEATURE
                </span>
              </div>
            </div>
          </div>

          {/* Side panels */}
          <div className="flex flex-col gap-4">
            {/* Notes */}
            <div className="border border-border bg-surface">
              <div className="border-b border-border bg-surface-2 px-3 py-2">
                <span className="text-[10px] font-bold tracking-widest text-cyan">NOTES</span>
              </div>
              <div className="p-3">
                <textarea
                  placeholder="Scout notes..."
                  className="h-32 w-full resize-none border border-border bg-background p-2 text-[11px] text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
                  disabled
                />
              </div>
            </div>

            {/* Chat */}
            <div className="border border-border bg-surface">
              <div className="border-b border-border bg-surface-2 px-3 py-2">
                <span className="text-[10px] font-bold tracking-widest text-cyan">CHAT</span>
              </div>
              <div className="flex h-32 items-center justify-center p-3">
                <span className="text-[10px] text-muted">LOGIN REQUIRED</span>
              </div>
            </div>

            {/* Quant */}
            <div className="border border-border bg-surface">
              <div className="border-b border-border bg-surface-2 px-3 py-2">
                <span className="text-[10px] font-bold tracking-widest text-cyan">
                  QUANT_OVERLAY
                </span>
              </div>
              <div className="flex h-24 items-center justify-center p-3">
                <span className="text-[10px] text-muted">NO DATA LOADED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
