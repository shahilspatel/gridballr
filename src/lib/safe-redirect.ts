/**
 * Returns a redirect path that is guaranteed to be same-origin, or '/' if the
 * input is unsafe. Reject:
 *  - Anything not starting with '/'
 *  - Protocol-relative URLs ('//evil.com')
 *  - Absolute URLs ('http://evil.com', 'javascript:...', 'data:...')
 *  - Backslash-prefixed paths ('/\\evil.com') — browsers normalize \ to /,
 *    turning these into protocol-relative URLs
 *  - Encoded forward/back slashes ('%2f%2fevil.com', '%5cevil.com') that the
 *    browser would decode after redirect
 *  - User-info hijacks ('/@evil.com')
 *
 * The whitelist semantics: must look like an internal path that resolves
 * against the current origin and nothing else.
 */
export function safeRedirect(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return '/'
  // Reject ASCII control chars (including tab, newline, NUL). Some are
  // stripped by the WHATWG URL parser but the input is suspicious anyway,
  // and stripping behavior varies — `/\t/evil.com` becomes `//evil.com` in
  // some parsers, which is exactly the protocol-relative shape we're trying
  // to block. Reject all of \x00-\x1f and \x7f.
  if (/[\x00-\x1f\x7f]/.test(raw)) return '/'
  if (!raw.startsWith('/')) return '/'
  if (raw.startsWith('//')) return '/'
  if (raw.includes('\\')) return '/' // browser-normalized backslash
  if (raw.includes('://')) return '/'
  // Reject percent-encoded slashes that would decode to // or \
  const lower = raw.toLowerCase()
  if (lower.startsWith('/%2f') || lower.startsWith('/%5c')) return '/'
  // Reject user-info syntax: /@host means the URL parser sees host=host
  if (raw.startsWith('/@')) return '/'
  return raw
}
