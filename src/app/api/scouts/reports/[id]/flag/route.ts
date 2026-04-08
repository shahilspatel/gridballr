import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { flagSchema } from '@/lib/validators/scouts'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = rateLimit(`scouts:flag:${ip}`, { limit: 5, windowMs: 3_600_000 })
  if (!success) {
    return NextResponse.json({ error: 'Rate limit: max 5 flags per hour' }, { status: 429 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = flagSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { error } = await supabase.from('content_flags').insert({
    reporter_id: user.id,
    target_type: 'report',
    target_id: id,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already flagged' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
