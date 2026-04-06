import Link from 'next/link'
import type { Player } from '@/types'
import { formatHeight, formatWeight, getPositionColor } from '@/lib/utils/format'

export function PlayerCard({ player, rank }: { player: Player; rank: number }) {
  const posColor = getPositionColor(player.position)

  return (
    <Link
      href={`/players/${player.slug}`}
      className="group relative flex gap-4 border border-border bg-surface p-4 transition-all hover:border-cyan/50 hover:bg-surface-2"
    >
      {/* Rank */}
      <div className="flex w-10 flex-shrink-0 items-start justify-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color: posColor }}>
          {String(rank).padStart(2, '0')}
        </span>
      </div>

      {/* Player info */}
      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground group-hover:text-cyan transition-colors truncate">
            {player.first_name} {player.last_name}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 border"
            style={{ color: posColor, borderColor: posColor }}
          >
            {player.position}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted">
          <span>{player.school}</span>
          {player.conference && (
            <>
              <span className="text-border">|</span>
              <span>{player.conference}</span>
            </>
          )}
          {player.class_year && (
            <>
              <span className="text-border">|</span>
              <span>{player.class_year}</span>
            </>
          )}
        </div>

        {/* Measurables row */}
        <div className="flex items-center gap-3 text-[10px] text-muted">
          {player.height_inches && <span>{formatHeight(player.height_inches)}</span>}
          {player.weight_lbs && <span>{formatWeight(player.weight_lbs)}</span>}
          {player.forty_yard && <span>{player.forty_yard}s 40yd</span>}
        </div>

        {/* Comp */}
        {player.player_comp && (
          <div className="text-[10px] text-muted">
            <span className="text-cyan/60">COMP:</span>{' '}
            <span className="text-foreground/70">{player.player_comp}</span>
          </div>
        )}
      </div>

      {/* Tier badge */}
      {player.tier && (
        <div className="flex flex-shrink-0 items-start">
          <TierBadge tier={player.tier} />
        </div>
      )}

      {/* Hover glow line */}
      <div className="absolute bottom-0 left-0 h-px w-0 bg-cyan transition-all group-hover:w-full" />
    </Link>
  )
}

function TierBadge({ tier }: { tier: string }) {
  const tierClass = `tier-${tier.toLowerCase().replace('_', '-')}`
  const labels: Record<string, string> = {
    ELITE: 'ELITE',
    FRANCHISE: 'FRNCH',
    ALL_STAR: 'A-STR',
    STARTER: 'START',
    ROTATION: 'ROTN',
    DEPTH: 'DEPTH',
  }

  return (
    <span className={`border px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${tierClass}`}>
      {labels[tier] ?? tier}
    </span>
  )
}
