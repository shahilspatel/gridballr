import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TerminalHeader } from '@/components/layout/terminal-header'
import { DRAFT_HISTORY, AVAILABLE_YEARS } from '@/lib/data/draft-history'
import { getPositionColor } from '@/lib/utils/format'
import type { Metadata } from 'next'

type Props = { params: Promise<{ year: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params
  return {
    title: `${year} NFL Draft Results`,
    description: `Complete results and analysis of the ${year} NFL Draft. Pick-by-pick breakdown with career grades.`,
  }
}

export function generateStaticParams() {
  return AVAILABLE_YEARS.map((year) => ({ year: String(year) }))
}

export default async function DraftHistoryPage({ params }: Props) {
  const { year: yearStr } = await params
  const year = Number(yearStr)
  const picks = DRAFT_HISTORY[year]
  if (!picks) notFound()

  return (
    <div>
      <TerminalHeader
        title="DRAFT_ARCHIVE"
        subtitle={`${year} NFL Draft Results`}
        status="DATA_LOADED"
      />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Year selector */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] text-muted">YEAR:</span>
          {AVAILABLE_YEARS.map((y) => (
            <Link
              key={y}
              href={`/draft-history/${y}`}
              className={`px-3 py-1.5 text-[10px] font-medium transition-colors ${
                y === year
                  ? 'bg-cyan/10 text-cyan border border-cyan/30'
                  : 'text-muted hover:text-foreground border border-transparent'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>

        {/* Draft results */}
        <div className="border border-border bg-surface">
          <div className="border-b border-border bg-surface-2 px-4 py-2">
            <div className="grid grid-cols-[3rem_4rem_1fr_3rem_8rem_3rem] gap-2 text-[10px] font-bold tracking-widest text-muted">
              <span>PICK</span>
              <span>TEAM</span>
              <span>PLAYER</span>
              <span>POS</span>
              <span>SCHOOL</span>
              <span className="text-right">AV</span>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {picks.map((pick) => (
              <div
                key={pick.pick}
                className="grid grid-cols-[3rem_4rem_1fr_3rem_8rem_3rem] items-center gap-2 px-4 py-2.5 transition-colors hover:bg-surface-2"
              >
                <span className="text-xs font-bold tabular-nums text-muted">
                  {String(pick.pick).padStart(2, '0')}
                </span>
                <span className="text-xs font-bold text-foreground">{pick.team}</span>
                <span className="text-xs text-foreground hover:text-cyan transition-colors">
                  <Link
                    href={`/players/${pick.player
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '')}`}
                  >
                    {pick.player}
                  </Link>
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: getPositionColor(pick.position) }}
                >
                  {pick.position}
                </span>
                <span className="text-[10px] text-muted">{pick.school}</span>
                <span className="text-right text-xs font-bold tabular-nums text-foreground">
                  {pick.careerAV ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 text-[9px] text-muted">
          AV = Career Approximate Value (Pro Football Reference metric measuring total career
          contribution)
        </div>
      </div>
    </div>
  )
}
