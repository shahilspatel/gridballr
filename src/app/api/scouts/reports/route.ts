import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { createReportSchema } from '@/lib/validators/scouts'
import { containsProfanity } from '@/lib/moderation'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = rateLimit(`scouts:report:${ip}`, { limit: 3, windowMs: 3_600_000 })
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

  const body = await req.json()
  const parsed = createReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { summary, strengths, weaknesses } = parsed.data
  const allText = [summary, ...strengths, ...weaknesses].join(' ')
  if (containsProfanity(allText)) {
    return NextResponse.json({ error: 'Content contains inappropriate language' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('scout_reports')
    .insert({
      user_id: user.id,
      player_id: parsed.data.player_id,
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sort = searchParams.get('sort') ?? 'recent'
  const page = parseInt(searchParams.get('page') ?? '1')
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
