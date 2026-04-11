import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Idempotency: deduplicate by event.id. If the event was already processed
  // (Stripe retry after timeout, network replay, etc.), skip silently.
  const { error: dedupErr } = await supabase
    .from('stripe_events')
    .insert({ event_id: event.id, event_type: event.type })
  if (dedupErr) {
    if (dedupErr.code === '23505') {
      // Already processed — return 200 so Stripe stops retrying.
      return NextResponse.json({ received: true, deduplicated: true })
    }
    // Unexpected DB error — log but don't block the webhook. The switch
    // below will still process the event; worst case it's a no-op.
    console.error('Stripe webhook: dedup insert failed', { eventId: event.id, error: dedupErr })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.user_id
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (!userId) {
        console.error('Stripe webhook: checkout.session.completed missing user_id metadata', {
          eventId: event.id,
          customerId,
        })
        // Return 500 so Stripe retries — manual intervention may still be needed.
        return NextResponse.json({ error: 'Missing user_id metadata' }, { status: 500 })
      }

      // checkout.session.completed is the authoritative "user paid" event.
      // We MUST update the profile. Use .select() so Supabase returns the
      // affected rows — a zero-row update means the user_id does not exist,
      // which is a real bug (not a race). Return 500 so Stripe retries.
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({
          tier: 'pro',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        })
        .eq('id', userId)
        .select('id')

      if (error) {
        console.error('Stripe webhook: failed to upgrade profile on checkout completion', {
          eventId: event.id,
          userId,
          error,
        })
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
      if (!updated || updated.length === 0) {
        console.error(
          'Stripe webhook: checkout.session.completed affected 0 rows — user_id not found',
          { eventId: event.id, userId, customerId },
        )
        return NextResponse.json({ error: 'Profile not found' }, { status: 500 })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      // For subscription.deleted, 0 rows affected is tolerable: the profile
      // may have already been downgraded or the customer row never existed.
      // Log a warning but don't retry (return 200).
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({ tier: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
        .select('id')

      if (error) {
        console.error('Stripe webhook: failed to downgrade profile on subscription deletion', {
          eventId: event.id,
          customerId,
          error,
        })
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
      if (!updated || updated.length === 0) {
        console.warn('Stripe webhook: subscription.deleted matched 0 profiles (no-op)', {
          eventId: event.id,
          customerId,
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const customerId = subscription.customer as string
      const isActive = ['active', 'trialing'].includes(subscription.status)

      // subscription.updated can fire before checkout.session.completed has
      // written stripe_customer_id — that's a real race, not a bug. 0 rows
      // means we'll catch up on the next sync event. Log + return 200.
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({
          tier: isActive ? 'pro' : 'free',
          stripe_subscription_id: subscription.id,
        })
        .eq('stripe_customer_id', customerId)
        .select('id')

      if (error) {
        console.error('Stripe webhook: failed to sync profile on subscription update', {
          eventId: event.id,
          customerId,
          error,
        })
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
      if (!updated || updated.length === 0) {
        console.warn(
          'Stripe webhook: subscription.updated matched 0 profiles (race with checkout.completed)',
          { eventId: event.id, customerId },
        )
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
