-- CRITICAL FIX: privilege escalation via RLS UPDATE policies missing WITH CHECK.
--
-- Pre-existing bugs from migration 001 + 003. The two UPDATE policies below
-- only had `USING (auth.uid() = X)` and no `WITH CHECK`. Per PostgREST
-- semantics, USING decides which rows you can SEE for UPDATE; WITH CHECK
-- decides which NEW row values you can WRITE. Without a WITH CHECK clause,
-- an authenticated user can mutate ANY column on rows they can update,
-- including columns that should only ever change via service-role flows
-- (Stripe webhook, moderation triggers, etc.).
--
-- Concrete exploits this fixes:
--
-- 1. profiles: A signed-in user could `PATCH /rest/v1/profiles?id=eq.<self>`
--    with `{tier: 'pro'}` and self-promote to Pro tier without paying. Same
--    for `stripe_customer_id`, `stripe_subscription_id`, `is_banned`,
--    `banned_until`, `ban_reason`, `role`, and `reputation` (which would let
--    you fake a top-scout reputation).
--
-- 2. scout_reports: A signed-in user could PATCH their own moderated report
--    with `{is_hidden: false, flag_count: 0, score: 999}` and undo the
--    auto-hide moderation system. They could also rewrite history on
--    `created_at`, `reactions`, etc.
--
-- 3. early_access: The "Anyone can join early access waitlist" INSERT policy
--    with `WITH CHECK (true)` lets ANY anon-key holder POST directly to
--    `/rest/v1/early_access` and bypass the route's rate limit, honeypot,
--    referrer cap, and IP hashing. (Found by round 5 security audit.)
--
-- 4. Profiles: The "Service role inserts profiles" policy from migration 003
--    grants INSERT to public role with `WITH CHECK (true)`. Combined with
--    PostgREST upsert, this is another self-promote vector. We drop it
--    because migration 006 made the SECURITY DEFINER trigger work without
--    needing the policy as a fallback.

-- ============================================================
-- Fix 1: profiles UPDATE — restrict mutable columns via column GRANTs
-- ============================================================

-- Replace the dangerous policy with one that has both USING and WITH CHECK.
-- Both clauses must be true: USING gates which row, WITH CHECK gates the
-- new row value. This still lets users update their own row, but the
-- column grants below are what actually restrict which fields they can write.
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- The USING+WITH_CHECK above only protects which ROW. To stop a user from
-- modifying tier/stripe fields on their own row, we revoke UPDATE on those
-- specific columns from authenticated/anon. Service role bypasses all of
-- this and continues to work.
REVOKE UPDATE ON public.profiles FROM authenticated, anon;
GRANT UPDATE (
  username,
  display_name,
  avatar_url,
  scout_alias,
  scout_theme
) ON public.profiles TO authenticated;
-- anon never gets UPDATE.

-- ============================================================
-- Fix 2: drop the over-permissive Service role inserts profiles policy
-- ============================================================

-- Migration 003 added this with WITH CHECK (true) as a "belt and suspenders"
-- against the broken trigger. Now that migration 006 fixed the trigger
-- (added SET search_path), the SECURITY DEFINER bypass works correctly and
-- this policy is both unnecessary AND a privilege escalation surface.
DROP POLICY IF EXISTS "Service role inserts profiles" ON public.profiles;

-- Block direct inserts from anon/authenticated entirely. Only the trigger
-- (running as service role / table owner) and direct service-role calls
-- can insert into profiles.
REVOKE INSERT ON public.profiles FROM authenticated, anon;

-- ============================================================
-- Fix 3: scout_reports UPDATE — restrict mutable columns
-- ============================================================

DROP POLICY IF EXISTS "Users update own reports" ON public.scout_reports;
CREATE POLICY "Users update own reports"
  ON public.scout_reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only edit content fields. Score, flag_count, is_hidden,
-- reactions are all maintained by triggers / moderation flows and must
-- never be writable by the report author.
REVOKE UPDATE ON public.scout_reports FROM authenticated, anon;
GRANT UPDATE (
  tier,
  summary,
  strengths,
  weaknesses,
  best_fit,
  badges,
  grade
) ON public.scout_reports TO authenticated;

-- ============================================================
-- Fix 4: early_access — block direct anon insert, force route through service role
-- ============================================================

DROP POLICY IF EXISTS "Anyone can join early access waitlist" ON public.early_access;

-- No INSERT policy at all → anon and authenticated cannot insert via REST.
-- Only the API route (which we'll switch to use SUPABASE_SERVICE_ROLE_KEY)
-- can write. Service role bypasses RLS entirely.
REVOKE INSERT ON public.early_access FROM authenticated, anon;

-- ============================================================
-- Fix 5: early_access length constraints (defense in depth)
-- ============================================================

ALTER TABLE public.early_access
  ADD CONSTRAINT early_access_email_len CHECK (char_length(email) <= 254);
ALTER TABLE public.early_access
  ADD CONSTRAINT early_access_source_len CHECK (source IS NULL OR char_length(source) <= 64);
ALTER TABLE public.early_access
  ADD CONSTRAINT early_access_referrer_len CHECK (referrer IS NULL OR char_length(referrer) <= 2048);
ALTER TABLE public.early_access
  ADD CONSTRAINT early_access_user_agent_len CHECK (user_agent IS NULL OR char_length(user_agent) <= 500);
ALTER TABLE public.early_access
  ADD CONSTRAINT early_access_ip_hash_len CHECK (ip_hash IS NULL OR char_length(ip_hash) <= 128);

-- ============================================================
-- Fix 6: scout_reports + report_comments — also revoke INSERT/UPDATE column-level
-- on score/flag_count/is_hidden so authenticated callers can't even mention them.
-- ============================================================

-- These are computed by triggers and moderation. Authenticated users should
-- never reference them in any write.
REVOKE UPDATE ON public.report_comments FROM authenticated, anon;
GRANT UPDATE (content) ON public.report_comments TO authenticated;
-- (report_comments has no UPDATE policy in migration 001, so this is
-- defense-in-depth in case a future migration adds one.)
