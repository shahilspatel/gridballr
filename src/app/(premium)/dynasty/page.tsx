import { TerminalHeader } from '@/components/layout/terminal-header'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dynasty Bridge — Fantasy Football Intelligence',
  description:
    'Dynasty fantasy football tools: trade calculator, rookie rankings, and devy prospect tracking.',
}

export default function DynastyPage() {
  return (
    <div>
      <TerminalHeader
        title="DYNASTY_BRIDGE"
        subtitle="Fantasy Football Intelligence"
        status="ACTIVE"
      />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ModuleCard
            title="TRADE_CALCULATOR"
            description="Evaluate dynasty trades with crowdsourced player values. Superflex and 1QB formats."
            href="/dynasty/calculator"
            status="AVAILABLE"
          />
          <ModuleCard
            title="ROOKIE_RANKINGS"
            description="2025 rookie class rankings for dynasty leagues. Tiered by format and scoring."
            href="/dynasty/devy"
            status="AVAILABLE"
          />
          <ModuleCard
            title="DEVY_TRACKER"
            description="Track college prospects 2-3 years before the draft. Get ahead of your league."
            href="/dynasty/devy"
            status="COMING_SOON"
            locked
          />
        </div>

        {/* Value ticker */}
        <div className="mt-6 border border-border bg-surface">
          <div className="border-b border-border bg-surface-2 px-4 py-2">
            <span className="text-[10px] font-bold tracking-widest text-cyan">VALUE_TRENDS</span>
          </div>
          <div className="divide-y divide-border/50">
            {[
              { name: 'Shedeur Sanders', change: '+12', direction: 'up' },
              { name: 'Cam Ward', change: '+8', direction: 'up' },
              { name: 'Travis Hunter', change: '+15', direction: 'up' },
              { name: 'Ashton Jeanty', change: '+5', direction: 'up' },
              { name: 'Tetairoa McMillan', change: '-3', direction: 'down' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-foreground">{item.name}</span>
                <span
                  className={`text-xs font-bold tabular-nums ${
                    item.direction === 'up' ? 'text-green' : 'text-red'
                  }`}
                >
                  {item.direction === 'up' ? '+' : ''}
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ModuleCard({
  title,
  description,
  href,
  status,
  locked,
}: {
  title: string
  description: string
  href: string
  status: string
  locked?: boolean
}) {
  const content = (
    <div
      className={`border border-border bg-surface p-5 transition-colors ${
        locked ? 'opacity-60' : 'hover:border-cyan/50'
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-cyan">{title}</span>
          {locked && (
            <span className="border border-amber/30 bg-amber/5 px-1.5 py-0.5 text-[8px] font-bold text-amber">
              PRO
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted">{description}</p>
        <div className="mt-1 flex items-center gap-1.5 text-[9px]">
          <div className={`h-1.5 w-1.5 rounded-full ${locked ? 'bg-amber' : 'bg-green'}`} />
          <span className={locked ? 'text-amber' : 'text-green'}>{status}</span>
        </div>
      </div>
    </div>
  )

  if (locked) return content
  return <Link href={href}>{content}</Link>
}
