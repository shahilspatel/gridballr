import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { flagSchema, reportIdSchema } from '@/lib/validators/scouts'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params
  const idParse = reportIdSchema.safeParse(rawId)
  if (!idParse.success) {
    return NextResponse.json({ error: 'Invalid report id' }, { status: 400 })
  }
  const id = idParse.data

  const ip = getClientIp(req)
  const { success } = await rateLimit(`scouts:flag:${ip}`, { limit: 5, windowMs: 3_600_000 })
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

  const body = await req.json().catch(() => null)
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
    console.error('Flag insert error:', error)
    return NextResponse.json({ error: 'Failed to submit flag' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
