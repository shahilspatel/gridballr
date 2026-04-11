import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const checkoutSchema = z.object({
  priceId: z.string().min(1),
})

export async function POST(req: Request) {
  // Rate limit: 5 checkout attempts per minute per IP
  const ip = getClientIp(req)
  const { success } = await rateLimit(`checkout:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { priceId } = parsed.data

  // Validate priceId against allowed values
  const { PLANS } = await import('@/lib/stripe/plans')
  const allowedPriceIds: string[] = [PLANS.pro.stripePriceIdMonthly, PLANS.pro.stripePriceIdAnnual]
  if (!allowedPriceIds.includes(priceId)) {
    return NextResponse.json({ error: 'Invalid priceId' }, { status: 400 })
  }

  // Check if user already has a Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  const stripe = getStripe()

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    })
    customerId = customer.id

    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    // /dashboard does not exist (BUG-004 from round 5 audit). Land on the
    // homepage with ?upgraded=true so the user sees the live product
    // immediately and we can show a banner. When /account exists, switch.
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { user_id: user.id },
  })

  return NextResponse.json({ sessionUrl: session.url })
}
