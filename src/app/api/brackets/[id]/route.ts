import { NextResponse } from 'next/server'
import { authenticateAgent } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateBracketPicks } from '@/lib/validation'
import { ROUND_POINTS } from '@/lib/constants'
import type { BracketDetail, UpdateBracketRequest, Game, RoundNumber } from '@/lib/types'

/**
 * GET /api/brackets/[id] — Get bracket detail
 *
 * Returns the bracket with its agent info and all picks (each joined with
 * the predicted_winner team). Returns 404 if the bracket does not exist.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = createAdminClient()

  // Fetch bracket with agent info
  const { data: bracket, error: bracketError } = await supabase
    .from('brackets')
    .select('*, agent:agents(id, name, avatar_url, description)')
    .eq('id', id)
    .single()

  if (bracketError || !bracket) {
    return NextResponse.json({ error: 'Bracket not found' }, { status: 404 })
  }

  // Fetch picks with predicted_winner team info
  const { data: picks, error: picksError } = await supabase
    .from('picks')
    .select('*, predicted_winner:teams!predicted_winner_id(id, name, short_name, seed, region, logo_url)')
    .eq('bracket_id', id)

  if (picksError) {
    return NextResponse.json({ error: 'Failed to fetch picks' }, { status: 500 })
  }

  const detail: BracketDetail = {
    id: bracket.id,
    agent_id: bracket.agent_id,
    name: bracket.name,
    score: bracket.score,
    max_possible_score: bracket.max_possible_score,
    rank: bracket.rank,
    tiebreaker: bracket.tiebreaker,
    created_at: bracket.created_at,
    agent: bracket.agent,
    picks: (picks ?? []).map((p) => ({
      id: p.id,
      bracket_id: p.bracket_id,
      game_id: p.game_id,
      predicted_winner_id: p.predicted_winner_id,
      is_correct: p.is_correct,
      points_earned: p.points_earned,
      predicted_winner: p.predicted_winner,
    })),
  }

  return NextResponse.json(detail)
}

/**
 * PUT /api/brackets/[id] — Edit/replace a bracket's picks
 *
 * Requires agent authentication via Bearer token.
 * Agent must own the bracket and the submission deadline must not have passed.
 * Body: UpdateBracketRequest { name, tiebreaker, picks[] }
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Authenticate
  const agent = await authenticateAgent(request)
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch bracket and verify it exists
  const { data: bracket, error: bracketError } = await supabase
    .from('brackets')
    .select('*')
    .eq('id', id)
    .single()

  if (bracketError || !bracket) {
    return NextResponse.json({ error: 'Bracket not found' }, { status: 404 })
  }

  // Verify ownership
  if (bracket.agent_id !== agent.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Check submission deadline
  const { data: config, error: configError } = await supabase
    .from('tournament_config')
    .select('*')
    .order('year', { ascending: false })
    .limit(1)
    .single()

  if (configError || !config) {
    return NextResponse.json({ error: 'Tournament not configured' }, { status: 500 })
  }

  const deadline = new Date(config.submission_deadline)
  if (new Date() > deadline) {
    return NextResponse.json(
      { error: 'Brackets are locked — the tournament has started' },
      { status: 403 }
    )
  }

  // Parse body
  let body: UpdateBracketRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (body.tiebreaker == null || typeof body.tiebreaker !== 'number') {
    return NextResponse.json({ error: 'tiebreaker is required and must be a number' }, { status: 400 })
  }
  if (!Array.isArray(body.picks)) {
    return NextResponse.json({ error: 'picks must be an array' }, { status: 400 })
  }

  // Fetch games and teams for validation
  const [gamesResult, teamsResult] = await Promise.all([
    supabase.from('games').select('*'),
    supabase.from('teams').select('*'),
  ])

  if (gamesResult.error || !gamesResult.data) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
  if (teamsResult.error || !teamsResult.data) {
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }

  const games = gamesResult.data as Game[]
  const teams = teamsResult.data

  // Validate picks
  const validation = validateBracketPicks(body.picks, games, teams)
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Invalid picks', details: validation.errors },
      { status: 400 }
    )
  }

  // Delete existing picks
  const { error: deletePicksError } = await supabase
    .from('picks')
    .delete()
    .eq('bracket_id', id)

  if (deletePicksError) {
    return NextResponse.json(
      { error: 'Failed to delete existing picks', details: deletePicksError.message },
      { status: 500 }
    )
  }

  // Insert new picks
  const pickRows = body.picks.map((p) => ({
    bracket_id: id,
    game_id: p.game_id,
    predicted_winner_id: p.winner_id,
  }))

  const { error: picksError } = await supabase.from('picks').insert(pickRows)

  if (picksError) {
    return NextResponse.json(
      { error: 'Failed to insert picks', details: picksError.message },
      { status: 500 }
    )
  }

  // Update bracket name and tiebreaker
  const { error: updateError } = await supabase
    .from('brackets')
    .update({ name: body.name, tiebreaker: body.tiebreaker })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to update bracket', details: updateError.message },
      { status: 500 }
    )
  }

  // Re-score against decided games
  const decidedGames = games.filter((g) => g.winner_id != null)
  let totalScore = 0

  const gameRoundMap = new Map<number, RoundNumber>()
  for (const game of games) {
    gameRoundMap.set(game.id, game.round as RoundNumber)
  }

  if (decidedGames.length > 0) {
    const decidedMap = new Map<number, number>()
    for (const game of decidedGames) {
      decidedMap.set(game.id, game.winner_id!)
    }

    for (const pick of body.picks) {
      const actualWinner = decidedMap.get(pick.game_id)
      if (actualWinner == null) continue

      const round = gameRoundMap.get(pick.game_id)
      const isCorrect = pick.winner_id === actualWinner
      const pointsEarned = isCorrect && round ? ROUND_POINTS[round] : 0
      totalScore += pointsEarned

      await supabase
        .from('picks')
        .update({ is_correct: isCorrect, points_earned: pointsEarned })
        .eq('bracket_id', id)
        .eq('game_id', pick.game_id)
    }

    // Calculate max possible score
    let maxPossible = totalScore
    for (const pick of body.picks) {
      if (!decidedMap.has(pick.game_id)) {
        const round = gameRoundMap.get(pick.game_id)
        if (round) maxPossible += ROUND_POINTS[round]
      }
    }

    const { data: updatedBracket } = await supabase
      .from('brackets')
      .update({ score: totalScore, max_possible_score: maxPossible })
      .eq('id', id)
      .select('*')
      .single()

    if (updatedBracket) {
      return NextResponse.json(updatedBracket, { status: 200 })
    }
  } else {
    // No decided games — max possible is sum of all round points for all picks
    let maxPossible = 0
    for (const pick of body.picks) {
      const round = gameRoundMap.get(pick.game_id)
      if (round) maxPossible += ROUND_POINTS[round]
    }

    const { data: updatedBracket } = await supabase
      .from('brackets')
      .update({ score: 0, max_possible_score: maxPossible })
      .eq('id', id)
      .select('*')
      .single()

    if (updatedBracket) {
      return NextResponse.json(updatedBracket, { status: 200 })
    }
  }

  // Fallback: return the bracket as-is
  const { data: finalBracket } = await supabase
    .from('brackets')
    .select('*')
    .eq('id', id)
    .single()

  return NextResponse.json(finalBracket, { status: 200 })
}

/**
 * DELETE /api/brackets/[id] — Delete a bracket
 *
 * Requires agent authentication via Bearer token.
 * Agent must own the bracket and the submission deadline must not have passed.
 * Picks are cascade-deleted via ON DELETE CASCADE.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Authenticate
  const agent = await authenticateAgent(request)
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch bracket and verify it exists
  const { data: bracket, error: bracketError } = await supabase
    .from('brackets')
    .select('*')
    .eq('id', id)
    .single()

  if (bracketError || !bracket) {
    return NextResponse.json({ error: 'Bracket not found' }, { status: 404 })
  }

  // Verify ownership
  if (bracket.agent_id !== agent.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Check submission deadline
  const { data: config, error: configError } = await supabase
    .from('tournament_config')
    .select('*')
    .order('year', { ascending: false })
    .limit(1)
    .single()

  if (configError || !config) {
    return NextResponse.json({ error: 'Tournament not configured' }, { status: 500 })
  }

  const deadline = new Date(config.submission_deadline)
  if (new Date() > deadline) {
    return NextResponse.json(
      { error: 'Brackets are locked — the tournament has started' },
      { status: 403 }
    )
  }

  // Delete the bracket (picks cascade via ON DELETE CASCADE)
  const { error: deleteError } = await supabase
    .from('brackets')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json(
      { error: 'Failed to delete bracket', details: deleteError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ message: 'Bracket deleted' }, { status: 200 })
}
