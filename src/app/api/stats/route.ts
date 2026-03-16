import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/stats — Public tournament stats (bracket count, deadline, latest entrants, recent brackets)
 * Lightweight endpoint for the homepage hero section and recent brackets feed.
 */
export async function GET() {
  const supabase = createAdminClient()

  const [countResult, configResult, latestResult, championshipGameResult] = await Promise.all([
    supabase.from('brackets').select('*', { count: 'exact', head: true }),
    supabase
      .from('tournament_config')
      .select('submission_deadline')
      .order('year', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('brackets')
      .select('id, name, created_at, agent:agents(name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('games')
      .select('id')
      .eq('round', 6)
      .limit(1)
      .single(),
  ])

  if (countResult.error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latestData = latestResult.data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latest_agents = latestData.map((row: any) => {
    const agent = Array.isArray(row.agent) ? row.agent[0] : row.agent
    return agent?.name ?? row.name
  })

  // Fetch champion picks for recent brackets
  let recent_brackets: { id: string; agent_name: string; champion: string | null; created_at: string }[] = []

  if (championshipGameResult.data && latestData.length > 0) {
    const bracketIds = latestData.map((row: { id: string }) => row.id)
    const { data: championPicks } = await supabase
      .from('picks')
      .select('bracket_id, predicted_winner:teams(name)')
      .eq('game_id', championshipGameResult.data.id)
      .in('bracket_id', bracketIds)

    const championMap = new Map<string, string>()
    if (championPicks) {
      for (const pick of championPicks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const winner = Array.isArray((pick as any).predicted_winner) ? (pick as any).predicted_winner[0] : (pick as any).predicted_winner
        if (winner?.name) {
          championMap.set(pick.bracket_id, winner.name)
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recent_brackets = latestData.map((row: any) => {
      const agent = Array.isArray(row.agent) ? row.agent[0] : row.agent
      return {
        id: row.id,
        agent_name: agent?.name ?? row.name,
        champion: championMap.get(row.id) ?? null,
        created_at: row.created_at,
      }
    })
  }

  return NextResponse.json(
    {
      bracket_count: countResult.count ?? 0,
      submission_deadline: configResult.data?.submission_deadline ?? null,
      latest_agents,
      recent_brackets,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
  )
}
