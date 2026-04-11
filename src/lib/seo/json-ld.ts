/**
 * Serialize a value for embedding inside a `<script type="application/ld+json">`
 * tag without risking XSS.
 *
 * `JSON.stringify` does NOT escape `</script>` or HTML special characters,
 * so any user-controllable string in the input could break out of the script
 * tag and execute attacker code (bypassing CSP `'unsafe-inline'` because
 * the surrounding script tag is same-origin and trusted).
 *
 * Today GridBallr's JSON-LD only contains data from typed `Player` records
 * loaded from in-repo seed files, so the risk is theoretical. But the moment
 * player data starts coming from the database (dynasty sync, user-submitted
 * fields, etc.) we want this to already be in place.
 *
 * The escapes below are the standard set: replace `<`, `>`, `&`, line
 * separators, and paragraph separators with their unicode-escape forms.
 * Browsers parse `\u003c` inside a JSON string just fine, so the resulting
 * blob is still valid JSON-LD.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
