export interface NFLTeamInfo {
  abbr: string
  name: string
  city: string
  needs: string[] // position needs in priority order
}

export const NFL_TEAM_DATA: NFLTeamInfo[] = [
  { abbr: 'NYG', name: 'Giants', city: 'New York', needs: ['QB', 'OT', 'EDGE', 'CB', 'WR'] },
  { abbr: 'CLE', name: 'Browns', city: 'Cleveland', needs: ['QB', 'WR', 'OT', 'EDGE', 'CB'] },
  { abbr: 'NE', name: 'Patriots', city: 'New England', needs: ['QB', 'WR', 'OT', 'CB', 'DL'] },
  { abbr: 'TEN', name: 'Titans', city: 'Tennessee', needs: ['QB', 'OT', 'EDGE', 'WR', 'CB'] },
  { abbr: 'JAX', name: 'Jaguars', city: 'Jacksonville', needs: ['OT', 'EDGE', 'DL', 'CB', 'WR'] },
  { abbr: 'LV', name: 'Raiders', city: 'Las Vegas', needs: ['QB', 'EDGE', 'CB', 'WR', 'OT'] },
  { abbr: 'CAR', name: 'Panthers', city: 'Carolina', needs: ['OT', 'EDGE', 'WR', 'CB', 'DL'] },
  { abbr: 'NYJ', name: 'Jets', city: 'New York', needs: ['QB', 'OT', 'WR', 'CB', 'EDGE'] },
  { abbr: 'CHI', name: 'Bears', city: 'Chicago', needs: ['OT', 'WR', 'CB', 'EDGE', 'S'] },
  { abbr: 'NO', name: 'Saints', city: 'New Orleans', needs: ['QB', 'WR', 'CB', 'OT', 'EDGE'] },
  { abbr: 'SF', name: '49ers', city: 'San Francisco', needs: ['QB', 'OT', 'CB', 'EDGE', 'WR'] },
  { abbr: 'DAL', name: 'Cowboys', city: 'Dallas', needs: ['EDGE', 'DL', 'CB', 'OT', 'WR'] },
  { abbr: 'MIA', name: 'Dolphins', city: 'Miami', needs: ['QB', 'OT', 'EDGE', 'LB', 'CB'] },
  { abbr: 'IND', name: 'Colts', city: 'Indianapolis', needs: ['EDGE', 'CB', 'WR', 'OT', 'DL'] },
  { abbr: 'ATL', name: 'Falcons', city: 'Atlanta', needs: ['EDGE', 'DL', 'CB', 'OT', 'IOL'] },
  { abbr: 'ARI', name: 'Cardinals', city: 'Arizona', needs: ['CB', 'EDGE', 'OT', 'DL', 'WR'] },
  { abbr: 'CIN', name: 'Bengals', city: 'Cincinnati', needs: ['OT', 'DL', 'EDGE', 'CB', 'LB'] },
  { abbr: 'SEA', name: 'Seahawks', city: 'Seattle', needs: ['EDGE', 'CB', 'OT', 'DL', 'IOL'] },
  { abbr: 'TB', name: 'Buccaneers', city: 'Tampa Bay', needs: ['EDGE', 'CB', 'DL', 'IOL', 'WR'] },
  { abbr: 'DEN', name: 'Broncos', city: 'Denver', needs: ['WR', 'OT', 'CB', 'EDGE', 'TE'] },
  { abbr: 'LAC', name: 'Chargers', city: 'Los Angeles', needs: ['EDGE', 'OT', 'DL', 'CB', 'WR'] },
  { abbr: 'PIT', name: 'Steelers', city: 'Pittsburgh', needs: ['OT', 'WR', 'CB', 'IOL', 'DL'] },
  { abbr: 'LAR', name: 'Rams', city: 'Los Angeles', needs: ['EDGE', 'CB', 'OT', 'DL', 'WR'] },
  { abbr: 'GB', name: 'Packers', city: 'Green Bay', needs: ['DL', 'EDGE', 'CB', 'OT', 'S'] },
  { abbr: 'HOU', name: 'Texans', city: 'Houston', needs: ['OT', 'EDGE', 'CB', 'DL', 'IOL'] },
  { abbr: 'BAL', name: 'Ravens', city: 'Baltimore', needs: ['WR', 'CB', 'EDGE', 'IOL', 'OT'] },
  { abbr: 'MIN', name: 'Vikings', city: 'Minnesota', needs: ['OT', 'EDGE', 'CB', 'IOL', 'DL'] },
  { abbr: 'WAS', name: 'Commanders', city: 'Washington', needs: ['DL', 'CB', 'EDGE', 'WR', 'OT'] },
  { abbr: 'PHI', name: 'Eagles', city: 'Philadelphia', needs: ['CB', 'LB', 'EDGE', 'S', 'WR'] },
  { abbr: 'BUF', name: 'Bills', city: 'Buffalo', needs: ['EDGE', 'WR', 'CB', 'DL', 'OT'] },
  { abbr: 'DET', name: 'Lions', city: 'Detroit', needs: ['CB', 'EDGE', 'DL', 'S', 'LB'] },
  { abbr: 'KC', name: 'Chiefs', city: 'Kansas City', needs: ['WR', 'EDGE', 'CB', 'OT', 'DL'] },
]

// Map position to broader group for need matching
export function positionMatchesNeed(position: string, need: string): boolean {
  if (position === need) return true
  if (need === 'OT' && position === 'IOL') return true
  if (need === 'EDGE' && position === 'DL') return true
  if (need === 'CB' && position === 'S') return true
  return false
}
