import { test, expect } from '@playwright/test'
import { buildPlayerDescription } from '../src/lib/seo/player-description'
import type { SeedPlayer } from '../src/types'

// Pin the contract of the SEO description fallback. Every assertion in here
// is about FACTUAL formatting — no LLM, no fabricated takes. If a future
// change makes the function start hallucinating, these tests catch it.

const FULL_PLAYER: SeedPlayer = {
  slug: 'test-player',
  first_name: 'John',
  last_name: 'Doe',
  position: 'WR',
  position_group: 'offense',
  school: 'Test U',
  conference: 'SEC',
  class_year: 'SR',
  draft_year: 2026,
  height_inches: 73,
  weight_lbs: 200,
  arm_length: 32,
  hand_size: 9.5,
  forty_yard: 4.42,
  bench_press: 18,
  vertical_jump: 38.5,
  broad_jump: 124,
  three_cone: null,
  shuttle: null,
  hometown: 'Atlanta, GA',
  high_school: 'X HS',
  hs_ranking: null,
  headshot_url: null,
  draft_pick: null,
  draft_team: null,
  big_board_rank: 1,
  tier: 'ELITE',
  scouting_summary: null,
  strengths: ['Speed', 'Hands', 'Route running', 'Tracking'],
  weaknesses: ['Drops in traffic'],
  player_comp: null,
}

test.describe('buildPlayerDescription', () => {
  test('starts with full name', () => {
    const d = buildPlayerDescription(FULL_PLAYER)
    expect(d.startsWith('John Doe is a')).toBe(true)
  })

  test('includes height + weight when present', () => {
    const d = buildPlayerDescription(FULL_PLAYER)
    expect(d).toContain('200 lbs')
    expect(d).toMatch(/6'1"/)
  })

  test('includes school and draft year', () => {
    const d = buildPlayerDescription(FULL_PLAYER)
    expect(d).toContain('Test U')
    expect(d).toContain('2026 NFL Draft')
  })

  test('includes athletic testing numbers when present', () => {
    const d = buildPlayerDescription(FULL_PLAYER)
    expect(d).toContain('4.42s 40-yard dash')
    expect(d).toContain('38.5" vertical')
  })

  test('caps strengths to first 3', () => {
    const d = buildPlayerDescription(FULL_PLAYER)
    expect(d).toContain('speed')
    expect(d).toContain('hands')
    expect(d).toContain('route running')
    // 4th strength must NOT appear
    expect(d.toLowerCase()).not.toContain('tracking')
  })

  test('handles missing measurables', () => {
    const sparse: SeedPlayer = {
      ...FULL_PLAYER,
      height_inches: null,
      weight_lbs: null,
      forty_yard: null,
      vertical_jump: null,
      broad_jump: null,
      bench_press: null,
      strengths: [],
    }
    const d = buildPlayerDescription(sparse)
    expect(d).toContain('John Doe')
    expect(d).toContain('Test U')
    expect(d).toContain('2026 NFL Draft')
    expect(d).not.toContain('Combine:')
    expect(d).not.toContain('Known for')
  })

  test('output stays under 300 chars', () => {
    const d = buildPlayerDescription(FULL_PLAYER)
    expect(d.length).toBeLessThanOrEqual(300)
  })

  test('does not invent claims about the player', () => {
    const d = buildPlayerDescription(FULL_PLAYER)
    // Subjective adjectives must NOT appear unless they came from the data.
    // The function is purely descriptive — no superlatives.
    const fabricated = ['elite', 'best', 'top-tier', 'unstoppable', 'generational', 'projected']
    for (const word of fabricated) {
      expect(d.toLowerCase()).not.toContain(word)
    }
  })
})
