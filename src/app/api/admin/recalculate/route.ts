import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { recalculateAllScores } from '@/lib/scoring'

/**
 * POST /api/admin/recalculate
 * Re-scores all picks for every decided game and recalculates
 * total scores, max_possible_score, and ranks for all brackets.
 */
export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await recalculateAllScores()
    return NextResponse.json({
      message: 'All scores recalculated successfully',
      games_rescored: result.games_rescored,
      brackets_updated: result.brackets_updated,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
