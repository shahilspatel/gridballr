-- Seed data for local development
-- Run with: supabase db reset (applies migrations + seed)

-- Insert top 10 prospects for local testing
INSERT INTO players (slug, first_name, last_name, position, position_group, school, conference, class_year, draft_year, height_inches, weight_lbs, forty_yard, vertical_jump, broad_jump, bench_press, arm_length, hand_size, big_board_rank, tier, scouting_summary, strengths, weaknesses, player_comp)
VALUES
  ('shedeur-sanders', 'Shedeur', 'Sanders', 'QB', 'offense', 'Colorado', 'Big 12', 'SR', 2026, 74, 215, 4.69, 32.5, 118, NULL, 32.5, 9.5, 1, 'ELITE', 'Elite processing speed and pocket presence. Pinpoint accuracy on intermediate routes.', ARRAY['Pocket presence', 'Accuracy', 'Decision-making'], ARRAY['Arm strength on deep throws', 'Mobility'], 'Matthew Stafford'),
  ('cam-ward', 'Cam', 'Ward', 'QB', 'offense', 'Miami', 'ACC', 'SR', 2026, 74, 223, 4.62, 34.0, 121, NULL, 33.0, 9.25, 2, 'ELITE', 'Dynamic playmaker with electric arm talent and the ability to create outside structure.', ARRAY['Arm talent', 'Off-script plays', 'Deep accuracy'], ARRAY['Turnover-prone', 'Mechanics inconsistency'], 'Patrick Mahomes'),
  ('travis-hunter', 'Travis', 'Hunter', 'CB', 'defense', 'Colorado', 'Big 12', 'JR', 2026, 73, 185, 4.32, 40.5, 130, 16, 31.5, 9.0, 3, 'ELITE', 'Generational two-way talent. Heisman Trophy winner.', ARRAY['Two-way ability', 'Ball skills', 'Route running'], ARRAY['Snap count concerns', 'Slight frame'], 'Champ Bailey / Deion Sanders'),
  ('tetairoa-mcmillan', 'Tetairoa', 'McMillan', 'WR', 'offense', 'Arizona', 'Big 12', 'JR', 2026, 77, 212, 4.39, 38.5, 128, NULL, 34.0, 10.25, 4, 'ELITE', 'Prototype X receiver with rare size-speed combination.', ARRAY['Contested catches', 'Size-speed combo', 'Body control'], ARRAY['Separation at top of routes', 'Run blocking effort'], 'Julio Jones'),
  ('mason-graham', 'Mason', 'Graham', 'DL', 'defense', 'Michigan', 'Big Ten', 'JR', 2026, 75, 318, 4.98, 30.0, 112, 30, 33.75, 10.5, 5, 'FRANCHISE', 'Elite interior defender who anchors against the run.', ARRAY['Run defense', 'Interior pressure', 'Anchor strength'], ARRAY['Pass rush moves need refinement', 'Not elite first step'], 'Chris Jones'),
  ('abdul-carter', 'Abdul', 'Carter', 'EDGE', 'defense', 'Penn State', 'Big Ten', 'JR', 2026, 75, 252, 4.49, 38.0, 126, 24, 34.25, 10.0, 6, 'FRANCHISE', 'Explosive edge rusher with freakish athleticism.', ARRAY['Explosiveness', 'Bend', 'Motor'], ARRAY['Hand technique refinement', 'Run defense consistency'], 'Micah Parsons'),
  ('will-johnson', 'Will', 'Johnson', 'CB', 'defense', 'Michigan', 'Big Ten', 'JR', 2026, 74, 202, 4.40, 39.0, 126, 18, 32.5, 9.25, 7, 'FRANCHISE', 'Lockdown corner with ideal size, length, and ball skills.', ARRAY['Press technique', 'Ball skills', 'Physicality'], ARRAY['Recovery speed on double moves', 'Occasional grabbing'], 'Jalen Ramsey'),
  ('kelvin-banks', 'Kelvin', 'Banks Jr.', 'OT', 'offense', 'Texas', 'SEC', 'JR', 2026, 76, 320, 5.08, 28.5, 108, 25, 35.5, 10.75, 8, 'FRANCHISE', 'Elite pass protector with rare length and movement skills.', ARRAY['Pass protection', 'Length', 'Footwork'], ARRAY['Run blocking nastiness', 'Playing strength at POA'], 'Tyron Smith'),
  ('ashton-jeanty', 'Ashton', 'Jeanty', 'RB', 'offense', 'Boise State', 'Mountain West', 'JR', 2026, 69, 215, 4.43, 38.5, 126, 20, 30.5, 9.5, 14, 'ALL_STAR', 'Electrifying runner with otherworldly vision and contact balance.', ARRAY['Vision', 'Contact balance', 'Burst'], ARRAY['Competition level', 'Pass protection'], 'Barry Sanders'),
  ('luther-burden', 'Luther', 'Burden III', 'WR', 'offense', 'Missouri', 'SEC', 'JR', 2026, 71, 208, 4.41, 37.0, 126, NULL, 31.25, 9.5, 10, 'ALL_STAR', 'Dynamic playmaker who can line up anywhere.', ARRAY['YAC ability', 'Versatility', 'Power through contact'], ARRAY['Size limitations', 'Contested catch consistency'], 'Deebo Samuel');

-- Insert sample season stats
INSERT INTO player_seasons (player_id, season, games_played, pass_attempts, pass_completions, pass_yards, pass_tds, interceptions, completion_pct, yards_per_attempt, passer_rating, rush_attempts, rush_yards, rush_tds, yards_per_carry, epa_per_play, success_rate, total_snaps)
SELECT id, 2024, 13, 462, 353, 4134, 37, 10, 76.4, 8.95, 167.8, 45, -12, 2, -0.3, 0.215, 0.542, 890
FROM players WHERE slug = 'shedeur-sanders';

INSERT INTO player_seasons (player_id, season, games_played, pass_attempts, pass_completions, pass_yards, pass_tds, interceptions, completion_pct, yards_per_attempt, passer_rating, rush_attempts, rush_yards, rush_tds, yards_per_carry, epa_per_play, success_rate, total_snaps)
SELECT id, 2024, 13, 493, 340, 4313, 39, 7, 69.0, 8.75, 159.2, 68, 186, 3, 2.7, 0.248, 0.518, 915
FROM players WHERE slug = 'cam-ward';

-- Insert film clips with real YouTube IDs
INSERT INTO film_clips (player_id, youtube_id, title, clip_type, source_channel, sort_order)
SELECT id, 'BUOOALFbWIg', 'Shedeur Sanders Top Plays at Colorado | 2023 & 2024 Highlights', 'highlight', 'Bleacher Report', 1
FROM players WHERE slug = 'shedeur-sanders';

INSERT INTO film_clips (player_id, youtube_id, title, clip_type, source_channel, sort_order)
SELECT id, 'T_0nPdqxjkY', 'Cam Ward 2024 Regular Season Highlights | Miami Quarterback', 'highlight', 'ACC Digital Network', 1
FROM players WHERE slug = 'cam-ward';

INSERT INTO film_clips (player_id, youtube_id, title, clip_type, source_channel, sort_order)
SELECT id, 'KWBVSpflBqQ', 'Travis Hunter Heisman Highlights | Top Plays 2024', 'highlight', 'Bleacher Report', 1
FROM players WHERE slug = 'travis-hunter';

-- Create a test user for local dev (password: testpassword123)
-- Note: In Supabase local, you can also use the Auth UI at localhost:54323
