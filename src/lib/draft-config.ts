import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import { SEED_PLAYERS_2026 } from '@/lib/data/seed-prospects-2026'
import type { Player } from '@/types'

export type DraftYearStatus = 'COMPLETED' | 'UPCOMING'

export interface DraftYearConfig {
  year: number
  players: Player[]
  label: DraftYearStatus
}

// Single source of truth for draft year configuration.
// When 2027 rolls around: add 2027 as UPCOMING, flip 2026 to COMPLETED.
export const DRAFT_YEARS: DraftYearConfig[] = [
  {
    year: 2026,
    players: SEED_PLAYERS_2026 as Player[],
    label: 'UPCOMING',
  },
  {
    year: 2025,
    players: SEED_PLAYERS as Player[],
    label: 'COMPLETED',
  },
]

export const CURRENT_DRAFT_YEAR = DRAFT_YEARS.find((d) => d.label === 'UPCOMING')!.year
export const DEFAULT_DRAFT_YEAR = CURRENT_DRAFT_YEAR

export function getPlayersForYear(year: number): Player[] {
  return (DRAFT_YEARS.find((d) => d.year === year)?.players ?? []).sort(
    (a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999),
  )
}

export function getLabelForYear(year: number): DraftYearStatus {
  return DRAFT_YEARS.find((d) => d.year === year)?.label ?? 'COMPLETED'
}

export function getAllYears(): number[] {
  return DRAFT_YEARS.map((d) => d.year)
}

export function getYearLabels(): Record<number, string> {
  return Object.fromEntries(DRAFT_YEARS.map((d) => [d.year, d.label]))
}
