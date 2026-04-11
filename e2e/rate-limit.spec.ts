import { test, expect } from '@playwright/test'
import { rateLimit, getClientIp } from '../src/lib/rate-limit'

// These tests exercise the in-memory fallback path because the test environment
// has no UPSTASH_* / KV_REST_API_* env vars configured. That's intentional — it
// means we can assert deterministic behavior without hitting a real Redis.

test.describe('Rate Limit — getClientIp', () => {
  test('returns first IP from x-forwarded-for chain', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  test('trims whitespace around IPs', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '  1.2.3.4  , 5.6.7.8' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  test('returns "unknown" when header missing', () => {
    const req = new Request('http://example.com')
    expect(getClientIp(req)).toBe('unknown')
  })

  test('handles bare IPv6 address', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '2001:db8::1' },
    })
    expect(getClientIp(req)).toBe('2001:db8::1')
  })

  test('strips brackets and port from IPv6', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '[2001:db8::1]:443' },
    })
    expect(getClientIp(req)).toBe('2001:db8::1')
  })

  test('strips port from IPv4', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '192.0.2.1:443' },
    })
    expect(getClientIp(req)).toBe('192.0.2.1')
  })

  test('falls back to x-real-ip when x-forwarded-for missing', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-real-ip': '203.0.113.7' },
    })
    expect(getClientIp(req)).toBe('203.0.113.7')
  })

  test('prefers x-forwarded-for over x-real-ip when both set', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '1.2.3.4', 'x-real-ip': '5.6.7.8' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })
})

test.describe('Rate Limit — in-memory fallback', () => {
  test('allows requests under the limit', async () => {
    const key = `test:under:${Math.random()}`
    const r1 = await rateLimit(key, { limit: 3, windowMs: 60_000 })
    const r2 = await rateLimit(key, { limit: 3, windowMs: 60_000 })
    const r3 = await rateLimit(key, { limit: 3, windowMs: 60_000 })
    expect(r1.success).toBe(true)
    expect(r2.success).toBe(true)
    expect(r3.success).toBe(true)
  })

  test('blocks requests at the limit', async () => {
    const key = `test:at-limit:${Math.random()}`
    await rateLimit(key, { limit: 2, windowMs: 60_000 })
    await rateLimit(key, { limit: 2, windowMs: 60_000 })
    const blocked = await rateLimit(key, { limit: 2, windowMs: 60_000 })
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  test('remaining counter decrements correctly', async () => {
    const key = `test:remaining:${Math.random()}`
    const r1 = await rateLimit(key, { limit: 5, windowMs: 60_000 })
    expect(r1.remaining).toBe(4)
    const r2 = await rateLimit(key, { limit: 5, windowMs: 60_000 })
    expect(r2.remaining).toBe(3)
  })

  test('different keys do not share counter', async () => {
    const keyA = `test:iso-a:${Math.random()}`
    const keyB = `test:iso-b:${Math.random()}`
    await rateLimit(keyA, { limit: 1, windowMs: 60_000 })
    const blockedA = await rateLimit(keyA, { limit: 1, windowMs: 60_000 })
    const allowedB = await rateLimit(keyB, { limit: 1, windowMs: 60_000 })
    expect(blockedA.success).toBe(false)
    expect(allowedB.success).toBe(true)
  })

  test('window resets after expiry', async () => {
    const key = `test:reset:${Math.random()}`
    await rateLimit(key, { limit: 1, windowMs: 50 })
    const blocked = await rateLimit(key, { limit: 1, windowMs: 50 })
    expect(blocked.success).toBe(false)
    await new Promise((r) => setTimeout(r, 80))
    const afterReset = await rateLimit(key, { limit: 1, windowMs: 50 })
    expect(afterReset.success).toBe(true)
  })

  test('default options do not crash', async () => {
    const key = `test:default:${Math.random()}`
    const r = await rateLimit(key)
    expect(r.success).toBe(true)
    expect(typeof r.remaining).toBe('number')
  })
})
