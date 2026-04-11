import { test, expect } from '@playwright/test'
import {
  reportIdSchema,
  createReportSchema,
  createCommentSchema,
  flagSchema,
  voteSchema,
  BADGE_VALUES,
} from '../src/lib/validators/scouts'

const VALID_UUID = '4e2b6e89-5e9c-4a4e-9c8a-8b3a3c3c9b22'

test.describe('Zod Validators — reportIdSchema', () => {
  test('accepts valid UUID', () => {
    expect(reportIdSchema.safeParse(VALID_UUID).success).toBe(true)
  })

  test('rejects non-UUID string', () => {
    expect(reportIdSchema.safeParse('not-a-uuid').success).toBe(false)
  })

  test('rejects empty string', () => {
    expect(reportIdSchema.safeParse('').success).toBe(false)
  })

  test('rejects SQL-injection attempt', () => {
    expect(reportIdSchema.safeParse("'; DROP TABLE users--").success).toBe(false)
  })

  test('rejects number', () => {
    expect(reportIdSchema.safeParse(42).success).toBe(false)
  })

  test('rejects null/undefined', () => {
    expect(reportIdSchema.safeParse(null).success).toBe(false)
    expect(reportIdSchema.safeParse(undefined).success).toBe(false)
  })
})

test.describe('Zod Validators — createReportSchema', () => {
  const baseValidReport = {
    player_slug: 'shedeur-sanders',
    tier: 'ELITE' as const,
    summary: 'A'.repeat(60),
    strengths: ['fast'],
    weaknesses: ['raw'],
    badges: [],
    grade: 8.5,
  }

  test('accepts valid report', () => {
    const r = createReportSchema.safeParse(baseValidReport)
    expect(r.success).toBe(true)
  })

  test('rejects summary < 50 chars', () => {
    const r = createReportSchema.safeParse({ ...baseValidReport, summary: 'too short' })
    expect(r.success).toBe(false)
  })

  test('rejects summary > 2000 chars', () => {
    const r = createReportSchema.safeParse({
      ...baseValidReport,
      summary: 'A'.repeat(2001),
    })
    expect(r.success).toBe(false)
  })

  test('rejects invalid tier', () => {
    const r = createReportSchema.safeParse({ ...baseValidReport, tier: 'SUPER_ELITE' })
    expect(r.success).toBe(false)
  })

  test('rejects 0 strengths', () => {
    const r = createReportSchema.safeParse({ ...baseValidReport, strengths: [] })
    expect(r.success).toBe(false)
  })

  test('rejects 6+ strengths', () => {
    const r = createReportSchema.safeParse({
      ...baseValidReport,
      strengths: ['a', 'b', 'c', 'd', 'e', 'f'],
    })
    expect(r.success).toBe(false)
  })

  test('rejects grade out of 0-10 range', () => {
    expect(createReportSchema.safeParse({ ...baseValidReport, grade: -1 }).success).toBe(false)
    expect(createReportSchema.safeParse({ ...baseValidReport, grade: 11 }).success).toBe(false)
  })

  test('rejects invalid player_slug (uppercase)', () => {
    const r = createReportSchema.safeParse({ ...baseValidReport, player_slug: 'SHEDEUR-SANDERS' })
    expect(r.success).toBe(false)
  })

  test('rejects invalid player_slug (special chars)', () => {
    const r = createReportSchema.safeParse({ ...baseValidReport, player_slug: 'foo bar' })
    expect(r.success).toBe(false)
  })

  test('rejects empty player_slug', () => {
    const r = createReportSchema.safeParse({ ...baseValidReport, player_slug: '' })
    expect(r.success).toBe(false)
  })

  test('rejects arbitrary string badges (security fix)', () => {
    const r = createReportSchema.safeParse({
      ...baseValidReport,
      badges: ['NOT_A_REAL_BADGE'],
    })
    expect(r.success).toBe(false)
  })

  test('accepts valid badge from enum', () => {
    const r = createReportSchema.safeParse({
      ...baseValidReport,
      badges: ['SPEED_DEMON'],
    })
    expect(r.success).toBe(true)
  })

  test('rejects > 3 badges', () => {
    const r = createReportSchema.safeParse({
      ...baseValidReport,
      badges: ['SPEED_DEMON', 'LOCKDOWN', 'BALL_HAWK', 'FIELD_GENERAL'],
    })
    expect(r.success).toBe(false)
  })

  test('BADGE_VALUES contains expected set', () => {
    expect(BADGE_VALUES).toContain('SPEED_DEMON')
    expect(BADGE_VALUES).toContain('FIELD_GENERAL')
    expect(BADGE_VALUES.length).toBe(15)
  })
})

test.describe('Zod Validators — createCommentSchema', () => {
  test('accepts 10-1000 char content', () => {
    expect(createCommentSchema.safeParse({ content: 'a'.repeat(50) }).success).toBe(true)
  })

  test('rejects < 10 char content', () => {
    expect(createCommentSchema.safeParse({ content: 'short' }).success).toBe(false)
  })

  test('rejects > 1000 char content', () => {
    expect(createCommentSchema.safeParse({ content: 'a'.repeat(1001) }).success).toBe(false)
  })

  test('rejects missing content', () => {
    expect(createCommentSchema.safeParse({}).success).toBe(false)
  })
})

test.describe('Zod Validators — flagSchema', () => {
  test('accepts valid reason', () => {
    expect(flagSchema.safeParse({ reason: 'spam' }).success).toBe(true)
  })

  test('accepts reason with details', () => {
    expect(flagSchema.safeParse({ reason: 'harassment', details: 'because' }).success).toBe(true)
  })

  test('rejects invalid reason', () => {
    expect(flagSchema.safeParse({ reason: 'i-dont-like-it' }).success).toBe(false)
  })

  test('rejects details > 500 chars', () => {
    expect(flagSchema.safeParse({ reason: 'spam', details: 'a'.repeat(501) }).success).toBe(false)
  })
})

test.describe('Zod Validators — voteSchema', () => {
  test('accepts fire/brain/cap', () => {
    expect(voteSchema.safeParse({ vote_type: 'fire' }).success).toBe(true)
    expect(voteSchema.safeParse({ vote_type: 'brain' }).success).toBe(true)
    expect(voteSchema.safeParse({ vote_type: 'cap' }).success).toBe(true)
  })

  test('rejects unknown vote_type', () => {
    expect(voteSchema.safeParse({ vote_type: 'thumbs_up' }).success).toBe(false)
  })

  test('rejects missing vote_type', () => {
    expect(voteSchema.safeParse({}).success).toBe(false)
  })
})
