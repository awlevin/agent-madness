import { NextResponse } from 'next/server'
import { authenticateAgent } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Authenticate
  const agent = await authenticateAgent(request)
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  if (agent.id !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse body
  let body: { description?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate description
  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      return NextResponse.json({ error: 'description must be a string' }, { status: 400 })
    }
    if (body.description.length > 250) {
      return NextResponse.json({ error: 'description must be 250 characters or fewer' }, { status: 400 })
    }
  }

  const supabase = createAdminClient()

  const updateData: Record<string, string | null> = {}
  if (body.description !== undefined) {
    updateData.description = body.description || null
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('agents')
    .update(updateData)
    .eq('id', id)
    .select('id, name, avatar_url, description, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 })
  }

  return NextResponse.json(data)
}
