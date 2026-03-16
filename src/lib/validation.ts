import type { Game, Team } from './types'
import { TOTAL_GAMES } from './constants'

/**
 * Validates a complete set of bracket picks for tournament consistency.
 *
 * Rules:
 * - Exactly 63 picks, no duplicate game_ids
 * - Each game_id must reference a valid game; each winner_id must reference a valid team
 * - Round 1: winner must be one of the two teams assigned to the game (team1_id or team2_id)
 * - Round 2+: winner must be the predicted winner of one of the two feeder games
 *   (bracket consistency — you can only advance a team you already predicted to win)
 */
export function validateBracketPicks(
  picks: { game_id: number; winner_id: number }[],
  games: Game[],
  teams: Team[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // --- Count check ---
  if (picks.length !== TOTAL_GAMES) {
    errors.push(`Expected exactly ${TOTAL_GAMES} picks, got ${picks.length}`)
    return { valid: false, errors }
  }

  // --- Duplicate game_id check ---
  const gameIdSet = new Set<number>()
  for (const pick of picks) {
    if (gameIdSet.has(pick.game_id)) {
      errors.push(`Duplicate game_id: ${pick.game_id}`)
    }
    gameIdSet.add(pick.game_id)
  }
  if (errors.length > 0) {
    return { valid: false, errors }
  }

  // --- Build lookups ---
  const gameMap = new Map<number, Game>()
  for (const game of games) {
    gameMap.set(game.id, game)
  }

  const teamIdSet = new Set<number>()
  for (const team of teams) {
    teamIdSet.add(team.id)
  }

  // Map from game_id to predicted winner_id for bracket consistency checks
  const pickMap = new Map<number, number>()
  for (const pick of picks) {
    pickMap.set(pick.game_id, pick.winner_id)
  }

  // --- Validate each pick ---
  for (const pick of picks) {
    const game = gameMap.get(pick.game_id)
    if (!game) {
      errors.push(`Invalid game_id: ${pick.game_id}`)
      continue
    }

    if (!teamIdSet.has(pick.winner_id)) {
      errors.push(`Invalid winner_id: ${pick.winner_id} for game ${pick.game_id}`)
      continue
    }

    if (game.round === 1) {
      // Round 1: winner must be one of the two assigned teams
      if (pick.winner_id !== game.team1_id && pick.winner_id !== game.team2_id) {
        errors.push(
          `Game ${pick.game_id} (R1): winner ${pick.winner_id} is not team1 (${game.team1_id}) or team2 (${game.team2_id})`
        )
      }
    } else {
      // Round 2+: winner must be the predicted winner of one of the two feeder games
      const feeder1Winner = game.feed_game_1_id != null ? pickMap.get(game.feed_game_1_id) : undefined
      const feeder2Winner = game.feed_game_2_id != null ? pickMap.get(game.feed_game_2_id) : undefined

      if (pick.winner_id !== feeder1Winner && pick.winner_id !== feeder2Winner) {
        errors.push(
          `Game ${pick.game_id} (R${game.round}): winner ${pick.winner_id} was not predicted to win either feeder game (${game.feed_game_1_id} -> ${feeder1Winner}, ${game.feed_game_2_id} -> ${feeder2Winner})`
        )
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
