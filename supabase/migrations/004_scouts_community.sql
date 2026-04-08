-- Scouts Community: voting, flagging, moderation
-- Adds per-user vote tracking, content flags, reputation, and auto-hide triggers

-- Extend profiles with reputation + moderation fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS reputation INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS banned_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Extend scout_reports with scoring + moderation
ALTER TABLE scout_reports
  ADD COLUMN IF NOT EXISTS score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flag_count INT DEFAULT 0;

-- Extend report_comments with scoring + moderation
ALTER TABLE report_comments
  ADD COLUMN IF NOT EXISTS score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flag_count INT DEFAULT 0;

-- Per-user vote tracking on reports (replaces JSONB reactions)
CREATE TABLE report_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES scout_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('fire', 'brain', 'cap')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id, vote_type)
);

CREATE INDEX idx_report_votes_report ON report_votes(report_id);
CREATE INDEX idx_report_votes_user ON report_votes(user_id);

-- Per-user vote tracking on comments
CREATE TABLE comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES report_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value INT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);

-- Content flags for moderation
CREATE TABLE content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('report', 'comment')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('profanity', 'spam', 'harassment', 'misinformation', 'other')),
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reporter_id, target_type, target_id)
);

CREATE INDEX idx_flags_target ON content_flags(target_type, target_id);

-- RLS
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;

-- Public read for votes (needed for counts)
CREATE POLICY "Public read report_votes" ON report_votes FOR SELECT USING (true);
CREATE POLICY "Users manage own votes" ON report_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own votes" ON report_votes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read comment_votes" ON comment_votes FOR SELECT USING (true);
CREATE POLICY "Users manage own comment votes" ON comment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comment votes" ON comment_votes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users create flags" ON content_flags FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users read own flags" ON content_flags FOR SELECT USING (auth.uid() = reporter_id);

-- Auto-hide content at 3 flags
CREATE OR REPLACE FUNCTION auto_hide_flagged_content()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_type = 'report' THEN
    UPDATE scout_reports
    SET flag_count = flag_count + 1,
        is_hidden = CASE WHEN flag_count + 1 >= 3 THEN TRUE ELSE is_hidden END
    WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'comment' THEN
    UPDATE report_comments
    SET flag_count = flag_count + 1,
        is_hidden = CASE WHEN flag_count + 1 >= 3 THEN TRUE ELSE is_hidden END
    WHERE id = NEW.target_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_content_flagged
  AFTER INSERT ON content_flags
  FOR EACH ROW
  EXECUTE FUNCTION auto_hide_flagged_content();

-- Update score on report when votes change
CREATE OR REPLACE FUNCTION update_report_score()
RETURNS TRIGGER AS $$
DECLARE
  new_score INT;
BEGIN
  SELECT COALESCE(
    SUM(CASE vote_type WHEN 'fire' THEN 2 WHEN 'brain' THEN 3 WHEN 'cap' THEN -1 ELSE 0 END),
    0
  ) INTO new_score
  FROM report_votes
  WHERE report_id = COALESCE(NEW.report_id, OLD.report_id);

  UPDATE scout_reports
  SET score = new_score,
      reactions = (
        SELECT jsonb_build_object(
          'fire', COUNT(*) FILTER (WHERE vote_type = 'fire'),
          'brain', COUNT(*) FILTER (WHERE vote_type = 'brain'),
          'cap', COUNT(*) FILTER (WHERE vote_type = 'cap')
        )
        FROM report_votes
        WHERE report_id = COALESCE(NEW.report_id, OLD.report_id)
      )
  WHERE id = COALESCE(NEW.report_id, OLD.report_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_report_vote_change
  AFTER INSERT OR DELETE ON report_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_report_score();

-- Update reputation when votes are cast on a user's report
CREATE OR REPLACE FUNCTION update_author_reputation()
RETURNS TRIGGER AS $$
DECLARE
  author UUID;
  rep_delta INT;
BEGIN
  -- Get the author of the report
  SELECT user_id INTO author FROM scout_reports WHERE id = NEW.report_id;

  -- Calculate reputation change
  rep_delta := CASE NEW.vote_type
    WHEN 'fire' THEN 2
    WHEN 'brain' THEN 3
    WHEN 'cap' THEN -1
    ELSE 0
  END;

  UPDATE profiles SET reputation = reputation + rep_delta WHERE id = author;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_update_reputation
  AFTER INSERT ON report_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_author_reputation();
