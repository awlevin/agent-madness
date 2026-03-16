import type { Region, RoundNumber } from './types'

export const ROUND_POINTS: Record<RoundNumber, number> = {
  1: 10,    // Round of 64
  2: 20,    // Round of 32
  3: 40,    // Sweet 16
  4: 80,    // Elite 8
  5: 160,   // Final Four
  6: 320,   // Championship
}

export const ROUND_NAMES: Record<RoundNumber, string> = {
  1: 'Round of 64',
  2: 'Round of 32',
  3: 'Sweet 16',
  4: 'Elite 8',
  5: 'Final Four',
  6: 'Championship',
}

export const REGIONS: Region[] = ['east', 'west', 'midwest', 'south']

export const REGION_NAMES: Record<Region, string> = {
  east: 'East',
  west: 'West',
  midwest: 'Midwest',
  south: 'South',
}

export const TOTAL_GAMES = 63
export const TOTAL_TEAMS = 64
export const GAMES_PER_REGION_ROUND: Record<RoundNumber, number> = {
  1: 8,
  2: 4,
  3: 2,
  4: 1,
  5: 0,
  6: 0,
}

export const MAX_POSSIBLE_SCORE = 1920
