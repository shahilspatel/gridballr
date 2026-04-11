// One-shot script: read the seed prospect files, identify which prospects
// are missing a scouting_summary, and write an editorial markdown scaffold
// with their existing data prefilled. Run with:
//
//   node scripts/build-editorial-scaffold.mjs
//
// Output: ./EDITORIAL_BLURBS.md
//
// The user fills in 1-2 sentence honest evaluations under each prospect,
// then runs build-editorial-inject.mjs (TODO if you want roundtrip) or
// pastes the summaries directly back into the seed files.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const FILES = [
  resolve(ROOT, 'src/lib/data/seed-prospects.ts'),
  resolve(ROOT, 'src/lib/data/seed-prospects-2026.ts'),
]

// Parse the seed file as text and extract each player object literal.
// We don't want to take a TS dependency just for this — the seed format
// is consistent enough that a hand-rolled extractor is fine.
function extractPlayers(text) {
  // Find the SEED_PLAYERS / SEED_PLAYERS_2026 array body
  const match = text.match(/export const SEED_PLAYERS(?:_\d+)?:[^=]*=\s*(\[[\s\S]*?\n\])/)
  if (!match) return []
  // Safe: we're reading our own repo files in a build script.
  const arr = eval(match[1])
  return arr
}

const allPlayers = []
for (const path of FILES) {
  try {
    const text = readFileSync(path, 'utf-8')
    const players = extractPlayers(text)
    for (const p of players) {
      allPlayers.push({ ...p, _source: path.split('/').pop() })
    }
  } catch (e) {
    console.error(`Could not parse ${path}:`, e.message)
  }
}

// Sort by big_board_rank, missing-summary first
const needsSummary = allPlayers
  .filter((p) => !p.scouting_summary)
  .sort((a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999))

const hasSummary = allPlayers.filter((p) => p.scouting_summary)

const out = []
out.push('# GridBallr Editorial Scaffold — Scouting Blurbs')
out.push('')
out.push(`Generated ${new Date().toISOString().slice(0, 10)} from seed-prospects*.ts.`)
out.push('')
out.push(`- ${allPlayers.length} total prospects across all classes`)
out.push(`- ${hasSummary.length} already have a scouting_summary`)
out.push(`- **${needsSummary.length} prospects need a 1-2 sentence scouting blurb**`)
out.push('')
out.push('## How to use this file')
out.push('')
out.push('Under each prospect below, write a short honest evaluation in the')
out.push('`SUMMARY:` block. Stay factual — the SEO benefit is the page existing,')
out.push('not the scouting take being viral. When done, paste the summaries')
out.push('back into the corresponding seed file as the `scouting_summary` field.')
out.push('')
out.push('Each prospect already has its athletic testing + strengths + weaknesses')
out.push('shown so you have context without flipping tabs.')
out.push('')
out.push('---')
out.push('')

if (needsSummary.length === 0) {
  out.push('## All prospects have summaries')
  out.push('')
  out.push('Nothing to write. You\'re done.')
} else {
  out.push(`## Prospects needing summaries (${needsSummary.length})`)
  out.push('')

  for (const p of needsSummary) {
    const fullName = `${p.first_name} ${p.last_name}`
    const measurables = []
    if (p.height_inches) {
      const ft = Math.floor(p.height_inches / 12)
      const inch = p.height_inches % 12
      measurables.push(`${ft}'${inch}"`)
    }
    if (p.weight_lbs) measurables.push(`${p.weight_lbs} lbs`)

    out.push(`### ${fullName} — ${p.position} | ${p.school} | ${p.draft_year}`)
    out.push('')
    out.push(`- **Slug:** \`${p.slug}\` (${p._source})`)
    out.push(`- **Big board rank:** ${p.big_board_rank ?? 'unranked'} (tier: ${p.tier ?? '?'})`)
    if (measurables.length) out.push(`- **Measurables:** ${measurables.join(', ')}`)
    if (p.hometown) out.push(`- **From:** ${p.hometown}`)

    const athletic = []
    if (p.forty_yard) athletic.push(`${p.forty_yard}s 40`)
    if (p.vertical_jump) athletic.push(`${p.vertical_jump}" vert`)
    if (p.broad_jump) athletic.push(`${p.broad_jump}" broad`)
    if (p.bench_press) athletic.push(`${p.bench_press} reps`)
    if (athletic.length) out.push(`- **Combine:** ${athletic.join(', ')}`)

    if (Array.isArray(p.strengths) && p.strengths.length) {
      out.push(`- **Strengths:** ${p.strengths.join(', ')}`)
    }
    if (Array.isArray(p.weaknesses) && p.weaknesses.length) {
      out.push(`- **Weaknesses:** ${p.weaknesses.join(', ')}`)
    }
    if (p.player_comp) out.push(`- **Comp:** ${p.player_comp}`)
    out.push('')
    out.push('```')
    out.push('SUMMARY:')
    out.push('(write 1-2 sentences here — stay honest, factual, indexable)')
    out.push('```')
    out.push('')
    out.push('---')
    out.push('')
  }
}

const outPath = resolve(ROOT, 'EDITORIAL_BLURBS.md')
writeFileSync(outPath, out.join('\n'))
console.log(`Wrote ${outPath}`)
console.log(`  ${needsSummary.length} prospects need summaries`)
console.log(`  ${hasSummary.length} already done`)
