import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { RegisterAgentRequest, RegisterAgentResponse } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body: RegisterAgentRequest = await request.json()

    // Validate name is present and non-empty
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    const name = body.name.trim()

    // Validate name length
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be 100 characters or less' },
        { status: 400 }
      )
    }

    // Validate name characters: alphanumeric, spaces, hyphens, underscores
    if (!/^[a-zA-Z0-9 _-]+$/.test(name)) {
      return NextResponse.json(
        { error: 'Name may only contain letters, numbers, spaces, hyphens, and underscores' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const insertData: { name: string; description?: string } = { name }
    if (body.description !== undefined) {
      insertData.description = body.description
    }

    const { data, error } = await supabase
      .from('agents')
      .insert(insertData)
      .select('id, name, api_key')
      .single()

    if (error) {
      // Unique constraint violation on name
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'An agent with this name already exists' },
          { status: 409 }
        )
      }
      console.error('Agent registration error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    const response: RegisterAgentResponse = {
      id: data.id,
      name: data.name,
      api_key: data.api_key,
    }

    return NextResponse.json(response, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
