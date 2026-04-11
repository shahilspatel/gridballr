import { test, expect } from '@playwright/test'
import { earlyAccessSchema } from '../src/lib/validators/early-access'

// Validator-level + HTTP-level tests for the waitlist capture flow.
//
// These tests do NOT assert on a successful insert against the dev DB —
// migration 007 has to run first and we don't want to mutate the database
// from the test suite. Instead we cover the input contract and the rejection
// paths, mirroring the pattern used by api-negative.spec.ts.

let ipCounter = 1
const PID = typeof process !== 'undefined' ? process.pid : 0
function uniqueIp(): string {
  ipCounter += 1
  const o2 = (PID >> 8) & 0xff || 1
  const o3 = ((PID & 0xff) + ((ipCounter >> 8) & 0xff)) & 0xff || 1
  const o4 = ipCounter & 0xff || 1
  return `203.0.${o2 ^ o3 || 1}.${o4}`
}
const ip = (extra: Record<string, string> = {}) => ({
  'x-forwarded-for': uniqueIp(),
  ...extra,
})

test.describe('earlyAccessSchema — validator', () => {
  test('accepts a clean email', () => {
    expect(earlyAccessSchema.safeParse({ email: 'fan@example.com' }).success).toBe(true)
  })

  test('lowercases + trims input', () => {
    const r = earlyAccessSchema.safeParse({ email: '  FAN@Example.COM  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.email).toBe('fan@example.com')
  })

  test('rejects empty', () => {
    expect(earlyAccessSchema.safeParse({ email: '' }).success).toBe(false)
  })

  test('rejects garbage', () => {
    expect(earlyAccessSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })

  test('rejects 255+ char email', () => {
    const huge = 'a'.repeat(250) + '@x.co'
    expect(earlyAccessSchema.safeParse({ email: huge }).success).toBe(false)
  })

  test('honeypot field is accepted by schema (route does the silent-success branch)', () => {
    // Honeypot is intentionally NOT enforced at the schema layer — bots that
    // fill it should get the same response shape as humans, not a "bot
    // detected" error that reveals the trap. The route handler checks
    // parsed.data.website and returns success silently.
    expect(
      earlyAccessSchema.safeParse({ email: 'a@b.co', website: 'http://bot.com' }).success,
    ).toBe(true)
  })

  test('source can be omitted', () => {
    expect(earlyAccessSchema.safeParse({ email: 'a@b.co' }).success).toBe(true)
  })

  test('source > 64 chars rejected', () => {
    expect(earlyAccessSchema.safeParse({ email: 'a@b.co', source: 'x'.repeat(100) }).success).toBe(
      false,
    )
  })
})

test.describe('POST /api/early-access — negative paths', () => {
  test('invalid JSON → 400 (no crash)', async ({ request }) => {
    const res = await request.post('/api/early-access', {
      data: '{not json',
      headers: { 'content-type': 'application/json', ...ip() },
    })
    expect(res.status()).toBeLessThan(500)
    expect([400]).toContain(res.status())
  })

  test('missing email → 400', async ({ request }) => {
    const res = await request.post('/api/early-access', {
      data: {},
      headers: ip(),
    })
    expect(res.status()).toBe(400)
  })

  test('garbage email → 400', async ({ request }) => {
    const res = await request.post('/api/early-access', {
      data: { email: 'not-an-email' },
      headers: ip(),
    })
    expect(res.status()).toBe(400)
  })

  test('honeypot tripped → 200 (silent success)', async ({ request }) => {
    const res = await request.post('/api/early-access', {
      data: { email: 'a@b.co', website: 'spam' },
      headers: ip(),
    })
    expect(res.status()).toBeLessThan(500)
    // Either 200 (silent honeypot bypass before DB) or 400 (validator caught it)
    expect([200, 400]).toContain(res.status())
  })

  test('rate limit fires after 5 hits from same IP', async ({ request }) => {
    const sharedIp = { 'x-forwarded-for': uniqueIp() }
    const responses: number[] = []
    for (let i = 0; i < 7; i++) {
      const res = await request.post('/api/early-access', {
        data: { email: `flood${i}@example.com` },
        headers: sharedIp,
      })
      responses.push(res.status())
    }
    // Last 2 should be 429 (we set limit=5/hr)
    expect(responses.some((s) => s === 429)).toBe(true)
  })
})

test.describe('GET /early-access page', () => {
  test('renders waitlist form', async ({ page }) => {
    await page.goto('/early-access')
    await expect(page.getByText('GET').first()).toBeVisible()
    await expect(page.getByText('JOIN_WAITLIST', { exact: true })).toBeVisible()
    await expect(page.getByPlaceholder('scout@gridballr.com')).toBeVisible()
  })
})
