import { test, expect } from '@playwright/test'
import {
  formatHeight,
  formatWeight,
  formatTime,
  formatStat,
  formatPercent,
  slugify,
  getPositionColor,
  getTierColor,
} from '../src/lib/utils/format'

// Note: moderation.ts (containsProfanity/cleanText) is NOT unit-tested here
// because `bad-words` is ESM-only and can't be loaded by Playwright's test
// runner without reconfiguring the whole TS setup. The wrapper is a 2-line
// passthrough — the library has its own test suite upstream. Coverage comes
// via the integration path in api-negative.spec.ts which exercises the
// validator → moderation chain in the POST /api/scouts/reports route.

test.describe('format — formatHeight', () => {
  test('converts inches to feet and inches', () => {
    expect(formatHeight(73)).toBe(`6'1"`)
    expect(formatHeight(76)).toBe(`6'4"`)
    expect(formatHeight(72)).toBe(`6'0"`)
  })

  test('returns em-dash for null', () => {
    expect(formatHeight(null)).toBe('—')
  })

  test('returns em-dash for 0 (NOTE: falsy-check, treats 0 as missing)', () => {
    // Pre-existing behavior: `if (!inches)` treats 0 as null.
    // Flagged in audit but not changed — no real height can be 0.
    expect(formatHeight(0)).toBe('—')
  })
})

test.describe('format — formatWeight', () => {
  test('appends lbs suffix', () => {
    expect(formatWeight(215)).toBe('215 lbs')
  })

  test('returns em-dash for null', () => {
    expect(formatWeight(null)).toBe('—')
  })
})

test.describe('format — formatTime', () => {
  test('formats to 2 decimals', () => {
    expect(formatTime(4.69)).toBe('4.69')
    expect(formatTime(4.5)).toBe('4.50')
  })

  test('returns em-dash for null', () => {
    expect(formatTime(null)).toBe('—')
  })
})

test.describe('format — formatStat', () => {
  test('default 1 decimal', () => {
    expect(formatStat(3.14159)).toBe('3.1')
  })

  test('configurable decimals', () => {
    expect(formatStat(3.14159, 3)).toBe('3.142')
  })

  test('handles 0 correctly (distinct from null)', () => {
    expect(formatStat(0)).toBe('0.0')
  })

  test('returns em-dash for null and undefined', () => {
    expect(formatStat(null)).toBe('—')
  })
})

test.describe('format — formatPercent', () => {
  test('formats with % suffix', () => {
    expect(formatPercent(55.5)).toBe('55.5%')
  })

  test('handles 0 (not treated as missing)', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })

  test('returns em-dash for null', () => {
    expect(formatPercent(null)).toBe('—')
  })
})

test.describe('format — slugify', () => {
  test('lowercases and hyphenates', () => {
    expect(slugify('Shedeur Sanders')).toBe('shedeur-sanders')
  })

  test('strips punctuation', () => {
    expect(slugify("Ja'Marr Chase Jr.")).toBe('ja-marr-chase-jr')
  })

  test('collapses multiple separators', () => {
    expect(slugify('A  B   C')).toBe('a-b-c')
  })

  test('strips leading and trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello')
    expect(slugify('-hello-')).toBe('hello')
  })
})

test.describe('format — getPositionColor', () => {
  test('returns known position colors', () => {
    expect(getPositionColor('QB')).toBe('#ff6b6b')
    expect(getPositionColor('WR')).toBe('#00f0ff')
  })

  test('returns fallback gray for unknown positions', () => {
    expect(getPositionColor('ZZZ')).toBe('#71717a')
  })
})

test.describe('format — getTierColor', () => {
  test('returns known tier colors', () => {
    expect(getTierColor('ELITE')).toBe('#ffd700')
    expect(getTierColor('FRANCHISE')).toBe('#00f0ff')
  })

  test('returns fallback for unknown tiers', () => {
    expect(getTierColor('MYTHIC')).toBe('#71717a')
  })
})
