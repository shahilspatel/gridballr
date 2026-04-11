import { test, expect } from '@playwright/test'

// Adversarial / bad-actor test surface.
//
// These tests assume the server is unauthenticated (no cookies). They focus on
// what an attacker can do *before* logging in: probe for crashy parsers, sneak
// past redirect allowlists, abuse content-type tricks, replay malformed
// webhooks, and try to get past the cron secret. Anything that requires a
// real Supabase session is intentionally out of scope (covered by the auth
// integration deferred work documented in session state).
//
// Rate-limit isolation: every adversarial request sets a unique
// `x-forwarded-for` header so the in-memory dev rate limiter (keyed on client
// IP) treats each test as a fresh client. Without this, parallel tests collide
// in the limiter and assertions become noise.

const VALID_UUID = '4e2b6e89-5e9c-4a4e-9c8a-8b3a3c3c9b22'

let ipCounter = 0
// Mix in the worker pid so two parallel Playwright workers don't generate the
// same IP and accidentally share a rate-limit bucket on the dev server. Each
// worker is its own node process, so process.pid is unique within a run.
const PID = typeof process !== 'undefined' ? process.pid : 0
function uniqueIp(): string {
  // RFC5737 TEST-NET range — never routable. Octets derived from pid+counter
  // give us up to 65k unique IPs per worker, far more than any test count.
  ipCounter += 1
  const o2 = (PID >> 8) & 0xff || 1
  const o3 = PID & 0xff || 1
  const o4 = ipCounter & 0xff || 1
  // Roll the counter into o3 too once we exceed 255 so we never repeat.
  const o3plus = (o3 + ((ipCounter >> 8) & 0xff)) & 0xff || 1
  return `198.${o2}.${o3plus}.${o4}`
}

function ipHeaders(): Record<string, string> {
  return { 'x-forwarded-for': uniqueIp() }
}

test.describe('Adversarial — req.json() must not crash routes', () => {
  // Pre-fix bug: 4 routes called `await req.json()` without `.catch()`. Sending
  // invalid JSON crashed the route handler with an unhandled rejection → 500
  // (or in some Next runtimes, the request hung). Post-fix: clean 400.
  const ROUTES: Array<{ method: 'POST'; path: string }> = [
    { method: 'POST', path: '/api/scouts/reports' },
    { method: 'POST', path: `/api/scouts/reports/${VALID_UUID}/vote` },
    { method: 'POST', path: `/api/scouts/reports/${VALID_UUID}/comments` },
    { method: 'POST', path: `/api/scouts/reports/${VALID_UUID}/flag` },
  ]

  for (const { method, path } of ROUTES) {
    test(`${method} ${path} with invalid JSON body → 400 (not 500)`, async ({ request }) => {
      const res = await request.post(path, {
        headers: { 'content-type': 'application/json', ...ipHeaders() },
        data: '{not valid json',
      })
      // Allowed: 400 (bad body) or 401 (auth check fires first).
      // Forbidden: 500 (unhandled crash) or 5xx of any kind.
      expect(res.status(), `${path} should not 5xx on bad JSON`).toBeLessThan(500)
      expect([400, 401]).toContain(res.status())
    })

    test(`${method} ${path} with empty body → 400 (not 500)`, async ({ request }) => {
      const res = await request.post(path, {
        headers: { 'content-type': 'application/json', ...ipHeaders() },
        data: '',
      })
      expect(res.status()).toBeLessThan(500)
      expect([400, 401]).toContain(res.status())
    })

    test(`${method} ${path} with non-JSON content-type → 400 (not 500)`, async ({ request }) => {
      const res = await request.post(path, {
        headers: { 'content-type': 'text/plain', ...ipHeaders() },
        data: 'plain text body',
      })
      expect(res.status()).toBeLessThan(500)
      expect([400, 401, 415]).toContain(res.status())
    })
  }
})

test.describe('Adversarial — auth callback safeRedirect bypass attempts', () => {
  // The redirect param is supposed to only allow same-origin paths. We try
  // every classic open-redirect bypass we can think of. Each one should
  // resolve to "/" (or stay same-origin), never to evil.com.
  //
  // We don't pass a `code` so the route skips the supabase exchange and just
  // honors the redirect — that's the path we want to assert against.
  const ATTACKS = [
    '//evil.com',
    '///evil.com',
    'http://evil.com',
    'https://evil.com',
    '//evil.com/path',
    '/\\evil.com', // browsers normalize \ → /, becoming //evil.com
    '/\\\\evil.com',
    '\\\\evil.com',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '/%2f%2fevil.com',
    '/%2F%2Fevil.com',
    '/%5cevil.com',
    '%2f%2fevil.com',
    '@evil.com',
    '/@evil.com',
    'mailto:evil@evil.com',
    'file:///etc/passwd',
  ]

  for (const attack of ATTACKS) {
    test(`callback?redirect=${attack} resolves to same-origin only`, async ({ request }) => {
      const url = `/auth/callback?redirect=${encodeURIComponent(attack)}`
      const res = await request.get(url, { maxRedirects: 0, headers: ipHeaders() })
      // Should be a redirect (3xx) — no codes provided, no exchange to fail
      expect([301, 302, 303, 307, 308]).toContain(res.status())

      const location = res.headers()['location']
      expect(location).toBeTruthy()

      // Whatever the destination is, it must resolve to localhost:3000 only.
      // Use URL parsing with the request origin as base — that's what
      // browsers actually do when interpreting Location headers.
      const resolved = new URL(location!, 'http://localhost:3000')
      expect(
        resolved.host,
        `attack "${attack}" leaked to ${resolved.host} (Location: ${location})`,
      ).toBe('localhost:3000')
    })
  }
})

test.describe('Adversarial — cron stale-check authorization', () => {
  test('GET without authorization header → 401', async ({ request }) => {
    const res = await request.get('/api/cron/stale-check', { headers: ipHeaders() })
    expect(res.status()).toBe(401)
  })

  test('GET with wrong bearer token → 401', async ({ request }) => {
    const res = await request.get('/api/cron/stale-check', {
      headers: { authorization: 'Bearer not-the-real-secret', ...ipHeaders() },
    })
    expect(res.status()).toBe(401)
  })

  test('GET with malformed authorization header → 401', async ({ request }) => {
    const res = await request.get('/api/cron/stale-check', {
      headers: { authorization: 'not-bearer-format', ...ipHeaders() },
    })
    expect(res.status()).toBe(401)
  })

  test('GET with empty bearer → 401', async ({ request }) => {
    const res = await request.get('/api/cron/stale-check', {
      headers: { authorization: 'Bearer ', ...ipHeaders() },
    })
    expect(res.status()).toBe(401)
  })

  test('POST method on cron route → 405/404 (no body handler)', async ({ request }) => {
    const res = await request.post('/api/cron/stale-check', { data: {}, headers: ipHeaders() })
    expect([404, 405]).toContain(res.status())
  })
})

test.describe('Adversarial — method confusion across routes', () => {
  // Make sure each route only responds to its declared methods.
  const CASES: Array<{ method: 'GET' | 'PUT' | 'DELETE' | 'PATCH'; path: string }> = [
    { method: 'GET', path: '/api/checkout' },
    { method: 'PUT', path: '/api/checkout' },
    { method: 'DELETE', path: '/api/checkout' },
    { method: 'GET', path: '/api/webhooks/stripe' },
    { method: 'PUT', path: '/api/webhooks/stripe' },
    { method: 'PUT', path: '/api/scouts/reports' },
    { method: 'DELETE', path: '/api/scouts/reports' },
    { method: 'PATCH', path: `/api/scouts/reports/${VALID_UUID}/vote` },
    { method: 'PUT', path: `/api/scouts/reports/${VALID_UUID}/comments` },
  ]

  for (const { method, path } of CASES) {
    test(`${method} ${path} → 4xx (no method handler)`, async ({ request }) => {
      const res = await request.fetch(path, { method, headers: ipHeaders() })
      expect(res.status()).toBeGreaterThanOrEqual(400)
      expect(res.status()).toBeLessThan(500)
    })
  }
})

test.describe('Adversarial — JSON depth & oversized payloads', () => {
  test('deeply nested JSON does not crash report POST', async ({ request }) => {
    // Build a 200-deep nested object. Zod parsing should reject (no matching
    // shape), but it must not crash the runtime.
    let payload: unknown = 'leaf'
    for (let i = 0; i < 200; i++) payload = { nested: payload }
    const res = await request.post('/api/scouts/reports', {
      data: payload,
      headers: { 'content-type': 'application/json', ...ipHeaders() },
    })
    expect(res.status()).toBeLessThan(500)
    expect([400, 401]).toContain(res.status())
  })

  test('huge string in summary field is rejected by validator', async ({ request }) => {
    // 1MB string — well under Vercel's 4.5MB body cap so it reaches our code.
    const huge = 'a'.repeat(1_000_000)
    const res = await request.post('/api/scouts/reports', {
      data: {
        summary: huge,
        player_id: VALID_UUID,
        tier: 'ELITE',
        strengths: ['x'],
        weaknesses: ['y'],
        badges: [],
        grade: 5,
      },
      headers: { 'content-type': 'application/json', ...ipHeaders() },
    })
    expect(res.status()).toBeLessThan(500)
    expect([400, 401]).toContain(res.status())
  })

  test('array of 10000 strengths is rejected', async ({ request }) => {
    const strengths = Array.from({ length: 10_000 }, (_, i) => `s${i}`)
    const res = await request.post('/api/scouts/reports', {
      data: {
        summary: 'a'.repeat(60),
        player_id: VALID_UUID,
        tier: 'ELITE',
        strengths,
        weaknesses: ['x'],
        badges: [],
        grade: 5,
      },
      headers: ipHeaders(),
    })
    expect(res.status()).toBeLessThan(500)
    expect([400, 401]).toContain(res.status())
  })
})

test.describe('Adversarial — checkout priceId validation', () => {
  test('arbitrary priceId rejected even with auth-shaped body', async ({ request }) => {
    const res = await request.post('/api/checkout', {
      data: { priceId: 'price_attacker_owned' },
      headers: ipHeaders(),
    })
    // 401 (no session) or 400 (invalid priceId after auth check). Never 200.
    expect([400, 401]).toContain(res.status())
  })

  test('priceId injection attempts rejected', async ({ request }) => {
    const ATTACKS = [
      { priceId: '../../etc/passwd' },
      { priceId: { $ne: null } },
      { priceId: ['price_a', 'price_b'] },
      { priceId: 0 },
      { priceId: null },
      { priceId: '' },
      { priceId: 'price_x\nLog: pwned' }, // log injection
    ]
    for (const data of ATTACKS) {
      const res = await request.post('/api/checkout', { data, headers: ipHeaders() })
      expect(res.status()).toBeLessThan(500)
      expect([400, 401]).toContain(res.status())
    }
  })
})

test.describe('Adversarial — sort param injection on /api/scouts/reports', () => {
  // The route has a fixed allowlist (recent/popular/discussed). Anything else
  // must fall back to 'recent' silently. We assert the route never 5xx's and
  // that wild input doesn't poison the SQL ordering.
  const ATTACKS = [
    "recent'; DROP TABLE scout_reports--",
    'created_at DESC; DELETE FROM profiles',
    '__proto__',
    'constructor',
    '../recent',
    'recent\u0000popular',
    'recent\nUNION SELECT *',
    'recent OR 1=1',
  ]
  for (const sort of ATTACKS) {
    test(`?sort=${JSON.stringify(sort)} falls back without 5xx`, async ({ request }) => {
      const res = await request.get(`/api/scouts/reports?sort=${encodeURIComponent(sort)}`, {
        headers: ipHeaders(),
      })
      expect(res.status()).toBeLessThan(500)
      // 200 because the route silently falls back to 'recent'
      expect(res.status()).toBe(200)
    })
  }
})

test.describe('Adversarial — page param bounds', () => {
  const ATTACKS = ['-1', '0', '999999999999', 'NaN', '1.5', '1e10', "1'; DROP--", '__proto__']
  for (const page of ATTACKS) {
    test(`?page=${JSON.stringify(page)} clamps without 5xx`, async ({ request }) => {
      const res = await request.get(`/api/scouts/reports?page=${encodeURIComponent(page)}`, {
        headers: ipHeaders(),
      })
      expect(res.status()).toBeLessThan(500)
    })
  }
})

test.describe('Adversarial — security headers present on every page', () => {
  // vercel.json sets these globally, but in dev (next dev) they're NOT
  // applied — vercel.json only matters on the Vercel platform. We only assert
  // headers Next.js itself sets, plus Cache-Control on /api routes.

  test('/api/scouts/reports has no-store cache control or absent header', async ({ request }) => {
    const res = await request.get('/api/scouts/reports', { headers: ipHeaders() })
    const cc = res.headers()['cache-control']
    // Either Vercel header pipeline ran (no-store) or it didn't (undefined).
    // Forbidden: a long max-age that would let intermediaries cache user data.
    if (cc) {
      expect(cc).not.toMatch(/max-age=\d{3,}/)
    }
  })

  test('homepage responds with 200 and HTML', async ({ request }) => {
    const res = await request.get('/', { headers: ipHeaders() })
    expect(res.status()).toBe(200)
    const contentType = res.headers()['content-type'] || ''
    expect(contentType).toContain('text/html')
  })
})

test.describe('Adversarial — vote_type prototype pollution attempts', () => {
  const ATTACKS = [
    { vote_type: '__proto__' },
    { vote_type: 'constructor' },
    { vote_type: { polluted: true } },
    { vote_type: ['fire'] },
    { vote_type: null },
    { __proto__: { isAdmin: true }, vote_type: 'fire' },
  ]
  for (const data of ATTACKS) {
    test(`vote with payload ${JSON.stringify(data).slice(0, 60)} → 4xx`, async ({ request }) => {
      const res = await request.post(`/api/scouts/reports/${VALID_UUID}/vote`, {
        data,
        headers: ipHeaders(),
      })
      expect(res.status()).toBeLessThan(500)
      expect([400, 401]).toContain(res.status())
    })
  }
})

test.describe('Adversarial — Stripe webhook surface (unsigned)', () => {
  test('huge unsigned body still rejected fast', async ({ request }) => {
    const huge = 'x'.repeat(100_000) // 100KB junk
    const res = await request.post('/api/webhooks/stripe', {
      data: huge,
      headers: { 'content-type': 'application/json', ...ipHeaders() },
    })
    expect(res.status()).toBe(400)
  })

  test('signature header with empty value → 400', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: '{"type":"checkout.session.completed"}',
      headers: { 'content-type': 'application/json', 'stripe-signature': '', ...ipHeaders() },
    })
    expect(res.status()).toBe(400)
  })

  test('signature header with whitespace value → 400', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: '{"type":"checkout.session.completed"}',
      headers: { 'content-type': 'application/json', 'stripe-signature': '   ', ...ipHeaders() },
    })
    expect(res.status()).toBe(400)
  })
})
