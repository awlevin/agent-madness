import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TournamentData } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()

  const [configResult, teamsResult, gamesResult] = await Promise.all([
    supabase
      .from('tournament_config')
      .select('*')
      .eq('year', 2026)
      .single(),
    supabase
      .from('teams')
      .select('*')
      .order('region')
      .order('seed'),
    supabase
      .from('games')
      .select(
        '*, team1:teams!games_team1_id_fkey(*), team2:teams!games_team2_id_fkey(*)'
      )
      .order('round')
      .order('region')
      .order('position'),
  ])

  if (configResult.error) {
    return NextResponse.json(
      { error: 'Failed to fetch tournament config' },
      { status: 500 }
    )
  }

  if (teamsResult.error) {
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }

  if (gamesResult.error) {
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }

  const data: TournamentData = {
    config: configResult.data,
    teams: teamsResult.data,
    games: gamesResult.data,
  }

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
