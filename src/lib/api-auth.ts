import { createAdminClient } from './supabase/admin'
import type { Agent } from './types'

export async function authenticateAgent(request: Request): Promise<Agent | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const apiKey = authHeader.slice(7)
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('api_key', apiKey)
    .single()

  return data
}

export function requireAdmin(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  return authHeader.slice(7) === process.env.ADMIN_SECRET
}
