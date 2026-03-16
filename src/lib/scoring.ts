import { createAdminClient } from './supabase/admin'
import { ROUND_POINTS } from './constants'
import type { Game, RoundNumber } from './types'

interface RecordGameResultResponse {
  updated_brackets: number
  game: Game
}

/**
 * Records a game result: sets the winner, scores all picks for this game,
 * recalculates total scores, ranks, and max possible scores for all brackets.
 */
export async function recordGameResult(
  gameId: number,
  winnerId: number
): Promise<RecordGameResultResponse> {
  const supabase = createAdminClient()

  // 1. Update the game's winner_id
  const { data: game, error: gameError } = await supabase
    .from('games')
    .update({ winner_id: winnerId })
    .eq('id', gameId)
    .select('*')
    .single()

  if (gameError || !game) {
    throw new Error(`Failed to update game: ${gameError?.message ?? 'game not found'}`)
  }

  const roundPoints = ROUND_POINTS[game.round as RoundNumber]

  // 2. Score all picks for this game — mark correct/incorrect and assign points
  // Mark correct picks
  const { error: correctError } = await supabase
    .from('picks')
    .update({ is_correct: true, points_earned: roundPoints })
    .eq('game_id', gameId)
    .eq('predicted_winner_id', winnerId)

  if (correctError) {
    throw new Error(`Failed to score correct picks: ${correctError.message}`)
  }

  // Mark incorrect picks
  const { error: incorrectError } = await supabase
    .from('picks')
    .update({ is_correct: false, points_earned: 0 })
    .eq('game_id', gameId)
    .neq('predicted_winner_id', winnerId)

  if (incorrectError) {
    throw new Error(`Failed to score incorrect picks: ${incorrectError.message}`)
  }

  // 3. Recalculate total scores for all brackets
  const { data: allBrackets, error: bracketsError } = await supabase
    .from('brackets')
    .select('id')

  if (bracketsError || !allBrackets) {
    throw new Error(`Failed to fetch brackets: ${bracketsError?.message}`)
  }

  for (const bracket of allBrackets) {
    // Sum up points_earned for all scored picks in this bracket
    const { data: picks, error: picksError } = await supabase
      .from('picks')
      .select('points_earned')
      .eq('bracket_id', bracket.id)
      .not('is_correct', 'is', null)

    if (picksError) {
      throw new Error(`Failed to fetch picks for bracket ${bracket.id}: ${picksError.message}`)
    }

    const totalScore = (picks ?? []).reduce((sum, p) => sum + p.points_earned, 0)

    const { error: updateError } = await supabase
      .from('brackets')
      .update({ score: totalScore })
      .eq('id', bracket.id)

    if (updateError) {
      throw new Error(`Failed to update bracket score: ${updateError.message}`)
    }
  }

  // 4. Recalculate max_possible_score for all brackets
  await recalculateMaxPossibleScores(supabase)

  // 5. Recalculate ranks for ALL brackets (sorted by score DESC, tiebreaker ASC)
  const { data: rankedBrackets, error: rankError } = await supabase
    .from('brackets')
    .select('id, score, tiebreaker')
    .order('score', { ascending: false })
    .order('tiebreaker', { ascending: true })

  if (rankError || !rankedBrackets) {
    throw new Error(`Failed to fetch brackets for ranking: ${rankError?.message}`)
  }

  for (let i = 0; i < rankedBrackets.length; i++) {
    const rank = i + 1
    const { error: rankUpdateError } = await supabase
      .from('brackets')
      .update({ rank })
      .eq('id', rankedBrackets[i].id)

    if (rankUpdateError) {
      throw new Error(`Failed to update bracket rank: ${rankUpdateError.message}`)
    }
  }

  return {
    updated_brackets: allBrackets.length,
    game: game as Game,
  }
}

interface RecalculateAllResponse {
  games_rescored: number
  brackets_updated: number
}

/**
 * Re-scores all picks for every decided game and recalculates
 * total scores, max_possible_score, and ranks for all brackets.
 */
export async function recalculateAllScores(): Promise<RecalculateAllResponse> {
  const supabase = createAdminClient()

  // 1. Fetch all decided games
  const { data: decidedGames, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .not('winner_id', 'is', null)

  if (gamesError) {
    throw new Error(`Failed to fetch decided games: ${gamesError.message}`)
  }

  // 2. Re-score all picks for each decided game
  for (const game of decidedGames ?? []) {
    const roundPoints = ROUND_POINTS[game.round as RoundNumber]

    // Mark correct picks
    const { error: correctError } = await supabase
      .from('picks')
      .update({ is_correct: true, points_earned: roundPoints })
      .eq('game_id', game.id)
      .eq('predicted_winner_id', game.winner_id)

    if (correctError) {
      throw new Error(`Failed to score correct picks for game ${game.id}: ${correctError.message}`)
    }

    // Mark incorrect picks
    const { error: incorrectError } = await supabase
      .from('picks')
      .update({ is_correct: false, points_earned: 0 })
      .eq('game_id', game.id)
      .neq('predicted_winner_id', game.winner_id)

    if (incorrectError) {
      throw new Error(`Failed to score incorrect picks for game ${game.id}: ${incorrectError.message}`)
    }
  }

  // 3. Reset picks for undecided games (in case a result was reverted)
  const { data: undecidedGames, error: undecidedError } = await supabase
    .from('games')
    .select('id')
    .is('winner_id', null)

  if (undecidedError) {
    throw new Error(`Failed to fetch undecided games: ${undecidedError.message}`)
  }

  for (const game of undecidedGames ?? []) {
    const { error: resetError } = await supabase
      .from('picks')
      .update({ is_correct: null, points_earned: 0 })
      .eq('game_id', game.id)

    if (resetError) {
      throw new Error(`Failed to reset picks for game ${game.id}: ${resetError.message}`)
    }
  }

  // 4. Recalculate total scores for all brackets
  const { data: allBrackets, error: bracketsError } = await supabase
    .from('brackets')
    .select('id')

  if (bracketsError || !allBrackets) {
    throw new Error(`Failed to fetch brackets: ${bracketsError?.message}`)
  }

  for (const bracket of allBrackets) {
    const { data: picks, error: picksError } = await supabase
      .from('picks')
      .select('points_earned')
      .eq('bracket_id', bracket.id)
      .not('is_correct', 'is', null)

    if (picksError) {
      throw new Error(`Failed to fetch picks for bracket ${bracket.id}: ${picksError.message}`)
    }

    const totalScore = (picks ?? []).reduce((sum, p) => sum + p.points_earned, 0)

    const { error: updateError } = await supabase
      .from('brackets')
      .update({ score: totalScore })
      .eq('id', bracket.id)

    if (updateError) {
      throw new Error(`Failed to update bracket score: ${updateError.message}`)
    }
  }

  // 5. Recalculate max_possible_score
  await recalculateMaxPossibleScores(supabase)

  // 6. Recalculate ranks
  const { data: rankedBrackets, error: rankError } = await supabase
    .from('brackets')
    .select('id, score, tiebreaker')
    .order('score', { ascending: false })
    .order('tiebreaker', { ascending: true })

  if (rankError || !rankedBrackets) {
    throw new Error(`Failed to fetch brackets for ranking: ${rankError?.message}`)
  }

  for (let i = 0; i < rankedBrackets.length; i++) {
    const rank = i + 1
    const { error: rankUpdateError } = await supabase
      .from('brackets')
      .update({ rank })
      .eq('id', rankedBrackets[i].id)

    if (rankUpdateError) {
      throw new Error(`Failed to update bracket rank: ${rankUpdateError.message}`)
    }
  }

  return {
    games_rescored: (decidedGames ?? []).length,
    brackets_updated: allBrackets.length,
  }
}

/**
 * Recalculates max_possible_score for every bracket.
 *
 * For each bracket:
 * - Points already earned from correct picks are kept
 * - For each unresolved game, check if the bracket's predicted winner
 *   is still alive (not eliminated). If alive, add those potential points.
 * - A team is "eliminated" if it lost a game (i.e., appeared in a game
 *   that has a winner, and the winner was not that team).
 */
async function recalculateMaxPossibleScores(
  supabase: ReturnType<typeof createAdminClient>
): Promise<void> {
  // Fetch all games to determine eliminated teams
  const { data: allGames, error: gamesError } = await supabase
    .from('games')
    .select('*')

  if (gamesError || !allGames) {
    throw new Error(`Failed to fetch games: ${gamesError?.message}`)
  }

  // Build the set of eliminated teams: teams that lost in a decided game
  const eliminatedTeams = new Set<number>()
  for (const g of allGames) {
    if (g.winner_id != null) {
      if (g.team1_id != null && g.team1_id !== g.winner_id) {
        eliminatedTeams.add(g.team1_id)
      }
      if (g.team2_id != null && g.team2_id !== g.winner_id) {
        eliminatedTeams.add(g.team2_id)
      }
    }
  }

  // Fetch all brackets with their picks
  const { data: brackets, error: bracketsError } = await supabase
    .from('brackets')
    .select('id')

  if (bracketsError || !brackets) {
    throw new Error(`Failed to fetch brackets for max score: ${bracketsError?.message}`)
  }

  for (const bracket of brackets) {
    const { data: picks, error: picksError } = await supabase
      .from('picks')
      .select('game_id, predicted_winner_id, is_correct, points_earned')
      .eq('bracket_id', bracket.id)

    if (picksError) {
      throw new Error(`Failed to fetch picks for max score: ${picksError.message}`)
    }

    let maxPossible = 0
    for (const pick of picks ?? []) {
      if (pick.is_correct === true) {
        // Already earned these points
        maxPossible += pick.points_earned
      } else if (pick.is_correct === null) {
        // Game not yet decided — check if predicted winner is still alive
        if (!eliminatedTeams.has(pick.predicted_winner_id)) {
          // Find the game to determine the round's point value
          const g = allGames.find((game) => game.id === pick.game_id)
          if (g) {
            maxPossible += ROUND_POINTS[g.round as RoundNumber]
          }
        }
      }
      // is_correct === false: 0 points, team was wrong
    }

    const { error: updateError } = await supabase
      .from('brackets')
      .update({ max_possible_score: maxPossible })
      .eq('id', bracket.id)

    if (updateError) {
      throw new Error(`Failed to update max_possible_score: ${updateError.message}`)
    }
  }
}
