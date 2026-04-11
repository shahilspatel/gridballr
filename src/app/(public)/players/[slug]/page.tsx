import { notFound } from 'next/navigation'
import { TerminalHeader } from '@/components/layout/terminal-header'
import { PlayerProfileView } from '@/components/player/player-profile-view'
import { SEED_PLAYERS, SEED_SEASONS_BY_SLUG } from '@/lib/data/seed-prospects'
import { SEED_PLAYERS_2026 } from '@/lib/data/seed-prospects-2026'
import { buildPlayerDescription } from '@/lib/seo/player-description'
import { safeJsonLd } from '@/lib/seo/json-ld'
import type { Player } from '@/types'
import type { Metadata } from 'next'

const ALL_PROSPECTS = [...SEED_PLAYERS_2026, ...SEED_PLAYERS]

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gridballr.com'

type Props = { params: Promise<{ slug: string }> }

// Pre-generate every prospect page at build time so each one is statically
// indexed by Google. This is the long-tail SEO play: 250+ "[name] scouting
// report" pages, each with structured data.
export async function generateStaticParams() {
  return ALL_PROSPECTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const player = ALL_PROSPECTS.find((p) => p.slug === slug)
  if (!player) return { title: 'Player Not Found' }

  const fullName = `${player.first_name} ${player.last_name}`
  const title = `${fullName} — ${player.position} | ${player.school} | ${player.draft_year} NFL Draft`
  // Prefer the curated scouting summary; fall back to the auto-built factual
  // description when missing. Both stay same-data, no fabrication.
  const description = player.scouting_summary ?? buildPlayerDescription(player)
  const canonical = `${SITE_URL}/players/${player.slug}`

  return {
    title,
    description,
    keywords: [
      fullName,
      `${fullName} scouting report`,
      `${fullName} NFL draft`,
      `${fullName} ${player.position}`,
      `${player.school} ${player.position}`,
      `${player.draft_year} NFL Draft prospects`,
      `${player.position} draft prospects`,
    ],
    alternates: { canonical },
    openGraph: {
      type: 'profile',
      url: canonical,
      title,
      description,
      siteName: 'GridBallr',
      images: [`${canonical}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${canonical}/opengraph-image`],
    },
    robots: { index: true, follow: true },
  }
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params
  const player = ALL_PROSPECTS.find((p) => p.slug === slug)
  if (!player) notFound()

  const seasonStats = SEED_SEASONS_BY_SLUG[slug] ?? null
  const fullName = `${player.first_name} ${player.last_name}`
  const canonical = `${SITE_URL}/players/${player.slug}`

  // schema.org structured data — Person (athlete) + BreadcrumbList. Search
  // engines use this to render rich snippets and bind the page to an entity.
  // Every field is derived from the existing player record, no fabrication.
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': canonical + '#person',
    name: fullName,
    givenName: player.first_name,
    familyName: player.last_name,
    url: canonical,
    image: player.headshot_url ?? undefined,
    jobTitle: `${player.position} — ${player.draft_year} NFL Draft Prospect`,
    affiliation: { '@type': 'CollegeOrUniversity', name: player.school },
    height: player.height_inches
      ? { '@type': 'QuantitativeValue', value: player.height_inches, unitCode: 'INH' }
      : undefined,
    weight: player.weight_lbs
      ? { '@type': 'QuantitativeValue', value: player.weight_lbs, unitCode: 'LBR' }
      : undefined,
    homeLocation: player.hometown ?? undefined,
    description: player.scouting_summary ?? undefined,
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GridBallr', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${player.draft_year} Draft`,
        item: `${SITE_URL}/?draft_year=${player.draft_year}`,
      },
      { '@type': 'ListItem', position: 3, name: fullName, item: canonical },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        // safeJsonLd escapes < > & to unicode escapes so a player field
        // containing `</script>` cannot break out of the script tag.
        // Required even though current data is from typed seed files —
        // future DB-sourced data must NOT be able to inject HTML here.
        dangerouslySetInnerHTML={{ __html: safeJsonLd(personLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <TerminalHeader title="PLAYER_PROFILE" subtitle={fullName} status="DATA_LOADED" />
      <PlayerProfileView player={player as Player} seasonStats={seasonStats} />
    </div>
  )
}
