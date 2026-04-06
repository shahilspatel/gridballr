-- GridBallr Initial Schema
-- NFL Draft Prospect Scouting & Analytics Platform

-- Players (draft prospects)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT NOT NULL,
  position_group TEXT NOT NULL,
  school TEXT NOT NULL,
  conference TEXT,
  class_year TEXT,
  draft_year INT NOT NULL,
  height_inches INT,
  weight_lbs INT,
  arm_length NUMERIC(4,2),
  hand_size NUMERIC(4,2),
  forty_yard NUMERIC(4,2),
  bench_press INT,
  vertical_jump NUMERIC(4,1),
  broad_jump INT,
  three_cone NUMERIC(4,2),
  shuttle NUMERIC(4,2),
  hometown TEXT,
  high_school TEXT,
  hs_ranking INT,
  headshot_url TEXT,
  espn_id TEXT,
  draft_pick INT,
  draft_team TEXT,
  big_board_rank INT,
  tier TEXT,
  scouting_summary TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  player_comp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_players_draft_year ON players(draft_year);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_slug ON players(slug);
CREATE INDEX idx_players_big_board ON players(big_board_rank);

-- Season stats
CREATE TABLE player_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  season INT NOT NULL,
  games_played INT,
  pass_attempts INT,
  pass_completions INT,
  pass_yards INT,
  pass_tds INT,
  interceptions INT,
  completion_pct NUMERIC(5,2),
  yards_per_attempt NUMERIC(5,2),
  passer_rating NUMERIC(6,2),
  rush_attempts INT,
  rush_yards INT,
  rush_tds INT,
  yards_per_carry NUMERIC(5,2),
  receptions INT,
  targets INT,
  rec_yards INT,
  rec_tds INT,
  yards_per_reception NUMERIC(5,2),
  catch_pct NUMERIC(5,2),
  tackles INT,
  tackles_for_loss INT,
  sacks NUMERIC(4,1),
  interceptions_def INT,
  passes_defended INT,
  forced_fumbles INT,
  epa_per_play NUMERIC(6,3),
  success_rate NUMERIC(5,3),
  total_snaps INT,
  UNIQUE(player_id, season)
);

CREATE INDEX idx_seasons_player ON player_seasons(player_id);

-- Game logs
CREATE TABLE game_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  season INT NOT NULL,
  week INT,
  opponent TEXT,
  game_date DATE,
  stats JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_game_logs_player ON game_logs(player_id);

-- Player comparisons (precomputed)
CREATE TABLE player_comps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  comp_player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  similarity_score NUMERIC(5,3),
  offensive_sim NUMERIC(5,3),
  defensive_sim NUMERIC(5,3),
  athletic_sim NUMERIC(5,3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, comp_player_id)
);

-- Film clips (YouTube embeds)
CREATE TABLE film_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  title TEXT,
  clip_type TEXT,
  source_channel TEXT,
  duration_seconds INT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_film_player ON film_clips(player_id);

-- User profiles (extends Supabase auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  scout_alias TEXT,
  scout_theme TEXT DEFAULT 'cyan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Draft boards
CREATE TABLE draft_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  rankings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_boards_user ON draft_boards(user_id);

-- Mock draft sessions
CREATE TABLE mock_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id),
  draft_year INT NOT NULL,
  mode TEXT NOT NULL,
  format TEXT DEFAULT 'snake',
  status TEXT DEFAULT 'lobby',
  settings JSONB,
  picks JSONB,
  trades JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scout reports
CREATE TABLE scout_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  summary TEXT NOT NULL,
  strengths TEXT[],
  weaknesses TEXT[],
  best_fit TEXT,
  badges TEXT[],
  grade NUMERIC(3,1),
  reactions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_player ON scout_reports(player_id);
CREATE INDEX idx_reports_user ON scout_reports(user_id);

-- Report comments
CREATE TABLE report_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES scout_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynasty values
CREATE TABLE dynasty_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  value INT NOT NULL,
  trend TEXT,
  tier TEXT,
  format TEXT DEFAULT 'superflex',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, format)
);

-- Draft pick values (for trade calculator)
CREATE TABLE pick_values (
  round INT NOT NULL,
  pick INT NOT NULL,
  value INT NOT NULL,
  draft_year INT NOT NULL,
  format TEXT DEFAULT 'superflex',
  PRIMARY KEY(round, pick, draft_year, format)
);

-- Historical draft picks (2001-2025)
CREATE TABLE historical_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_year INT NOT NULL,
  round INT NOT NULL,
  pick_number INT NOT NULL,
  team TEXT NOT NULL,
  player_name TEXT NOT NULL,
  position TEXT,
  school TEXT,
  career_av INT,
  pro_bowls INT,
  all_pros INT,
  games_played INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_historical_year ON historical_picks(draft_year);

-- User notes
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynasty_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- Public read access for prospect data
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read seasons" ON player_seasons FOR SELECT USING (true);
CREATE POLICY "Public read game_logs" ON game_logs FOR SELECT USING (true);
CREATE POLICY "Public read film_clips" ON film_clips FOR SELECT USING (true);
CREATE POLICY "Public read dynasty_values" ON dynasty_values FOR SELECT USING (true);
CREATE POLICY "Public read historical_picks" ON historical_picks FOR SELECT USING (true);
CREATE POLICY "Public read scout_reports" ON scout_reports FOR SELECT USING (true);
CREATE POLICY "Public read report_comments" ON report_comments FOR SELECT USING (true);

-- Profile policies
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User-owned data policies
CREATE POLICY "Users manage own boards" ON draft_boards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read public boards" ON draft_boards FOR SELECT USING (is_public = true);

CREATE POLICY "Users manage own notes" ON user_notes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users create reports" ON scout_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reports" ON scout_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reports" ON scout_reports FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users create comments" ON report_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON report_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own drafts" ON mock_drafts FOR ALL USING (auth.uid() = host_id);
