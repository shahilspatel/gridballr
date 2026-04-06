import { notFound } from 'next/navigation'
import { TerminalHeader } from '@/components/layout/terminal-header'
import { PlayerProfileView } from '@/components/player/player-profile-view'
import { SEED_PLAYERS, SEED_SEASONS_BY_SLUG } from '@/lib/data/seed-prospects'
import type { Player } from '@/types'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const player = SEED_PLAYERS.find((p) => p.slug === slug)
  if (!player) return { title: 'Player Not Found' }
  return {
    title: `${player.first_name} ${player.last_name} — ${player.position} | ${player.school}`,
    description: player.scouting_summary ?? undefined,
  }
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params
  const player = SEED_PLAYERS.find((p) => p.slug === slug)
  if (!player) notFound()

  const seasonStats = SEED_SEASONS_BY_SLUG[slug] ?? null

  return (
    <div>
      <TerminalHeader
        title="PLAYER_PROFILE"
        subtitle={`${player.first_name} ${player.last_name}`}
        status="DATA_LOADED"
      />
      <PlayerProfileView player={player as Player} seasonStats={seasonStats} />
    </div>
  )
}
