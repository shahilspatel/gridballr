import type { Player, SeedPlayer } from '@/types'
import { formatHeight, formatWeight } from '@/lib/utils/format'

type AnyPlayer = Player | SeedPlayer

/**
 * Build a factual, indexable description for a prospect page when no
 * `scouting_summary` is present. Pure formatting over the existing data —
 * no opinions, no fabricated takes. Used as the meta description and
 * Open Graph description fallback.
 *
 * Output is a 1-3 sentence string under ~300 characters so it fits both
 * meta description (155 char Google snippet) and OG description guidelines.
 */
export function buildPlayerDescription(player: AnyPlayer): string {
  const fullName = `${player.first_name} ${player.last_name}`
  const heightStr = player.height_inches ? formatHeight(player.height_inches) : null
  const weightStr = player.weight_lbs ? formatWeight(player.weight_lbs) : null

  // Sentence 1: who, what, where, when
  const measurables = [heightStr, weightStr].filter(Boolean).join(', ')
  const measurableClause = measurables ? `${measurables} ` : ''
  const s1 = `${fullName} is a ${measurableClause}${player.position} from ${player.school} entering the ${player.draft_year} NFL Draft.`

  // Sentence 2: athletic testing highlights (only verified numbers)
  const athletic: string[] = []
  if (player.forty_yard) athletic.push(`${player.forty_yard.toFixed(2)}s 40-yard dash`)
  if (player.vertical_jump) athletic.push(`${player.vertical_jump}" vertical`)
  if (player.broad_jump) athletic.push(`${player.broad_jump}" broad jump`)
  if (player.bench_press) athletic.push(`${player.bench_press} bench reps`)
  const s2 = athletic.length > 0 ? ` Combine: ${athletic.slice(0, 3).join(', ')}.` : ''

  // Sentence 3: strengths summary (already curated factual labels)
  let s3 = ''
  if (Array.isArray(player.strengths) && player.strengths.length > 0) {
    s3 = ` Known for ${player.strengths.slice(0, 3).join(', ').toLowerCase()}.`
  }

  // Truncate to ~300 chars hard limit so meta tools don't complain
  const full = (s1 + s2 + s3).slice(0, 300).trimEnd()
  return full
}
