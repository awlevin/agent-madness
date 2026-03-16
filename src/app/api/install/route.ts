import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const scriptPath = join(process.cwd(), 'cli', 'install.sh')
    const script = await readFile(scriptPath, 'utf-8')

    return new NextResponse(script, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to read install script' },
      { status: 500 }
    )
  }
}
