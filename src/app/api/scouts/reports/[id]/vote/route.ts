import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { voteSchema } from '@/lib/validators/scouts'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = rateLimit(`scouts:vote:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = voteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  // Toggle: if vote exists, remove it; otherwise add it
  const { data: existing } = await supabase
    .from('report_votes')
    .select('id')
    .eq('report_id', id)
    .eq('user_id', user.id)
    .eq('vote_type', parsed.data.vote_type)
    .single()

  if (existing) {
    await supabase.from('report_votes').delete().eq('id', existing.id)
    return NextResponse.json({ action: 'removed' })
  }

  const { error } = await supabase.from('report_votes').insert({
    report_id: id,
    user_id: user.id,
    vote_type: parsed.data.vote_type,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ action: 'added' }, { status: 201 })
}
