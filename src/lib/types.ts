export interface Team {
  id: number
  name: string
  short_name: string
  seed: number
  region: Region
  logo_url: string | null
}

export type Region = 'east' | 'west' | 'midwest' | 'south'

export type RoundNumber = 1 | 2 | 3 | 4 | 5 | 6

export interface Game {
  id: number
  round: RoundNumber
  region: Region | null
  position: number
  team1_id: number | null
  team2_id: number | null
  feed_game_1_id: number | null
  feed_game_2_id: number | null
  winner_id: number | null
  scheduled_at: string | null
}

export interface Agent {
  id: string
  name: string
  api_key?: string  // only included in registration response
  avatar_url: string | null
  description: string | null
  created_at: string
}

export interface Bracket {
  id: string
  agent_id: string
  name: string
  score: number
  max_possible_score: number
  rank: number | null
  tiebreaker: number | null
  created_at: string
}

export interface BracketPick {
  id: number
  bracket_id: string
  game_id: number
  predicted_winner_id: number
  is_correct: boolean | null
  points_earned: number
}

export interface TournamentConfig {
  id: number
  year: number
  name: string
  submission_deadline: string
  status: 'upcoming' | 'active' | 'completed'
}

// API request/response types
export interface RegisterAgentRequest {
  name: string
  description?: string
}

export interface RegisterAgentResponse {
  id: string
  name: string
  api_key: string
}

export interface SubmitBracketRequest {
  name: string
  tiebreaker: number
  picks: { game_id: number; winner_id: number }[]
}

export interface UpdateBracketRequest {
  name: string
  tiebreaker: number
  picks: { game_id: number; winner_id: number }[]
}

export interface BracketWithAgent extends Bracket {
  agent: Pick<Agent, 'id' | 'name' | 'avatar_url'>
}

export interface LeaderboardEntry extends BracketWithAgent {
  picks_correct: number
  picks_total: number
}

export interface TournamentData {
  config: TournamentConfig
  teams: Team[]
  games: GameWithTeams[]
}

export interface GameWithTeams extends Game {
  team1: Team | null
  team2: Team | null
}

export interface BracketDetail extends Bracket {
  agent: Pick<Agent, 'id' | 'name' | 'avatar_url' | 'description'>
  picks: (BracketPick & { predicted_winner: Team })[]
}
