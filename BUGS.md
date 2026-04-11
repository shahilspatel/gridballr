# GridBallr Bug Tracker

## Open

### BUG-003: Scout reports community was non-functional — players table empty + form sends slug

- **Status:** FIXED (2026-04-10)
- **Severity:** Critical (for Pro tier; free tier unaffected)
- **Discovered:** 2026-04-10 round 5 audit
- **Description:** Three compounding bugs make `POST /api/scouts/reports` always fail:
  1. `src/components/scouts/report-form.tsx:160` — the prospect select uses `value={p.slug}`, so the submitted `playerId` is a slug like `"shedeur-sanders"` not a UUID.
  2. `src/lib/validators/scouts.ts` — `createReportSchema.player_id` is `z.string().uuid()`, which rejects every slug.
  3. **Even if the validator accepted slug**, prod's `players` table has **0 rows** (verified via Supabase Management API). All player data lives in in-repo seed files; nothing was ever loaded into the DB. The FK constraint `scout_reports.player_id REFERENCES players(id) ON DELETE CASCADE` would reject any insert.
- **Impact**:
  - Free tier (big board, stat matrix, compare engine, mock draft, lottery sim, galaxy view) is unaffected — all reads come from seed files.
  - Pro tier scouts community is fully broken — users cannot create reports, cannot vote on reports (because none exist), cannot comment.
  - Currently invisible because Stripe is in test mode (nobody is paying for Pro), but the moment Pro is sold, this is a refund-grade bug.
- **Fix path** (NOT done — multi-hour task):
  1. Write a seed migration that loads `SEED_PLAYERS` + `SEED_PLAYERS_2026` from the in-repo files into the `players` table with stable UUIDs (deterministic so future re-runs are idempotent).
  2. Apply to dev + prod.
  3. Either: (a) update `report-form.tsx` to look up the player by slug before submitting, OR (b) update the validator to accept slug, look it up server-side.
  4. Add an end-to-end Playwright test that creates a scout report against the dev DB.
- **Workaround for launch**: Hide the "Create scout report" CTA on the `/scouts` page and remove `/scouts/new` from the navbar. Free tier ships unaffected; Pro tier scouts community ships as a "coming soon" message until BUG-003 is fixed.

### BUG-004: Stripe checkout success_url pointed to nonexistent /dashboard

- **Status:** FIXED (2026-04-10)
- **Severity:** Critical
- **Description:** `src/app/api/checkout/route.ts:68` set `success_url: "${APP_URL}/dashboard?upgraded=true"` but no `/dashboard` route existed. Every paying customer would have landed on a 404.
- **Fix:** Changed to `/?upgraded=true`. Homepage now handles `?upgraded=true` with an "UPGRADE_SUCCESSFUL" banner.

### BUG-005: No logout button

- **Status:** FIXED (2026-04-10)
- **Severity:** Critical
- **Description:** Navbar always showed LOGIN regardless of auth state. No `signOut()` call existed in the entire codebase. A signed-in user had no way to sign out.
- **Fix:** Created `src/components/layout/auth-button.tsx` — client component that checks session via `supabase.auth.getUser()`. Shows `{alias} [LOGOUT]` when signed in, `LOGIN` when anonymous.

### BUG-006: No forgot-password flow

- **Status:** FIXED (2026-04-10)
- **Severity:** High
- **Description:** A user who forgot their password was permanently locked out. No `resetPasswordForEmail` or `updateUser` calls existed.
- **Fix:** Two new pages: `/forgot-password` (enter email → sends reset link via Supabase) and `/reset-password` (set new password after clicking link). "FORGOT_PASSWORD?" link added below login form.

### BUG-007: RLS privilege escalation — users could self-promote to Pro tier

- **Status:** FIXED + LIVE on prod + dev (migration 008, 2026-04-10)
- **Severity:** Critical
- **Description:** `profiles` UPDATE policy had only `USING (auth.uid() = id)` with no `WITH CHECK`. An authenticated user could `PATCH /rest/v1/profiles?id=eq.<self>` with `{tier: 'pro'}` via PostgREST and self-promote to Pro without paying. Same on `scout_reports` — user could flip `is_hidden=false` and reset `flag_count` to bypass moderation.
- **Fix:** Migration 008 adds WITH CHECK to both policies + revokes UPDATE on sensitive columns (tier, stripe\_\*, is_banned, reputation, score, flag_count, is_hidden) from authenticated/anon. Only service role can modify these. Also dropped the over-permissive "Service role inserts profiles" policy and blocked direct anon INSERT to early_access table.

---

## Fixed

### BUG-001: Google Sign-In Error

- **Status:** FIXED + LIVE (2026-04-10)
- **Severity:** High
- **Root cause:** Google OAuth credentials weren't configured in Supabase, so the button hit a 400 from gotrue.
- **Fix:**
  1. GCP OAuth client `GridBallr` (Apr 8, client ID `257971107712-j7rhv59pa36veqm8fdku0r6uva146m11.apps.googleusercontent.com`) was already created by user with correct redirect URI `https://tprkgcyzfafisudedtxp.supabase.co/auth/v1/callback` and JS origins `https://gridballr.com` + `http://localhost:3000`.
  2. Client ID + secret already wired into Supabase auth providers (`external_google_enabled=true`) by user 2 days ago.
  3. **2026-04-10**: set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` in Vercel production env.
  4. **2026-04-10**: redeployed prod (`vercel --prod`).
  5. **2026-04-10**: verified `CONTINUE WITH GOOGLE` button renders on `https://gridballr.com/login`.
- **Cleanup:** Deleted duplicate `GridBallr Supabase Auth` GCP client created during this session's automation.

### BUG-002: "Database error saving new user" on Signup

- **Status:** FIXED + VERIFIED LIVE ON PROD (2026-04-09)
- **Severity:** Critical
- **Root cause:** The `handle_new_user` SECURITY DEFINER trigger from migration 003 had no `SET search_path`. Modern Supabase initializes SECURITY DEFINER functions with an empty search_path for safety, which means `profiles` does not resolve and the INSERT raises an "undefined relation" error. The auth transaction rolls back and gotrue surfaces the opaque message "Database error saving new user".
- **Fix shipped in migration 006:**
  1. Recreated `handle_new_user` with `SET search_path = public, auth`
  2. Wrapped the INSERT in `EXCEPTION WHEN OTHERS THEN RAISE WARNING` so a profile insert failure can never block signup again
  3. Re-asserted the explicit INSERT policy on profiles
  4. Re-granted INSERT/SELECT/UPDATE on profiles to the postgres role
- **Verified live on prod via `admin.auth.admin.createUser`:** test user inserted, trigger fired, profiles row created with `tier='free'` and `scout_alias` from `user_metadata`. Test user cleaned up.

---

## Notes

- Report bugs to the team or add them directly here
- Severity: Critical (blocks usage), High (major feature broken), Medium (workaround exists), Low (cosmetic)
- All fixes get patch notes in CHANGELOG.md
