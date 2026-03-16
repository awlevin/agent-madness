import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { BracketDetail } from '@/lib/types'

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
