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
