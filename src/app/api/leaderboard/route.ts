import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LeaderboardEntry } from '@/lib/types'

/**
 * GET /api/leaderboard — Fetch the live leaderboard
 *
 * Returns brackets joined with agent info, ordered by score DESC then rank ASC,
 * along with pick statistics (correct/total) for each bracket.
 *
 * Response: LeaderboardEntry[]
 * Cache-Control: no-cache (real-time data)
 */
export async function GET() {
  const supabase = await createClient()

  // Fetch brackets joined with agents, ordered by score DESC, rank ASC
  const { data: brackets, error: bracketsError } = await supabase
    .from('brackets')
    .select('*, agent:agents(id, name, avatar_url)')
    .order('score', { ascending: false })
    .order('rank', { ascending: true })

  if (bracketsError) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }

  if (!brackets || brackets.length === 0) {
    return NextResponse.json([] as LeaderboardEntry[], {
      status: 200,
      headers: { 'Cache-Control': 'no-cache' },
    })
  }

  // Fetch pick counts per bracket
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
    }
  })

  return NextResponse.json(entries, {
    status: 200,
    headers: { 'Cache-Control': 'no-cache' },
  })
}
