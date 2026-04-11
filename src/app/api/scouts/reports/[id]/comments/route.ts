import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { createCommentSchema, reportIdSchema } from '@/lib/validators/scouts'
import { containsProfanity } from '@/lib/moderation'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params
  const idParse = reportIdSchema.safeParse(rawId)
  if (!idParse.success) {
    return NextResponse.json({ error: 'Invalid report id' }, { status: 400 })
  }
  const id = idParse.data

  const ip = getClientIp(req)
  const { success } = await rateLimit(`scouts:comment:${ip}`, { limit: 10, windowMs: 300_000 })
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit: max 10 comments per 5 minutes' },
      { status: 429 },
    )
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
    return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createCommentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  if (containsProfanity(parsed.data.content)) {
    return NextResponse.json({ error: 'Comment contains inappropriate language' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('report_comments')
    .insert({
      report_id: id,
      user_id: user.id,
      content: parsed.data.content,
    })
    .select(`*, profile:profiles(username, display_name, avatar_url, scout_alias, scout_theme)`)
    .single()

  if (error) {
    console.error('Comment insert error:', error)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params
  const idParse = reportIdSchema.safeParse(rawId)
  if (!idParse.success) {
    return NextResponse.json({ error: 'Invalid report id' }, { status: 400 })
  }
  const id = idParse.data

  const ip = getClientIp(req)
  const { success } = await rateLimit(`scouts:comments:get:${ip}`, {
    limit: 60,
    windowMs: 60_000,
  })
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('report_comments')
    .select(`*, profile:profiles(username, display_name, avatar_url, scout_alias, scout_theme)`)
    .eq('report_id', id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }

  return NextResponse.json(data)
}
