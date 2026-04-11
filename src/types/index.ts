export type Position =
  | 'QB'
  | 'RB'
  | 'WR'
  | 'TE'
  | 'OT'
  | 'IOL'
  | 'EDGE'
  | 'DL'
  | 'LB'
  | 'CB'
  | 'S'
  | 'K'
  | 'P'

export type PositionGroup = 'offense' | 'defense' | 'special_teams'

export type Tier = 'ELITE' | 'FRANCHISE' | 'ALL_STAR' | 'STARTER' | 'ROTATION' | 'DEPTH'

export type Badge =
  | 'SPEED_DEMON'
  | 'LOCKDOWN'
  | 'ROUTE_TECHNICIAN'
  | 'ARM_CANNON'
  | 'RUN_STUFFER'
  | 'BALL_HAWK'
  | 'PANCAKE_MACHINE'
  | 'PLAY_MAKER'
  | 'DUAL_THREAT'
  | 'RED_ZONE_THREAT'
  | 'PASS_RUSH_SPECIALIST'
  | 'COVERAGE_KING'
  | 'SURE_TACKLER'
  | 'YAC_MONSTER'
  | 'FIELD_GENERAL'

/**
 * A Player as stored in the database (has a real UUID `id`).
 * Components that receive players from Supabase queries use this type.
 */
export interface Player {
  id: string
  slug: string
  first_name: string
  last_name: string
  position: Position
  position_group: PositionGroup
  school: string
  conference: string | null
  class_year: string | null
  draft_year: number
  height_inches: number | null
  weight_lbs: number | null
  arm_length: number | null
  hand_size: number | null
  forty_yard: number | null
  bench_press: number | null
  vertical_jump: number | null
  broad_jump: number | null
  three_cone: number | null
  shuttle: number | null
  hometown: string | null
  high_school: string | null
  hs_ranking: number | null
  headshot_url: string | null
  draft_pick: number | null
  draft_team: string | null
  big_board_rank: number | null
  tier: Tier | null
  scouting_summary: string | null
  strengths: string[]
  weaknesses: string[]
  player_comp: string | null
}

/**
 * A seed prospect loaded from the in-repo JSON data.
 * These have no database `id` — they're identified by `slug`.
 * Anything that pulls from SEED_PLAYERS / SEED_PLAYERS_2026 is a SeedPlayer.
 * Use `Player` only for rows fetched from Supabase.
 */
export type SeedPlayer = Omit<Player, 'id'>

export interface PlayerSeason {
  id: string
  player_id: string
  season: number
  games_played: number | null
  pass_attempts: number | null
  pass_completions: number | null
  pass_yards: number | null
  pass_tds: number | null
  interceptions: number | null
  completion_pct: number | null
  yards_per_attempt: number | null
  passer_rating: number | null
  rush_attempts: number | null
  rush_yards: number | null
  rush_tds: number | null
  yards_per_carry: number | null
  receptions: number | null
  targets: number | null
  rec_yards: number | null
  rec_tds: number | null
  yards_per_reception: number | null
  catch_pct: number | null
  tackles: number | null
  tackles_for_loss: number | null
  sacks: number | null
  interceptions_def: number | null
  passes_defended: number | null
  forced_fumbles: number | null
  epa_per_play: number | null
  success_rate: number | null
  total_snaps: number | null
}

export interface FilmClip {
  id: string
  player_id: string
  youtube_id: string
  title: string | null
  clip_type: 'highlight' | 'breakdown' | 'game_film' | 'interview'
  source_channel: string | null
  duration_seconds: number | null
  sort_order: number
}

export interface ScoutReport {
  id: string
  user_id: string
  player_id: string
  tier: Tier
  summary: string
  strengths: string[]
  weaknesses: string[]
  best_fit: string | null
  badges: Badge[]
  grade: number | null
  reactions: Record<string, number>
  score: number
  is_hidden: boolean
  flag_count: number
  created_at: string
  updated_at: string
  profile?: UserProfile
  player?: Player
}

export interface UserProfile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  tier: 'free' | 'pro'
  scout_alias: string | null
  scout_theme: string
  reputation: number
  is_banned: boolean
  banned_until: string | null
  ban_reason: string | null
  role: 'user' | 'moderator' | 'admin'
}

export interface ReportVote {
  id: string
  report_id: string
  user_id: string
  vote_type: 'fire' | 'brain' | 'cap'
  created_at: string
}

export interface CommentVote {
  id: string
  comment_id: string
  user_id: string
  value: 1 | -1
  created_at: string
}

export interface ContentFlag {
  id: string
  reporter_id: string
  target_type: 'report' | 'comment'
  target_id: string
  reason: 'profanity' | 'spam' | 'harassment' | 'misinformation' | 'other'
  details: string | null
  status: 'pending' | 'reviewed' | 'dismissed'
  created_at: string
}

export interface ReportComment {
  id: string
  report_id: string
  user_id: string
  content: string
  score: number
  is_hidden: boolean
  created_at: string
  profile?: Pick<
    UserProfile,
    'username' | 'display_name' | 'avatar_url' | 'scout_alias' | 'scout_theme'
  >
}

export interface DraftBoard {
  id: string
  user_id: string
  name: string
  is_public: boolean
  rankings: Array<{
    player_id: string
    notes: string | null
    tier: Tier | null
  }>
}

export interface MockDraft {
  id: string
  host_id: string | null
  draft_year: number
  mode: 'solo' | 'multiplayer'
  format: 'snake' | 'auction'
  status: 'lobby' | 'in_progress' | 'completed'
  settings: Record<string, unknown>
  picks: Array<{
    pick_number: number
    team: string
    player_id: string
    user_id: string | null
  }>
  trades: Array<Record<string, unknown>>
}

export interface DynastyValue {
  id: string
  player_id: string
  value: number
  trend: 'up' | 'down' | 'stable' | null
  tier: string | null
  format: 'superflex' | '1qb'
}

export interface HistoricalPick {
  id: string
  draft_year: number
  round: number
  pick_number: number
  team: string
  player_name: string
  position: string | null
  school: string | null
  career_av: number | null
  pro_bowls: number | null
  all_pros: number | null
  games_played: number | null
}

// Utility types
export interface StatColumn {
  key: string
  label: string
  category: 'basic' | 'passing' | 'rushing' | 'receiving' | 'defense' | 'advanced' | 'measurables'
  format?: 'number' | 'decimal' | 'percent' | 'time'
  sortable?: boolean
}

export const NFL_TEAMS = [
  'ARI',
  'ATL',
  'BAL',
  'BUF',
  'CAR',
  'CHI',
  'CIN',
  'CLE',
  'DAL',
  'DEN',
  'DET',
  'GB',
  'HOU',
  'IND',
  'JAX',
  'KC',
  'LAC',
  'LAR',
  'LV',
  'MIA',
  'MIN',
  'NE',
  'NO',
  'NYG',
  'NYJ',
  'PHI',
  'PIT',
  'SEA',
  'SF',
  'TB',
  'TEN',
  'WAS',
] as const

export type NFLTeam = (typeof NFL_TEAMS)[number]

export const POSITION_COLORS: Record<Position, string> = {
  QB: 'pos-qb',
  RB: 'pos-rb',
  WR: 'pos-wr',
  TE: 'pos-te',
  OT: 'pos-ol',
  IOL: 'pos-ol',
  DL: 'pos-dl',
  EDGE: 'pos-edge',
  LB: 'pos-lb',
  CB: 'pos-cb',
  S: 'pos-s',
  K: 'pos-qb',
  P: 'pos-qb',
}

export const TIER_LABELS: Record<Tier, string> = {
  ELITE: 'Elite Prospect',
  FRANCHISE: 'Franchise Player',
  ALL_STAR: 'All-Star Caliber',
  STARTER: 'Day 1 Starter',
  ROTATION: 'Rotation Player',
  DEPTH: 'Depth / Special Teams',
}
