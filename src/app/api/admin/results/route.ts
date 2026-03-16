import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordGameResult } from '@/lib/scoring'

/**
 * POST /api/admin/results
 * Enter a game result: sets the winner, scores picks, advances winner to next round.
 *
 * Body: { game_id: number, winner_id: number }
 */
export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { game_id?: number; winner_id?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { game_id, winner_id } = body
  if (typeof game_id !== 'number' || typeof winner_id !== 'number') {
    return NextResponse.json(
      { error: 'game_id and winner_id are required and must be numbers' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Validate the game exists and fetch it
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', game_id)
    .single()

  if (gameError || !game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  // Validate the game hasn't already been decided
  if (game.winner_id != null) {
    return NextResponse.json(
      { error: 'Game already has a result', existing_winner_id: game.winner_id },
      { status: 409 }
    )
  }

  // Validate the winner is one of the two teams in this game
  if (winner_id !== game.team1_id && winner_id !== game.team2_id) {
    return NextResponse.json(
      {
        error: 'winner_id must be one of the teams in this game',
        team1_id: game.team1_id,
        team2_id: game.team2_id,
      },
      { status: 400 }
    )
  }

  // Advance winner to the next round's game
  // Find the next-round game that this game feeds into
  const { data: nextGames, error: nextError } = await supabase
    .from('games')
    .select('*')
    .or(`feed_game_1_id.eq.${game_id},feed_game_2_id.eq.${game_id}`)

  if (nextError) {
    return NextResponse.json(
      { error: `Failed to find next round game: ${nextError.message}` },
      { status: 500 }
    )
  }

  // If there's a next game, slot the winner into the correct position
  if (nextGames && nextGames.length > 0) {
    const nextGame = nextGames[0]
    const updateField = nextGame.feed_game_1_id === game_id ? 'team1_id' : 'team2_id'

    const { error: advanceError } = await supabase
      .from('games')
      .update({ [updateField]: winner_id })
      .eq('id', nextGame.id)

    if (advanceError) {
      return NextResponse.json(
        { error: `Failed to advance winner: ${advanceError.message}` },
        { status: 500 }
      )
    }
  }

  // Record the result: score picks, recalculate totals/ranks/max possible
  try {
    const result = await recordGameResult(game_id, winner_id)
    return NextResponse.json({
      message: 'Result recorded successfully',
      game: result.game,
      updated_brackets: result.updated_brackets,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * GET /api/admin/results
 * Return all games with their results for the admin UI.
 */
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: games, error } = await supabase
    .from('games')
    .select('*, team1:teams!games_team1_id_fkey(*), team2:teams!games_team2_id_fkey(*)')
    .order('round', { ascending: true })
    .order('position', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ games })
}
