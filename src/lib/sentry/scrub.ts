// Shared Sentry beforeSend scrubber. Used by sentry.{client,server,edge}.config.ts
// to strip PII / secrets before events leave the app.
//
// Three event types this function handles:
//  - HTTP request URL with secret query params (?token=, ?code=, etc.)
//  - Request headers known to carry credentials (cookie, authorization, ...)
//  - Request body data (always dropped — we never need it for debugging)
//  - User identifiers (IP, email) — dropped unless explicitly captured

// Use the public Sentry types — @sentry/nextjs re-exports the same shapes,
// no need to depend on @sentry/core directly.
import type { ErrorEvent } from '@sentry/nextjs'

const SENSITIVE_QS = /[?&](token|code|secret|password|api[_-]?key|access_token)=[^&]*/gi
const SENSITIVE_HEADERS = ['cookie', 'authorization', 'set-cookie', 'x-api-key']

export function scrubSensitive(event: ErrorEvent): ErrorEvent | null {
  if (event.request) {
    if (event.request.url) {
      event.request.url = event.request.url.replace(SENSITIVE_QS, (m: string) =>
        m.replace(/=[^&]*/, '=[redacted]'),
      )
    }
    if (event.request.headers) {
      const headers = event.request.headers as Record<string, string>
      for (const h of SENSITIVE_HEADERS) {
        if (h in headers) headers[h] = '[redacted]'
      }
    }
    // Drop bodies entirely — never needed for debugging and they routinely
    // contain user input.
    if ('data' in event.request) delete event.request.data
  }
  if (event.user) {
    delete event.user.ip_address
    delete event.user.email
  }
  return event
}
