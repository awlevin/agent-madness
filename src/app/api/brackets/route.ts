import { NextResponse } from 'next/server'
import { authenticateAgent } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateBracketPicks } from '@/lib/validation'
import { ROUND_POINTS } from '@/lib/constants'
import type { SubmitBracketRequest, BracketWithAgent, Game, Team, RoundNumber } from '@/lib/types'

/**
 * POST /api/brackets — Submit a new bracket
 *
 * Requires agent authentication via Bearer token.
 * Body: SubmitBracketRequest { name, tiebreaker, picks[] }
 */
export async function POST(request: Request) {
  // Authenticate
  const agent = await authenticateAgent(request)
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: SubmitBracketRequest
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
  if (body.description != null && (typeof body.description !== 'string' || body.description.length > 500)) {
    return NextResponse.json({ error: 'description must be a string of 500 characters or fewer' }, { status: 400 })
  }

  const supabase = createAdminClient()

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
      { error: 'Submission deadline has passed' },
      { status: 400 }
    )
  }

  // Check bracket limit (max 3 per agent)
  const { count: bracketCount } = await supabase
    .from('brackets')
    .select('id', { count: 'exact', head: true })
    .eq('agent_id', agent.id)

  if (bracketCount != null && bracketCount >= 3) {
    return NextResponse.json(
      { error: 'Agent already has the maximum of 3 brackets' },
      { status: 409 }
    )
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
  const teams = teamsResult.data as Team[]

  // Validate picks
  const validation = validateBracketPicks(body.picks, games, teams)
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Invalid picks', details: validation.errors },
      { status: 400 }
    )
  }

  // Insert bracket
  const { data: bracket, error: bracketError } = await supabase
    .from('brackets')
    .insert({
      agent_id: agent.id,
      name: body.name,
      tiebreaker: body.tiebreaker,
      description: body.description ?? null,
    })
    .select('*')
    .single()

  if (bracketError || !bracket) {
    return NextResponse.json(
      { error: 'Failed to create bracket', details: bracketError?.message },
      { status: 500 }
    )
  }

  // Insert all 63 picks
  const pickRows = body.picks.map((p) => ({
    bracket_id: bracket.id,
    game_id: p.game_id,
    predicted_winner_id: p.winner_id,
  }))

  const { error: picksError } = await supabase.from('picks').insert(pickRows)

  if (picksError) {
    // Attempt cleanup of the bracket on failure
    await supabase.from('brackets').delete().eq('id', bracket.id)
    return NextResponse.json(
      { error: 'Failed to insert picks', details: picksError.message },
      { status: 500 }
    )
  }

  // Score picks against games that already have results
  const decidedGames = games.filter((g) => g.winner_id != null)
  if (decidedGames.length > 0) {
    const gameRoundMap = new Map<number, RoundNumber>()
    for (const game of games) {
      gameRoundMap.set(game.id, game.round as RoundNumber)
    }

    // Build a map of game_id -> winner_id for decided games
    const decidedMap = new Map<number, number>()
    for (const game of decidedGames) {
      decidedMap.set(game.id, game.winner_id!)
    }

    // Score each pick that corresponds to a decided game
    let totalScore = 0
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
        .eq('bracket_id', bracket.id)
        .eq('game_id', pick.game_id)
    }

    // Update bracket score and max_possible_score
    // max_possible_score = current earned + potential from undecided games
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
      .eq('id', bracket.id)
      .select('*')
      .single()

    if (updatedBracket) {
      return NextResponse.json(updatedBracket, { status: 201 })
    }
  }

  return NextResponse.json(bracket, { status: 201 })
}

/**
 * GET /api/brackets — List all brackets
 *
 * Optional query parameter: ?agent_id=UUID to filter by agent.
 * Returns BracketWithAgent[] ordered by score DESC.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('agent_id')

  const supabase = createAdminClient()

  let query = supabase
    .from('brackets')
    .select('*, agent:agents(id, name, avatar_url)')
    .order('score', { ascending: false })

  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch brackets' }, { status: 500 })
  }

  const brackets: BracketWithAgent[] = (data ?? []).map((row) => ({
    id: row.id,
    agent_id: row.agent_id,
    name: row.name,
    score: row.score,
    max_possible_score: row.max_possible_score,
    rank: row.rank,
    tiebreaker: row.tiebreaker,
    description: row.description ?? null,
    created_at: row.created_at,
    agent: Array.isArray(row.agent) ? row.agent[0] : row.agent,
  }))

  return NextResponse.json(brackets)
}
