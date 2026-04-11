import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { createReportSchema } from '@/lib/validators/scouts'
import { containsProfanity } from '@/lib/moderation'

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const { success } = await rateLimit(`scouts:report:${ip}`, { limit: 3, windowMs: 3_600_000 })
  if (!success) {
    return NextResponse.json({ error: 'Rate limit: max 3 reports per hour' }, { status: 429 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Ban check
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned, banned_until')
    .eq('id', user.id)
    .single()

  if (profile?.is_banned) {
    const until = profile.banned_until ? ` until ${profile.banned_until}` : ''
    return NextResponse.json({ error: `Account suspended${until}` }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { summary, strengths, weaknesses } = parsed.data
  const allText = [summary, ...strengths, ...weaknesses].join(' ')
  // Wrap profanity check so an ESM-load failure on `bad-words` cannot 500
  // every submission. Worst case: the check is bypassed and content goes to
  // the moderation queue via the flag system instead.
  try {
    if (containsProfanity(allText)) {
      return NextResponse.json(
        { error: 'Content contains inappropriate language' },
        { status: 400 },
      )
    }
  } catch (e) {
    console.error('Profanity check failed (open-fail):', e)
  }

  // Resolve player_slug → players.id UUID. The form sends a slug because the
  // client data lives in seed files without UUIDs; we look up the canonical
  // id at submit time. If the slug doesn't match, return 404 not 500.
  const { data: playerRow, error: playerErr } = await supabase
    .from('players')
    .select('id')
    .eq('slug', parsed.data.player_slug)
    .maybeSingle()

  if (playerErr) {
    console.error('Player lookup error:', playerErr)
    return NextResponse.json({ error: 'Player lookup failed' }, { status: 500 })
  }
  if (!playerRow) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('scout_reports')
    .insert({
      user_id: user.id,
      player_id: playerRow.id,
      tier: parsed.data.tier,
      summary: parsed.data.summary,
      strengths: parsed.data.strengths,
      weaknesses: parsed.data.weaknesses,
      badges: parsed.data.badges,
      grade: parsed.data.grade,
      reactions: { fire: 0, brain: 0, cap: 0 },
    })
    .select(
      `*, profile:profiles(username, display_name, avatar_url, scout_alias, scout_theme, reputation)`,
    )
    .single()

  if (error) {
    console.error('Scout report insert error:', error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

const VALID_SORTS = ['recent', 'popular', 'discussed'] as const

export async function GET(req: Request) {
  const ip = getClientIp(req)
  const { success } = await rateLimit(`scouts:reports:get:${ip}`, {
    limit: 60,
    windowMs: 60_000,
  })
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const sortParam = searchParams.get('sort') ?? 'recent'
  const sort = VALID_SORTS.includes(sortParam as (typeof VALID_SORTS)[number])
    ? sortParam
    : 'recent'
  const page = Math.max(1, Math.min(parseInt(searchParams.get('page') ?? '1') || 1, 1000))
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('scout_reports')
    .select(
      `*, profile:profiles(username, display_name, avatar_url, scout_alias, scout_theme, reputation), player:players(slug, first_name, last_name, position, school)`,
    )
    .eq('is_hidden', false)
    .range(offset, offset + limit - 1)

  if (sort === 'popular') {
    query = query.order('score', { ascending: false })
  } else if (sort === 'discussed') {
    // For discussed, we'd need a comment_count column or subquery
    // For now, fall back to score as a proxy
    query = query.order('score', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Scout reports fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }

  return NextResponse.json(data)
}
