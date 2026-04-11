import { test, expect } from '@playwright/test'
import {
  DRAFT_YEARS,
  CURRENT_DRAFT_YEAR,
  DEFAULT_DRAFT_YEAR,
  getPlayersForYear,
  getLabelForYear,
  getAllYears,
  getYearLabels,
} from '../src/lib/draft-config'

test.describe('draft-config — invariants', () => {
  test('DRAFT_YEARS has at least one entry', () => {
    expect(DRAFT_YEARS.length).toBeGreaterThan(0)
  })

  test('DRAFT_YEARS has exactly one UPCOMING year', () => {
    const upcoming = DRAFT_YEARS.filter((d) => d.label === 'UPCOMING')
    expect(upcoming.length).toBe(1)
  })

  test('CURRENT_DRAFT_YEAR is the UPCOMING year', () => {
    const upcoming = DRAFT_YEARS.find((d) => d.label === 'UPCOMING')!
    expect(CURRENT_DRAFT_YEAR).toBe(upcoming.year)
  })

  test('DEFAULT_DRAFT_YEAR equals CURRENT_DRAFT_YEAR', () => {
    expect(DEFAULT_DRAFT_YEAR).toBe(CURRENT_DRAFT_YEAR)
  })

  test('every year has a non-empty players array', () => {
    for (const d of DRAFT_YEARS) {
      expect(d.players.length).toBeGreaterThan(0)
    }
  })

  test('every player has a draft_year matching its config year', () => {
    for (const d of DRAFT_YEARS) {
      for (const p of d.players) {
        expect(p.draft_year).toBe(d.year)
      }
    }
  })

  test('every player has a unique slug within its year', () => {
    for (const d of DRAFT_YEARS) {
      const slugs = d.players.map((p) => p.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    }
  })

  test('slugs are unique across all years (global uniqueness)', () => {
    const allSlugs = DRAFT_YEARS.flatMap((d) => d.players.map((p) => p.slug))
    expect(new Set(allSlugs).size).toBe(allSlugs.length)
  })
})

test.describe('draft-config — getPlayersForYear', () => {
  test('returns players for known year sorted by big_board_rank', () => {
    const players = getPlayersForYear(CURRENT_DRAFT_YEAR)
    expect(players.length).toBeGreaterThan(0)
    for (let i = 1; i < players.length; i++) {
      const prev = players[i - 1].big_board_rank ?? 999
      const curr = players[i].big_board_rank ?? 999
      expect(curr).toBeGreaterThanOrEqual(prev)
    }
  })

  test('returns empty array for unknown year', () => {
    expect(getPlayersForYear(1984)).toEqual([])
  })
})

test.describe('draft-config — getLabelForYear', () => {
  test('returns correct label for known year', () => {
    expect(getLabelForYear(CURRENT_DRAFT_YEAR)).toBe('UPCOMING')
  })

  test('returns COMPLETED default for unknown year', () => {
    expect(getLabelForYear(1984)).toBe('COMPLETED')
  })
})

test.describe('draft-config — getAllYears', () => {
  test('returns the same years as DRAFT_YEARS', () => {
    expect(getAllYears()).toEqual(DRAFT_YEARS.map((d) => d.year))
  })
})

test.describe('draft-config — getYearLabels', () => {
  test('returns a record mapping year → label', () => {
    const labels = getYearLabels()
    for (const d of DRAFT_YEARS) {
      expect(labels[d.year]).toBe(d.label)
    }
  })
})
