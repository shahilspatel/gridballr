import Link from 'next/link'
import { TerminalHeader } from '@/components/layout/terminal-header'
import { DraftYearToggle } from '@/components/draft/draft-year-toggle'
import { DRAFT_YEARS, DEFAULT_DRAFT_YEAR, getAllYears, getYearLabels } from '@/lib/draft-config'
import type { SeedPlayer } from '@/types'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const showWelcome = params.welcome === 'true'
  const showUpgraded = params.upgraded === 'true'

  const allPlayers: Record<number, SeedPlayer[]> = Object.fromEntries(
    DRAFT_YEARS.map((d) => [d.year, d.players]),
  )

  return (
    <div>
      {/* Post-signup welcome banner */}
      {showWelcome && (
        <div className="border-b border-green/30 bg-green/5 px-4 py-2 text-center text-[11px] tracking-wide text-green sm:px-6">
          <span className="font-bold">WELCOME_ABOARD</span> — check your email to verify your
          account, then start scouting.
        </div>
      )}

      {/* Post-checkout upgrade banner */}
      {showUpgraded && (
        <div className="border-b border-cyan/30 bg-cyan/5 px-4 py-2 text-center text-[11px] tracking-wide text-cyan sm:px-6">
          <span className="font-bold">UPGRADE_SUCCESSFUL</span> — Pro features are now unlocked.
          Welcome to the inner circle.
        </div>
      )}

      <TerminalHeader
        title="BIG_BOARD"
        subtitle="NFL Draft Consensus Rankings"
        status="BOARD_ACTIVE"
      />

      {/* Early-access launch banner — top-of-funnel waitlist capture */}
      <Link
        href="/early-access"
        className="block border-b border-cyan/30 bg-cyan/5 px-4 py-2 text-center text-[11px] tracking-wide text-cyan transition-colors hover:bg-cyan/10 sm:px-6"
      >
        <span className="font-bold">EARLY_ACCESS:</span> First 500 scouts get lifetime 50% off Pro.{' '}
        <span className="underline-offset-2 hover:underline">JOIN_WAITLIST &gt;</span>
      </Link>

      {/* Hero */}
      <div className="relative border-b border-border bg-surface px-4 py-8 sm:px-6">
        <div className="scanlines mx-auto max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] text-muted">
              <span>SYS.INIT</span>
              <span className="text-border">&gt;</span>
              <span>GRIDBALLR_v0.1.0</span>
              <span className="text-border">&gt;</span>
              <span className="text-green">ONLINE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              NFL DRAFT <span className="text-cyan glow">BIG BOARD</span>
            </h1>
            <p className="max-w-lg text-sm text-muted">
              Consensus prospect rankings powered by advanced analytics, scouting reports, and
              combine data. Updated in real-time.
            </p>
          </div>
        </div>
      </div>

      <DraftYearToggle
        years={getAllYears()}
        defaultYear={DEFAULT_DRAFT_YEAR}
        allPlayers={allPlayers}
        labels={getYearLabels()}
      />
    </div>
  )
}
