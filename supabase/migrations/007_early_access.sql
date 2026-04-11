-- Early access waitlist for the launch funnel.
--
-- Captured before signup is fully open OR for a "lifetime discount" promo.
-- Service-role-only writes via the /api/early-access route. No public reads.

CREATE TABLE IF NOT EXISTS public.early_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_early_access_created_at
  ON public.early_access (created_at DESC);

ALTER TABLE public.early_access ENABLE ROW LEVEL SECURITY;

-- No public select / insert / update / delete. Service role bypasses RLS so
-- the API route still writes successfully via the anon client + the explicit
-- insert policy below (the route does NOT use service role).
CREATE POLICY "Anyone can join early access waitlist"
  ON public.early_access
  FOR INSERT
  WITH CHECK (true);
