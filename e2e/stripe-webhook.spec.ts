import { test, expect } from '@playwright/test'
import { createHmac } from 'crypto'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Contract tests for the Stripe webhook route. These complement the
// negative-path tests in api-negative.spec.ts by:
//  1. Constructing cryptographically valid signatures using the Stripe SDK
//  2. Sending synthetic events through the full route handler
//  3. Asserting the response behavior added by the audit hardening
//
// We deliberately use fake user_ids / customer_ids that don't exist in the
// database. That means the Supabase `.update().eq()` calls hit no rows. The
// audit fix uses `.update(...).eq(...).select()` and checks the returned row
// count, differentiating "must update" events (checkout.session.completed →
// 500 on 0 rows) from "tolerant" events (subscription.* → log + 200).

function loadEnv(): Record<string, string> {
  try {
    const envPath = resolve(__dirname, '..', '.env.development.local')
    const text = readFileSync(envPath, 'utf-8')
    const out: Record<string, string> = {}
    for (const line of text.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
    return out
  } catch {
    return {}
  }
}

const env = loadEnv()
const WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET
const hasSecret = Boolean(WEBHOOK_SECRET)

test.describe('Stripe Webhook — contract tests', () => {
  test.skip(!hasSecret, 'STRIPE_WEBHOOK_SECRET not in .env.development.local')

  function signPayload(payload: string): string {
    // Manually produce a Stripe-compatible signature header.
    // Format: `t=<unix>,v1=<hmac-sha256(<unix>.<payload>, secret)>`
    // See https://docs.stripe.com/webhooks/signatures
    const timestamp = Math.floor(Date.now() / 1000)
    const signed = `${timestamp}.${payload}`
    const hmac = createHmac('sha256', WEBHOOK_SECRET).update(signed, 'utf8').digest('hex')
    return `t=${timestamp},v1=${hmac}`
  }

  test('rejects event without a stripe-signature header', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: '{"id":"evt_test","type":"checkout.session.completed"}',
      headers: { 'content-type': 'application/json' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('No signature')
  })

  test('rejects event with a malformed signature header', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: '{"id":"evt_test","type":"checkout.session.completed"}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 't=1,v1=deadbeef',
      },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid signature')
    // Audit fix: must not leak Stripe internal error message text
    expect(body.error).not.toContain('No signatures found')
    expect(body.error).not.toContain('Webhook Error')
  })

  test('checkout.session.completed without user_id metadata → 500 (audit fix)', async ({
    request,
  }) => {
    const payload = JSON.stringify({
      id: 'evt_test_missing_meta',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_missing_meta',
          object: 'checkout.session',
          customer: 'cus_test_nomatch',
          subscription: 'sub_test_nomatch',
          metadata: {}, // deliberately empty — pre-fix this silently skipped
        },
      },
    })
    const sig = signPayload(payload)
    const res = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: { 'content-type': 'application/json', 'stripe-signature': sig },
    })
    // Audit fix: previously returned 200 "received" silently, now 500 so Stripe retries
    expect(res.status()).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Missing user_id metadata')
  })

  test('checkout.session.completed with nonexistent user_id → 500 (zero-rows fix)', async ({
    request,
  }) => {
    const payload = JSON.stringify({
      id: 'evt_test_with_meta',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_with_meta',
          object: 'checkout.session',
          customer: 'cus_test_nomatch',
          subscription: 'sub_test_nomatch',
          metadata: { user_id: '00000000-0000-0000-0000-000000000000' },
        },
      },
    })
    const sig = signPayload(payload)
    const res = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: { 'content-type': 'application/json', 'stripe-signature': sig },
    })
    // Audit fix: .select() on the update exposes zero-rows-affected as a
    // distinct error path. Previously returned 200 silently → user pays,
    // never gets pro. Now 500 → Stripe retries.
    expect(res.status()).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Profile not found')
  })

  test('customer.subscription.deleted with unknown customer → 200 (no-op, documented gap)', async ({
    request,
  }) => {
    const payload = JSON.stringify({
      id: 'evt_test_sub_del',
      object: 'event',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_test_nomatch',
          object: 'subscription',
          customer: 'cus_test_nomatch',
          status: 'canceled',
        },
      },
    })
    const sig = signPayload(payload)
    const res = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: { 'content-type': 'application/json', 'stripe-signature': sig },
    })
    expect(res.status()).toBe(200)
  })

  test('customer.subscription.updated with unknown customer → 200 (no-op, documented gap)', async ({
    request,
  }) => {
    const payload = JSON.stringify({
      id: 'evt_test_sub_upd',
      object: 'event',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_test_nomatch',
          object: 'subscription',
          customer: 'cus_test_nomatch',
          status: 'active',
        },
      },
    })
    const sig = signPayload(payload)
    const res = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: { 'content-type': 'application/json', 'stripe-signature': sig },
    })
    expect(res.status()).toBe(200)
  })

  test('unhandled event type → 200 (gracefully ignored)', async ({ request }) => {
    const payload = JSON.stringify({
      id: 'evt_test_ignored',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: { object: {} },
    })
    const sig = signPayload(payload)
    const res = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: { 'content-type': 'application/json', 'stripe-signature': sig },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)
  })
})
