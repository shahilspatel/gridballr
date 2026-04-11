-- Stripe webhook event deduplication table. Prevents the same event from
-- being processed twice (e.g., Stripe retries after a timeout). The webhook
-- route INSERTs the event_id at the top; if the row already exists (conflict
-- on PK), it skips processing and returns 200.
--
-- Only service role writes (the webhook route uses service role via
-- getSupabaseAdmin()). No public access needed.

CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- No policies → anon/authenticated cannot read or write. Service role bypasses.

-- Auto-clean events older than 30 days to prevent unbounded growth.
-- The webhook only needs to dedup within Stripe's retry window (~72 hours).
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed
  ON public.stripe_events (processed_at);
