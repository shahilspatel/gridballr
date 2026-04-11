import { TerminalHeader } from '@/components/layout/terminal-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — GridBallr',
  description: 'Get in touch with the GridBallr team. Report bugs, request features, or say hello.',
}

export default function ContactPage() {
  return (
    <div>
      <TerminalHeader title="CONTACT" subtitle="Get in touch" status="COMMS_OPEN" />
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <div className="border border-border bg-surface p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest text-cyan">EMAIL</span>
              <a
                href="mailto:gridballr@gmail.com"
                className="text-xs text-foreground hover:text-cyan"
              >
                gridballr@gmail.com
              </a>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest text-cyan">TWITTER / X</span>
              <a
                href="https://x.com/gridballr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-foreground hover:text-cyan"
              >
                @gridballr
              </a>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest text-cyan">BUG_REPORTS</span>
              <p className="text-[11px] text-muted">
                Found something broken? Email us or DM on Twitter. We take every report seriously
                and usually patch within 24 hours.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest text-cyan">
                FEATURE_REQUESTS
              </span>
              <p className="text-[11px] text-muted">
                Have an idea for a tool, stat, or view? We build what scouts ask for. Send it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
