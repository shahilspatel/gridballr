import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Extract the client IP from request headers. Handles:
 *  - x-forwarded-for with multiple hops (takes first, which on Vercel is the
 *    real client)
 *  - IPv6 addresses (both bare `2001:db8::1` and bracketed `[2001:db8::1]:443`)
 *  - x-real-ip as a fallback (some reverse proxies set only this)
 *  - Missing headers → returns 'unknown' so the caller doesn't crash
 *
 * WARNING: On platforms other than Vercel, x-forwarded-for is trivially
 * spoofable by clients. Only trust this value behind a proxy that rewrites
 * the header. See https://vercel.com/docs/edge-network/headers for Vercel's
 * handling.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  const candidate = xff ? xff.split(',')[0].trim() : req.headers.get('x-real-ip')?.trim()
  if (!candidate) return 'unknown'
  return normalizeIp(candidate)
}

function normalizeIp(raw: string): string {
  // Bracketed IPv6 with optional port: "[2001:db8::1]:443" → "2001:db8::1"
  if (raw.startsWith('[')) {
    const end = raw.indexOf(']')
    return end > 0 ? raw.slice(1, end) : raw
  }
  // IPv4 with port: "192.0.2.1:443" → "192.0.2.1"
  // (IPv6 without brackets can't have a port, so a lone colon means IPv4:port)
  const colonCount = raw.match(/:/g)?.length ?? 0
  if (colonCount === 1) {
    return raw.slice(0, raw.indexOf(':'))
  }
  // Bare IPv6 or IPv4 — leave as-is
  return raw
}

// Use Upstash Redis in production, in-memory fallback for local dev
// Vercel integration uses KV_REST_API_* naming, @upstash/redis uses UPSTASH_REDIS_REST_*
const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
const isUpstashConfigured = Boolean(redisUrl && redisToken)

// Share a single Redis client, and memoize Ratelimit instances per (limit, windowMs) pair
// so we don't allocate a new one on every request.
const redisClient = isUpstashConfigured ? new Redis({ url: redisUrl!, token: redisToken! }) : null

const limiterCache = new Map<string, Ratelimit>()

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit {
  const windowSec = Math.ceil(windowMs / 1000)
  const cacheKey = `${limit}:${windowSec}`
  const cached = limiterCache.get(cacheKey)
  if (cached) return cached
  const limiter = new Ratelimit({
    redis: redisClient!,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: true,
    prefix: 'gridballr:rl',
  })
  limiterCache.set(cacheKey, limiter)
  return limiter
}

// In-memory fallback for local development
const memoryStore = new Map<string, { count: number; resetAt: number }>()

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = memoryStore.get(key)

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count }
}

export async function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): Promise<{ success: boolean; remaining: number }> {
  if (isUpstashConfigured) {
    const limiter = getUpstashLimiter(limit, windowMs)
    const result = await limiter.limit(key)
    return { success: result.success, remaining: result.remaining }
  }

  return memoryRateLimit(key, limit, windowMs)
}

// Clean up stale in-memory entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of memoryStore) {
      if (now > entry.resetAt) memoryStore.delete(key)
    }
  }, 300_000)
}
