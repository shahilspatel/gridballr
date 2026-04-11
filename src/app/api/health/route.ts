import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// Lightweight liveness/readiness probe for uptime monitors (Better Stack,
// UptimeRobot, etc.). Intentionally does NOT touch the database — a slow or
// degraded Supabase instance shouldn't make the page itself look down.
//
// `?deep=1` adds a Supabase reachability check. The deep path is gated by:
//   - CRON_SECRET bearer (the same secret cron uses), OR
//   - 6 requests/minute/IP rate limit if no bearer is provided
// This prevents an attacker from forcing a Supabase round-trip on every
// request from the public internet.

export const dynamic = 'force-dynamic'

const STARTED_AT = Date.now()

function buildBase() {
  return {
    status: 'ok' as const,
    // Don't leak the full commit SHA — first 7 chars is plenty for "is this
    // the deploy I expect" without giving attackers a precise version pin.
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
    uptimeMs: Date.now() - STARTED_AT,
    timestamp: new Date().toISOString(),
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const deep = url.searchParams.get('deep') === '1'

  if (!deep) {
    return NextResponse.json(buildBase(), {
      headers: { 'cache-control': 'no-store, no-cache, must-revalidate' },
    })
  }

  // Deep mode authorization: either bearer-secret OR rate-limited.
  const authHeader = req.headers.get('authorization')
  const hasBearer = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`

  if (!hasBearer) {
    const ip = getClientIp(req)
    const { success } = await rateLimit(`health-deep:${ip}`, {
      limit: 6,
      windowMs: 60_000,
    })
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'cache-control': 'no-store' } },
      )
    }
  }

  // Verify Supabase is reachable. Don't crash on misconfig — return a
  // degraded body so the monitor can distinguish "down" from "config error".
  let supabase: 'ok' | 'degraded' | 'unconfigured' = 'unconfigured'
  let supabaseLatencyMs: number | null = null
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const start = Date.now()
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const client = await createClient()
      const { error } = await client.from('players').select('id').limit(1)
      supabaseLatencyMs = Date.now() - start
      supabase = error ? 'degraded' : 'ok'
    } catch {
      supabaseLatencyMs = Date.now() - start
      supabase = 'degraded'
    }
  }

  return NextResponse.json(
    { ...buildBase(), supabase, supabaseLatencyMs },
    {
      status: supabase === 'degraded' ? 503 : 200,
      headers: { 'cache-control': 'no-store, no-cache, must-revalidate' },
    },
  )
}
