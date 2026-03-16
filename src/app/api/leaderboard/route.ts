import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LeaderboardEntry } from '@/lib/types'

const DEFAULT_LIMIT = 50

/**
 * GET /api/leaderboard — Fetch the live leaderboard (paginated)
 *
 * Query params:
 *   offset — number of entries to skip (default 0)
 *   limit  — max entries to return (default 50)
 *
 * Response: { entries: LeaderboardEntry[], total: number }
 * Cache-Control: no-cache (real-time data)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const offset = Math.max(0, Number(searchParams.get('offset') ?? 0))
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') ?? DEFAULT_LIMIT)))

  const supabase = await createClient()

  // Fetch paginated brackets with total count
  const { data: brackets, error: bracketsError, count } = await supabase
    .from('brackets')
    .select('*, agent:agents_public(id, name, avatar_url)', { count: 'exact' })
    .order('score', { ascending: false })
    .order('rank', { ascending: true })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (bracketsError) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }

  if (!brackets || brackets.length === 0) {
    return NextResponse.json(
      { entries: [] as LeaderboardEntry[], total: count ?? 0 },
      { status: 200, headers: { 'Cache-Control': 'no-cache' } }
    )
  }

  // Fetch pick counts for this page's brackets
  const bracketIds = brackets.map((b) => b.id)
  const { data: picks, error: picksError } = await supabase
    .from('picks')
    .select('bracket_id, is_correct')
    .in('bracket_id', bracketIds)

  if (picksError) {
    return NextResponse.json(
      { error: 'Failed to fetch picks' },
      { status: 500 }
    )
  }

  // Aggregate correct and total pick counts per bracket
  const pickCounts = new Map<string, { correct: number; total: number }>()

  if (picks) {
    for (const pick of picks) {
      const existing = pickCounts.get(pick.bracket_id) ?? {
        correct: 0,
        total: 0,
      }
      existing.total += 1
      if (pick.is_correct === true) existing.correct += 1
      pickCounts.set(pick.bracket_id, existing)
    }
  }

  // Fetch championship game (round 6) and champion picks
  const championMap = new Map<string, { name: string; short_name: string }>()

  const { data: championshipGame } = await supabase
    .from('games')
    .select('id')
    .eq('round', 6)
    .single()

  if (championshipGame) {
    const { data: championPicks } = await supabase
      .from('picks')
      .select('bracket_id, predicted_winner:teams!picks_predicted_winner_id_fkey(name, short_name)')
      .eq('game_id', championshipGame.id)
      .in('bracket_id', bracketIds)

    if (championPicks) {
      for (const pick of championPicks) {
        const winner = Array.isArray(pick.predicted_winner)
          ? pick.predicted_winner[0]
          : pick.predicted_winner
        if (winner) {
          championMap.set(pick.bracket_id, {
            name: winner.name,
            short_name: winner.short_name,
          })
        }
      }
    }
  }

  // Build response
  const entries: LeaderboardEntry[] = brackets.map((bracket) => {
    const counts = pickCounts.get(bracket.id) ?? { correct: 0, total: 0 }
    return {
      id: bracket.id,
      agent_id: bracket.agent_id,
      name: bracket.name,
      score: bracket.score,
      rank: bracket.rank,
      max_possible_score: bracket.max_possible_score,
      tiebreaker: bracket.tiebreaker,
      created_at: bracket.created_at,
      agent: Array.isArray(bracket.agent) ? bracket.agent[0] : bracket.agent,
      picks_correct: counts.correct,
      picks_total: counts.total,
      champion_pick: championMap.get(bracket.id) ?? null,
    }
  })

  return NextResponse.json(
    { entries, total: count ?? 0 },
    { status: 200, headers: { 'Cache-Control': 'no-cache' } }
  )
}
