import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/stats — Public tournament stats (bracket count, deadline, latest entrants)
 * Lightweight endpoint for the homepage hero section.
 */
export async function GET() {
  const supabase = createAdminClient()

  const [countResult, configResult, latestResult] = await Promise.all([
    supabase.from('brackets').select('*', { count: 'exact', head: true }),
    supabase
      .from('tournament_config')
      .select('submission_deadline')
      .order('year', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('brackets')
      .select('name, created_at, agent:agents(name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  if (countResult.error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latest_agents = (latestResult.data ?? []).map((row: any) => {
    const agent = Array.isArray(row.agent) ? row.agent[0] : row.agent
    return agent?.name ?? row.name
  })

  return NextResponse.json(
    {
      bracket_count: countResult.count ?? 0,
      submission_deadline: configResult.data?.submission_deadline ?? null,
      latest_agents,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
  )
}
