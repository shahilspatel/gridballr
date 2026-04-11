-- Migration 005: RLS Policy Hardening
-- Fixes: hidden content visibility, profiles sensitive data exposure, redundant policies

-- ============================================================
-- 1. Fix scout_reports: filter out hidden content at DB level
-- ============================================================
DROP POLICY IF EXISTS "Public read scout_reports" ON scout_reports;
CREATE POLICY "Public read visible scout_reports"
  ON scout_reports FOR SELECT
  USING (is_hidden = false);

-- Allow authors to always see their own reports (even if hidden)
CREATE POLICY "Authors read own scout_reports"
  ON scout_reports FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- 2. Fix report_comments: filter out hidden content at DB level
-- ============================================================
DROP POLICY IF EXISTS "Public read report_comments" ON report_comments;
CREATE POLICY "Public read visible report_comments"
  ON report_comments FOR SELECT
  USING (is_hidden = false);

-- Allow authors to always see their own comments
CREATE POLICY "Authors read own report_comments"
  ON report_comments FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. Fix profiles: restrict public access to safe columns via view
--    Drop overly-permissive public read; replace with own-profile read
--    Public profile data served through API routes (already column-filtered)
-- ============================================================
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Authenticated users can read their own full profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Service role (API routes) can read any profile for join queries
-- This works because service role bypasses RLS

-- Create a public view with only safe columns for client-side queries
CREATE OR REPLACE VIEW public_profiles AS
  SELECT id, username, display_name, avatar_url, scout_alias, scout_theme, reputation, role
  FROM profiles;

-- Grant anon/authenticated access to the view
GRANT SELECT ON public_profiles TO anon, authenticated;
