import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { earlyAccessSchema } from '@/lib/validators/early-access'

// Insert the waitlist row using the SERVICE ROLE key, not the anon-cookie
// client. As of migration 008, the early_access table has NO INSERT policy
// for anon/authenticated — direct REST inserts are blocked. The route is
// the only writer, and it bypasses RLS via service role. This stops anon
// key holders from spamming the table directly via PostgREST and bypassing
// our rate limit + honeypot.
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const REFERRER_MAX = 2048
const USER_AGENT_MAX = 500

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const { success } = await rateLimit(`early-access:${ip}`, {
    limit: 5,
    windowMs: 3_600_000,
  })
  if (!success) {
    return NextResponse.json({ error: 'Rate limit: max 5 signups per hour' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const parsed = earlyAccessSchema.safeParse(body)
  if (!parsed.success) {
    // Generic message — never echo Zod's per-field error to the client. The
    // detailed issue gets logged server-side for debugging.
    console.warn('early-access: invalid input', {
      issues: parsed.error.issues.map((i) => ({ path: i.path, code: i.code })),
    })
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Honeypot tripped → silently succeed so the bot moves on without learning
  // anything about which field is the trap.
  if (parsed.data.website) {
    return NextResponse.json({ success: true })
  }

  const supabase = getServiceClient()

  // Hash the IP so we can rate limit / dedupe abuse without storing PII.
  const ipHash = createHash('sha256').update(`${ip}:gridballr-early-access`).digest('hex')

  const referrer = req.headers.get('referer')?.slice(0, REFERRER_MAX) ?? null
  const userAgent = req.headers.get('user-agent')?.slice(0, USER_AGENT_MAX) ?? null

  const { error } = await supabase.from('early_access').insert({
    email: parsed.data.email,
    source: parsed.data.source ?? null,
    referrer,
    user_agent: userAgent,
    ip_hash: ipHash,
  })

  if (error) {
    // Duplicate email: return identical body to a fresh signup so an attacker
    // cannot enumerate which addresses are on the list. Log the dedupe
    // server-side only.
    if (error.code === '23505') {
      console.info('early-access: duplicate email', { ipHash })
      return NextResponse.json({ success: true })
    }
    console.error('early-access insert error:', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
