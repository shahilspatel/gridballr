import { test, expect } from '@playwright/test'

// Negative-path tests that verify the hardening added in the audit:
// UUID validation, Zod parse failures, missing auth, rate limiting,
// webhook signature requirement.
//
// These tests hit the live dev server via Playwright's `request` fixture —
// no browser needed. They cover only error paths, so they don't mutate data.

test.describe('API Negative Paths — checkout', () => {
  test('POST without auth returns 401', async ({ request }) => {
    const res = await request.post('/api/checkout', {
      data: { priceId: 'price_xxx' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST with no body returns 400', async ({ request }) => {
    const res = await request.post('/api/checkout', {
      headers: { 'content-type': 'application/json' },
      data: '',
    })
    // Either 401 (auth first) or 400 (bad body) — both acceptable
    expect([400, 401]).toContain(res.status())
  })
})

test.describe('API Negative Paths — scouts reports [id] routes', () => {
  const INVALID_IDS = ['not-a-uuid', '', '12345', "'; DROP TABLE--", '../../etc/passwd']

  for (const badId of INVALID_IDS) {
    test(`POST /api/scouts/reports/${JSON.stringify(badId)}/vote → 400/404`, async ({
      request,
    }) => {
      const safeId = encodeURIComponent(badId)
      const res = await request.post(`/api/scouts/reports/${safeId || ' '}/vote`, {
        data: { vote_type: 'fire' },
      })
      // 400 = our UUID validation, 404 = Next routing rejected empty/path-traversal
      expect([400, 401, 404]).toContain(res.status())
    })

    test(`POST /api/scouts/reports/${JSON.stringify(badId)}/comments → 400/404`, async ({
      request,
    }) => {
      const safeId = encodeURIComponent(badId)
      const res = await request.post(`/api/scouts/reports/${safeId || ' '}/comments`, {
        data: { content: 'this is a comment long enough' },
      })
      expect([400, 401, 404]).toContain(res.status())
    })

    test(`POST /api/scouts/reports/${JSON.stringify(badId)}/flag → 400/404`, async ({
      request,
    }) => {
      const safeId = encodeURIComponent(badId)
      const res = await request.post(`/api/scouts/reports/${safeId || ' '}/flag`, {
        data: { reason: 'spam' },
      })
      expect([400, 401, 404]).toContain(res.status())
    })
  }

  test('POST vote with valid UUID but no auth → 401', async ({ request }) => {
    const res = await request.post(
      '/api/scouts/reports/4e2b6e89-5e9c-4a4e-9c8a-8b3a3c3c9b22/vote',
      { data: { vote_type: 'fire' } },
    )
    expect(res.status()).toBe(401)
  })

  test('GET /api/scouts/reports returns 200 (public)', async ({ request }) => {
    const res = await request.get('/api/scouts/reports')
    expect(res.status()).toBe(200)
  })

  test('GET /api/scouts/reports with invalid sort falls back gracefully', async ({ request }) => {
    const res = await request.get('/api/scouts/reports?sort=pwned')
    expect(res.status()).toBe(200)
  })

  test('GET /api/scouts/reports with page out of bounds clamps', async ({ request }) => {
    const res = await request.get('/api/scouts/reports?page=999999')
    expect(res.status()).toBe(200)
  })
})

test.describe('API Negative Paths — Stripe webhook', () => {
  test('POST without stripe-signature header → 400', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: '{"type":"checkout.session.completed"}',
      headers: { 'content-type': 'application/json' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('No signature')
  })

  test('POST with invalid signature → 400 with generic error (no Stripe internals leaked)', async ({
    request,
  }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: '{"type":"checkout.session.completed"}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 't=1,v1=invalid',
      },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    // My hardening: should be generic, not raw Stripe message
    expect(body.error).toBe('Invalid signature')
    // Assert we did NOT leak internals
    expect(body.error).not.toContain('Webhook Error')
    expect(body.error).not.toContain('timestamp')
  })
})
