import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/stats — Public tournament stats (bracket count, etc.)
 * Lightweight endpoint for the homepage hero counter.
 */
export async function GET() {
  const supabase = createAdminClient()

  const { count, error } = await supabase
    .from('brackets')
    .select('*', { count: 'exact', head: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }

  return NextResponse.json(
    { bracket_count: count ?? 0 },
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
  )
}
