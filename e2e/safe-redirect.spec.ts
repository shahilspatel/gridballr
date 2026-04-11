import { test, expect } from '@playwright/test'
import { safeRedirect } from '../src/lib/safe-redirect'

// Unit tests for the shared open-redirect guard. The HTTP-level proof that
// the auth/callback route can't be tricked lives in adversarial.spec.ts;
// these tests pin the helper itself so future refactors can't regress.

test.describe('safeRedirect — accepts safe same-origin paths', () => {
  const VALID = ['/', '/dashboard', '/scouts/123', '/players/joe-bob?tab=film', '/a/b/c#anchor']
  for (const p of VALID) {
    test(`accepts ${JSON.stringify(p)}`, () => {
      expect(safeRedirect(p)).toBe(p)
    })
  }
})

test.describe('safeRedirect — null/empty/non-string', () => {
  test('null → /', () => {
    expect(safeRedirect(null)).toBe('/')
  })
  test('undefined → /', () => {
    expect(safeRedirect(undefined)).toBe('/')
  })
  test('empty string → /', () => {
    expect(safeRedirect('')).toBe('/')
  })
})

test.describe('safeRedirect — protocol-relative URLs', () => {
  const ATTACKS = ['//evil.com', '///evil.com', '////evil.com', '//evil.com/path?x=1']
  for (const p of ATTACKS) {
    test(`rejects ${JSON.stringify(p)}`, () => {
      expect(safeRedirect(p)).toBe('/')
    })
  }
})

test.describe('safeRedirect — absolute URLs', () => {
  const ATTACKS = [
    'http://evil.com',
    'https://evil.com',
    'javascript:alert(1)',
    'data:text/html,<script>',
    'file:///etc/passwd',
    'mailto:x@x.com',
    'ftp://evil.com',
  ]
  for (const p of ATTACKS) {
    test(`rejects ${JSON.stringify(p)}`, () => {
      expect(safeRedirect(p)).toBe('/')
    })
  }
})

test.describe('safeRedirect — backslash bypass', () => {
  // The original gap: '/\evil.com' starts with '/' and doesn't start with
  // '//', so a naive prefix check passes it. Browsers normalize the
  // backslash to a forward slash → '//evil.com' → external redirect.
  const ATTACKS = ['/\\evil.com', '/\\\\evil.com', '\\\\evil.com', '/foo\\bar', '\\evil.com']
  for (const p of ATTACKS) {
    test(`rejects ${JSON.stringify(p)}`, () => {
      expect(safeRedirect(p)).toBe('/')
    })
  }
})

test.describe('safeRedirect — encoded slash bypass', () => {
  // Attempts to sneak a // through URL encoding. Whether the browser decodes
  // before or after honoring the Location header is browser-dependent — the
  // safe move is to refuse anything that decodes to a slash escape.
  const ATTACKS = [
    '/%2f%2fevil.com',
    '/%2F%2Fevil.com',
    '/%5cevil.com',
    '/%5Cevil.com',
    '%2f%2fevil.com',
    '%2F%2Fevil.com',
  ]
  for (const p of ATTACKS) {
    test(`rejects ${JSON.stringify(p)}`, () => {
      expect(safeRedirect(p)).toBe('/')
    })
  }
})

test.describe('safeRedirect — userinfo bypass', () => {
  // '/@evil.com' is parsed by some clients as user='', host='evil.com'.
  const ATTACKS = ['/@evil.com', '/@evil.com/path', '@evil.com']
  for (const p of ATTACKS) {
    test(`rejects ${JSON.stringify(p)}`, () => {
      expect(safeRedirect(p)).toBe('/')
    })
  }
})

test.describe('safeRedirect — non-string input', () => {
  test('number → /', () => {
    // @ts-expect-error testing runtime type guard
    expect(safeRedirect(42)).toBe('/')
  })
  test('object → /', () => {
    // @ts-expect-error testing runtime type guard
    expect(safeRedirect({ url: '/dashboard' })).toBe('/')
  })
  test('array → /', () => {
    // @ts-expect-error testing runtime type guard
    expect(safeRedirect(['/dashboard'])).toBe('/')
  })
})
