import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ── Types ────────────────────────────────────────────────────────────────────

type Region = 'east' | 'west' | 'midwest' | 'south'

interface TeamEntry {
  name: string
  short_name: string
}

interface TournamentData {
  year: number
  name: string
  submission_deadline: string
  regions: Record<Region, Record<string, TeamEntry>>
}

// ── Configuration ────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const REGIONS: Region[] = ['east', 'west', 'midwest', 'south']

// Standard NCAA bracket first-round matchups by position.
// Each entry is [higher_seed, lower_seed].
const R1_MATCHUPS: [number, number][] = [
  [1, 16], // position 1
  [8, 9],  // position 2
  [5, 12], // position 3
  [4, 13], // position 4
  [6, 11], // position 5
  [3, 14], // position 6
  [7, 10], // position 7
  [2, 15], // position 8
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadTournamentData(): TournamentData {
  const filePath = resolve(__dirname, '..', 'data', 'tournament-2026.json')
  const raw = readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as TournamentData
}

// ── Main seeding logic ───────────────────────────────────────────────────────

async function seed() {
  const data = loadTournamentData()

  console.log(`Seeding tournament: ${data.name}`)

  // ─── 1. Upsert tournament_config ──────────────────────────────────────────

  const { error: configError } = await supabase
    .from('tournament_config')
    .upsert(
      {
        year: data.year,
        name: data.name,
        submission_deadline: data.submission_deadline,
        status: 'upcoming',
      },
      { onConflict: 'year' }
    )

  if (configError) {
    console.error('Failed to upsert tournament_config:', configError)
    process.exit(1)
  }
  console.log('Tournament config upserted.')

  // ─── 2. Delete existing games and teams (for idempotency) ─────────────────
  // Games reference teams, so delete games first.

  const { error: deleteGamesError } = await supabase
    .from('games')
    .delete()
    .gte('id', 0) // matches all rows

  if (deleteGamesError) {
    console.error('Failed to delete existing games:', deleteGamesError)
    process.exit(1)
  }

  const { error: deleteTeamsError } = await supabase
    .from('teams')
    .delete()
    .gte('id', 0) // matches all rows

  if (deleteTeamsError) {
    console.error('Failed to delete existing teams:', deleteTeamsError)
    process.exit(1)
  }

  console.log('Cleared existing teams and games.')

  // ─── 3. Insert teams ─────────────────────────────────────────────────────

  // Build team rows for all regions.
  const teamRows: { name: string; short_name: string; seed: number; region: Region }[] = []

  for (const region of REGIONS) {
    const regionTeams = data.regions[region]
    for (const [seedStr, team] of Object.entries(regionTeams)) {
      teamRows.push({
        name: team.name,
        short_name: team.short_name,
        seed: parseInt(seedStr, 10),
        region,
      })
    }
  }

  const { data: insertedTeams, error: teamsError } = await supabase
    .from('teams')
    .insert(teamRows)
    .select('id, name, seed, region')

  if (teamsError || !insertedTeams) {
    console.error('Failed to insert teams:', teamsError)
    process.exit(1)
  }

  console.log(`Inserted ${insertedTeams.length} teams.`)

  // Build a lookup: region -> seed -> team id
  const teamLookup: Record<string, Record<number, number>> = {}
  for (const t of insertedTeams) {
    if (!teamLookup[t.region]) teamLookup[t.region] = {}
    teamLookup[t.region][t.seed] = t.id
  }

  // ─── 4. Generate games round by round ─────────────────────────────────────

  // Track inserted game IDs keyed by a composite key so later rounds can reference them.
  // Key format: `${round}-${region ?? 'final'}-${position}`
  const gameIdMap: Record<string, number> = {}

  let totalGames = 0

  // ── Round 1 (Round of 64): 8 games per region ─────────────────────────────

  for (const region of REGIONS) {
    const r1Rows = R1_MATCHUPS.map(([seed1, seed2], idx) => ({
      round: 1,
      region,
      position: idx + 1,
      team1_id: teamLookup[region][seed1],
      team2_id: teamLookup[region][seed2],
    }))

    const { data: r1Games, error: r1Error } = await supabase
      .from('games')
      .insert(r1Rows)
      .select('id, region, position')

    if (r1Error || !r1Games) {
      console.error(`Failed to insert R1 games for ${region}:`, r1Error)
      process.exit(1)
    }

    for (const g of r1Games) {
      gameIdMap[`1-${g.region}-${g.position}`] = g.id
    }
    totalGames += r1Games.length
  }

  console.log('Round 1 (R64) games inserted.')

  // ── Round 2 (Round of 32): 4 games per region ─────────────────────────────
  // R2 game at position P feeds from R1 positions (2*P - 1) and (2*P).

  for (const region of REGIONS) {
    const r2Rows = Array.from({ length: 4 }, (_, idx) => {
      const pos = idx + 1
      return {
        round: 2,
        region,
        position: pos,
        feed_game_1_id: gameIdMap[`1-${region}-${2 * pos - 1}`],
        feed_game_2_id: gameIdMap[`1-${region}-${2 * pos}`],
      }
    })

    const { data: r2Games, error: r2Error } = await supabase
      .from('games')
      .insert(r2Rows)
      .select('id, region, position')

    if (r2Error || !r2Games) {
      console.error(`Failed to insert R2 games for ${region}:`, r2Error)
      process.exit(1)
    }

    for (const g of r2Games) {
      gameIdMap[`2-${g.region}-${g.position}`] = g.id
    }
    totalGames += r2Games.length
  }

  console.log('Round 2 (R32) games inserted.')

  // ── Round 3 (Sweet 16): 2 games per region ────────────────────────────────

  for (const region of REGIONS) {
    const r3Rows = Array.from({ length: 2 }, (_, idx) => {
      const pos = idx + 1
      return {
        round: 3,
        region,
        position: pos,
        feed_game_1_id: gameIdMap[`2-${region}-${2 * pos - 1}`],
        feed_game_2_id: gameIdMap[`2-${region}-${2 * pos}`],
      }
    })

    const { data: r3Games, error: r3Error } = await supabase
      .from('games')
      .insert(r3Rows)
      .select('id, region, position')

    if (r3Error || !r3Games) {
      console.error(`Failed to insert R3 games for ${region}:`, r3Error)
      process.exit(1)
    }

    for (const g of r3Games) {
      gameIdMap[`3-${g.region}-${g.position}`] = g.id
    }
    totalGames += r3Games.length
  }

  console.log('Round 3 (S16) games inserted.')

  // ── Round 4 (Elite 8): 1 game per region ──────────────────────────────────

  for (const region of REGIONS) {
    const r4Rows = [
      {
        round: 4,
        region,
        position: 1,
        feed_game_1_id: gameIdMap[`3-${region}-1`],
        feed_game_2_id: gameIdMap[`3-${region}-2`],
      },
    ]

    const { data: r4Games, error: r4Error } = await supabase
      .from('games')
      .insert(r4Rows)
      .select('id, region, position')

    if (r4Error || !r4Games) {
      console.error(`Failed to insert R4 game for ${region}:`, r4Error)
      process.exit(1)
    }

    for (const g of r4Games) {
      gameIdMap[`4-${g.region}-${g.position}`] = g.id
    }
    totalGames += r4Games.length
  }

  console.log('Round 4 (E8) games inserted.')

  // ── Round 5 (Final Four): 2 games, region=NULL ────────────────────────────
  // Position 1: East winner vs West winner
  // Position 2: Midwest winner vs South winner

  const f4Rows = [
    {
      round: 5,
      region: null,
      position: 1,
      feed_game_1_id: gameIdMap['4-east-1'],
      feed_game_2_id: gameIdMap['4-west-1'],
    },
    {
      round: 5,
      region: null,
      position: 2,
      feed_game_1_id: gameIdMap['4-midwest-1'],
      feed_game_2_id: gameIdMap['4-south-1'],
    },
  ]

  const { data: f4Games, error: f4Error } = await supabase
    .from('games')
    .insert(f4Rows)
    .select('id, position')

  if (f4Error || !f4Games) {
    console.error('Failed to insert F4 games:', f4Error)
    process.exit(1)
  }

  for (const g of f4Games) {
    gameIdMap[`5-final-${g.position}`] = g.id
  }
  totalGames += f4Games.length

  console.log('Round 5 (F4) games inserted.')

  // ── Round 6 (Championship): 1 game, region=NULL ───────────────────────────

  const champRows = [
    {
      round: 6,
      region: null,
      position: 1,
      feed_game_1_id: gameIdMap['5-final-1'],
      feed_game_2_id: gameIdMap['5-final-2'],
    },
  ]

  const { data: champGames, error: champError } = await supabase
    .from('games')
    .insert(champRows)
    .select('id, position')

  if (champError || !champGames) {
    console.error('Failed to insert Championship game:', champError)
    process.exit(1)
  }

  totalGames += champGames.length

  console.log('Round 6 (Championship) game inserted.')

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log('\n--- Seeding Complete ---')
  console.log(`${insertedTeams.length} teams inserted`)
  console.log(`${totalGames} games created`)
  console.log('Tournament config set to "upcoming"')
}

seed().catch((err) => {
  console.error('Unexpected error during seeding:', err)
  process.exit(1)
})
