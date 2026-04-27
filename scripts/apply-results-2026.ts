import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { recalculateAllScores } from '../src/lib/scoring'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

type Region = 'east' | 'west' | 'midwest' | 'south'
type RoundNumber = 1 | 2 | 3 | 4 | 5 | 6

interface FieldCorrection {
  region: Region
  seed: number
  from_short_name: string
  to: {
    name: string
    short_name: string
  }
}

interface FinalFourFeeder {
  region: Region
  round: 4
  position: 1
}

interface FinalFourFeedOrder {
  position: 1 | 2
  feeders: [FinalFourFeeder, FinalFourFeeder]
}

interface ResultEntry {
  round: RoundNumber
  region: Region | null
  position: number
  winner_short_name: string
}

interface ResultsData {
  year: 2026
  sources: { label: string; url: string }[]
  field_corrections: FieldCorrection[]
  final_four_feed_order: FinalFourFeedOrder[]
  results: ResultEntry[]
}

interface TeamRow {
  id: number
  name: string
  short_name: string
  seed: number
  region: Region
}

interface GameRow {
  id: number
  round: RoundNumber
  region: Region | null
  position: number
  team1_id: number | null
  team2_id: number | null
  feed_game_1_id: number | null
  feed_game_2_id: number | null
  winner_id: number | null
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function fail(message: string): never {
  throw new Error(message)
}

function gameKey(round: number, region: string | null, position: number): string {
  return `${round}-${region ?? 'final'}-${position}`
}

function isRegion(value: unknown): value is Region {
  return value === 'east' || value === 'west' || value === 'midwest' || value === 'south'
}

function isRound(value: unknown): value is RoundNumber {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6
}

function asObject(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(`${context} must be an object.`)
  }
  return value as Record<string, unknown>
}

function asString(value: unknown, context: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    fail(`${context} must be a non-empty string.`)
  }
  return value
}

function asPositiveInteger(value: unknown, context: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    fail(`${context} must be a positive integer.`)
  }
  return value
}

function parseFieldCorrection(value: unknown, index: number): FieldCorrection {
  const item = asObject(value, `field_corrections[${index}]`)
  const to = asObject(item.to, `field_corrections[${index}].to`)
  const region = item.region

  if (!isRegion(region)) {
    fail(`field_corrections[${index}].region must be a valid region.`)
  }

  return {
    region,
    seed: asPositiveInteger(item.seed, `field_corrections[${index}].seed`),
    from_short_name: asString(item.from_short_name, `field_corrections[${index}].from_short_name`),
    to: {
      name: asString(to.name, `field_corrections[${index}].to.name`),
      short_name: asString(to.short_name, `field_corrections[${index}].to.short_name`),
    },
  }
}

function parseFinalFourFeedOrder(value: unknown, index: number): FinalFourFeedOrder {
  const item = asObject(value, `final_four_feed_order[${index}]`)
  const position = item.position

  if (position !== 1 && position !== 2) {
    fail(`final_four_feed_order[${index}].position must be 1 or 2.`)
  }
  if (!Array.isArray(item.feeders) || item.feeders.length !== 2) {
    fail(`final_four_feed_order[${index}].feeders must contain exactly two feeders.`)
  }

  const feeders = item.feeders.map((feeder, feederIndex) => {
    const feederObject = asObject(
      feeder,
      `final_four_feed_order[${index}].feeders[${feederIndex}]`
    )
    const region = feederObject.region

    if (!isRegion(region)) {
      fail(`final_four_feed_order[${index}].feeders[${feederIndex}].region must be valid.`)
    }
    if (feederObject.round !== 4 || feederObject.position !== 1) {
      fail(`final_four_feed_order[${index}].feeders[${feederIndex}] must point to round 4 position 1.`)
    }

    return { region, round: 4, position: 1 } satisfies FinalFourFeeder
  })

  return {
    position,
    feeders: [feeders[0], feeders[1]],
  }
}

function parseResult(value: unknown, index: number): ResultEntry {
  const item = asObject(value, `results[${index}]`)
  const round = item.round
  const region = item.region

  if (!isRound(round)) {
    fail(`results[${index}].round must be an integer from 1 to 6.`)
  }
  let parsedRegion: Region | null
  if (region === null) {
    parsedRegion = null
  } else if (isRegion(region)) {
    parsedRegion = region
  } else {
    fail(`results[${index}].region must be a valid region or null.`)
  }

  return {
    round,
    region: parsedRegion,
    position: asPositiveInteger(item.position, `results[${index}].position`),
    winner_short_name: asString(item.winner_short_name, `results[${index}].winner_short_name`),
  }
}

function loadResultsData(): ResultsData {
  const filePath = resolve(__dirname, '..', 'data', 'results-2026.json')
  const raw = readFileSync(filePath, 'utf-8')
  const data = asObject(JSON.parse(raw), 'data/results-2026.json')

  if (data.year !== 2026) {
    fail('data/results-2026.json year must be 2026.')
  }
  if (!Array.isArray(data.sources)) {
    fail('data/results-2026.json sources must be an array.')
  }
  if (!Array.isArray(data.field_corrections)) {
    fail('data/results-2026.json field_corrections must be an array.')
  }
  if (!Array.isArray(data.final_four_feed_order)) {
    fail('data/results-2026.json final_four_feed_order must be an array.')
  }
  if (!Array.isArray(data.results)) {
    fail('data/results-2026.json results must be an array.')
  }
  if (data.results.length !== 63) {
    fail(`data/results-2026.json must contain exactly 63 results; found ${data.results.length}.`)
  }

  const seenResults = new Set<string>()
  const results = data.results.map(parseResult)
  for (const result of results) {
    const key = gameKey(result.round, result.region, result.position)
    if (seenResults.has(key)) {
      fail(`Duplicate result for ${key}.`)
    }
    seenResults.add(key)
  }

  return {
    year: 2026,
    sources: data.sources.map((source, index) => {
      const sourceObject = asObject(source, `sources[${index}]`)
      return {
        label: asString(sourceObject.label, `sources[${index}].label`),
        url: asString(sourceObject.url, `sources[${index}].url`),
      }
    }),
    field_corrections: data.field_corrections.map(parseFieldCorrection),
    final_four_feed_order: data.final_four_feed_order.map(parseFinalFourFeedOrder),
    results,
  }
}

async function fetchGames(): Promise<GameRow[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, round, region, position, team1_id, team2_id, feed_game_1_id, feed_game_2_id, winner_id')
    .order('round', { ascending: true })
    .order('position', { ascending: true })

  if (error || !data) {
    fail(`Failed to fetch games: ${error?.message ?? 'no rows returned'}`)
  }

  return data as GameRow[]
}

async function fetchTeams(): Promise<TeamRow[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, short_name, seed, region')
    .order('region', { ascending: true })
    .order('seed', { ascending: true })

  if (error || !data) {
    fail(`Failed to fetch teams: ${error?.message ?? 'no rows returned'}`)
  }

  return data as TeamRow[]
}

async function applyFieldCorrections(corrections: FieldCorrection[]): Promise<void> {
  for (const correction of corrections) {
    const { data: team, error } = await supabase
      .from('teams')
      .select('id, name, short_name, seed, region')
      .eq('region', correction.region)
      .eq('seed', correction.seed)
      .single()

    if (error || !team) {
      fail(
        `Failed to find team for ${correction.region} seed ${correction.seed}: ${error?.message ?? 'not found'}`
      )
    }

    const existing = team as TeamRow
    if (
      existing.short_name !== correction.from_short_name &&
      existing.short_name !== correction.to.short_name
    ) {
      fail(
        `Unexpected ${correction.region} seed ${correction.seed} short_name: expected ${correction.from_short_name} or ${correction.to.short_name}, found ${existing.short_name}.`
      )
    }

    const { error: updateError } = await supabase
      .from('teams')
      .update({
        name: correction.to.name,
        short_name: correction.to.short_name,
      })
      .eq('id', existing.id)

    if (updateError) {
      fail(`Failed to apply field correction for team ${existing.id}: ${updateError.message}`)
    }
  }
}

async function rewireFinalFour(feedOrder: FinalFourFeedOrder[]): Promise<void> {
  const games = await fetchGames()
  const gamesByKey = new Map(games.map((game) => [gameKey(game.round, game.region, game.position), game]))

  for (const finalFourGame of feedOrder) {
    const target = gamesByKey.get(gameKey(5, null, finalFourGame.position))
    const feed1 = gamesByKey.get(
      gameKey(
        finalFourGame.feeders[0].round,
        finalFourGame.feeders[0].region,
        finalFourGame.feeders[0].position
      )
    )
    const feed2 = gamesByKey.get(
      gameKey(
        finalFourGame.feeders[1].round,
        finalFourGame.feeders[1].region,
        finalFourGame.feeders[1].position
      )
    )

    if (!target || !feed1 || !feed2) {
      fail(`Unable to resolve Final Four feed order for position ${finalFourGame.position}.`)
    }

    const { error } = await supabase
      .from('games')
      .update({
        feed_game_1_id: feed1.id,
        feed_game_2_id: feed2.id,
      })
      .eq('id', target.id)

    if (error) {
      fail(`Failed to rewire Final Four game ${target.id}: ${error.message}`)
    }
  }
}

async function resetTournamentResults(): Promise<void> {
  const { error: winnerError } = await supabase
    .from('games')
    .update({ winner_id: null })
    .gte('id', 0)

  if (winnerError) {
    fail(`Failed to reset game winners: ${winnerError.message}`)
  }

  const { error: teamsError } = await supabase
    .from('games')
    .update({ team1_id: null, team2_id: null })
    .gt('round', 1)

  if (teamsError) {
    fail(`Failed to reset later-round teams: ${teamsError.message}`)
  }
}

async function setGameWinner(gameId: number, winnerId: number): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({ winner_id: winnerId })
    .eq('id', gameId)

  if (error) {
    fail(`Failed to set winner for game ${gameId}: ${error.message}`)
  }
}

async function advanceWinner(nextGame: GameRow, slot: 'team1_id' | 'team2_id', winnerId: number): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({ [slot]: winnerId })
    .eq('id', nextGame.id)

  if (error) {
    fail(`Failed to advance winner ${winnerId} into game ${nextGame.id}: ${error.message}`)
  }

  nextGame[slot] = winnerId
}

async function applyResults(results: ResultEntry[]): Promise<void> {
  const teams = await fetchTeams()
  const teamsById = new Map(teams.map((team) => [team.id, team]))
  const games = await fetchGames()
  const gamesByKey = new Map(games.map((game) => [gameKey(game.round, game.region, game.position), game]))
  const gamesByFeedId = new Map<number, { game: GameRow; slot: 'team1_id' | 'team2_id' }>()

  for (const game of games) {
    if (game.feed_game_1_id !== null) {
      gamesByFeedId.set(game.feed_game_1_id, { game, slot: 'team1_id' })
    }
    if (game.feed_game_2_id !== null) {
      gamesByFeedId.set(game.feed_game_2_id, { game, slot: 'team2_id' })
    }
  }

  const sortedResults = [...results].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round
    if ((a.region ?? '') !== (b.region ?? '')) return (a.region ?? '').localeCompare(b.region ?? '')
    return a.position - b.position
  })

  for (const result of sortedResults) {
    const key = gameKey(result.round, result.region, result.position)
    const game = gamesByKey.get(key)

    if (!game) {
      fail(`No game found for result ${key}.`)
    }
    if (game.team1_id === null || game.team2_id === null) {
      fail(`Game ${key} is missing teams before applying winner ${result.winner_short_name}.`)
    }

    const team1 = teamsById.get(game.team1_id)
    const team2 = teamsById.get(game.team2_id)
    const winner =
      team1?.short_name === result.winner_short_name
        ? team1
        : team2?.short_name === result.winner_short_name
          ? team2
          : null

    if (!team1 || !team2) {
      fail(`Game ${key} references missing team rows.`)
    }
    if (!winner) {
      fail(
        `Winner ${result.winner_short_name} is not in game ${key}: ${team1.short_name} vs ${team2.short_name}.`
      )
    }

    await setGameWinner(game.id, winner.id)
    game.winner_id = winner.id

    const next = gamesByFeedId.get(game.id)
    if (next) {
      await advanceWinner(next.game, next.slot, winner.id)
    }
  }
}

async function markTournamentCompleted(): Promise<void> {
  const { error } = await supabase
    .from('tournament_config')
    .update({ status: 'completed' })
    .eq('year', 2026)

  if (error) {
    fail(`Failed to mark tournament completed: ${error.message}`)
  }
}

async function verifyImport(): Promise<void> {
  const { data: decidedGames, error: decidedError } = await supabase
    .from('games')
    .select('id')
    .not('winner_id', 'is', null)

  if (decidedError || !decidedGames) {
    fail(`Failed to verify decided games: ${decidedError?.message ?? 'no rows returned'}`)
  }
  if (decidedGames.length !== 63) {
    fail(`Verification failed: expected 63 decided games, found ${decidedGames.length}.`)
  }

  const { data: championship, error: championshipError } = await supabase
    .from('games')
    .select('winner_id')
    .eq('round', 6)
    .is('region', null)
    .eq('position', 1)
    .single()

  if (championshipError || !championship) {
    fail(`Failed to verify championship winner: ${championshipError?.message ?? 'not found'}`)
  }

  const championshipWinnerId = (championship as { winner_id: number | null }).winner_id
  if (championshipWinnerId === null) {
    fail('Verification failed: championship winner is null, expected Michigan.')
  }

  const { data: championshipWinner, error: winnerError } = await supabase
    .from('teams')
    .select('short_name')
    .eq('id', championshipWinnerId)
    .single()

  if (winnerError || !championshipWinner) {
    fail(`Failed to verify championship winner team: ${winnerError?.message ?? 'not found'}`)
  }

  const winner = championshipWinner as { short_name: string }
  if (winner?.short_name !== 'Michigan') {
    fail(`Verification failed: championship winner is ${winner?.short_name ?? 'null'}, expected Michigan.`)
  }

  const { data: config, error: configError } = await supabase
    .from('tournament_config')
    .select('status')
    .eq('year', 2026)
    .single()

  if (configError || !config) {
    fail(`Failed to verify tournament status: ${configError?.message ?? 'not found'}`)
  }
  if ((config as { status: string }).status !== 'completed') {
    fail(`Verification failed: tournament status is ${(config as { status: string }).status}, expected completed.`)
  }

  const { count: totalPickCount, error: totalPicksError } = await supabase
    .from('picks')
    .select('id', { count: 'exact', head: true })

  if (totalPicksError) {
    fail(`Failed to count picks: ${totalPicksError.message}`)
  }

  const { count: nullPickCount, error: nullPicksError } = await supabase
    .from('picks')
    .select('id', { count: 'exact', head: true })
    .is('is_correct', null)

  if (nullPicksError) {
    fail(`Failed to verify picks: ${nullPicksError.message}`)
  }
  if ((totalPickCount ?? 0) > 0 && (nullPickCount ?? 0) > 0) {
    fail(`Verification failed: ${nullPickCount} picks still have is_correct null.`)
  }

  const { count: totalBracketCount, error: totalBracketsError } = await supabase
    .from('brackets')
    .select('id', { count: 'exact', head: true })

  if (totalBracketsError) {
    fail(`Failed to count brackets: ${totalBracketsError.message}`)
  }

  const { count: nullRankCount, error: nullRanksError } = await supabase
    .from('brackets')
    .select('id', { count: 'exact', head: true })
    .is('rank', null)

  if (nullRanksError) {
    fail(`Failed to verify bracket ranks: ${nullRanksError.message}`)
  }
  if ((totalBracketCount ?? 0) > 0 && (nullRankCount ?? 0) > 0) {
    fail(`Verification failed: ${nullRankCount} brackets still have null rank.`)
  }

  console.log('\n--- Verification Complete ---')
  console.log('63 games decided.')
  console.log('Championship winner: Michigan')
  console.log('Tournament status: completed')
  console.log(`Picks verified: ${totalPickCount ?? 0}`)
  console.log(`Brackets ranked: ${totalBracketCount ?? 0}`)
}

async function applyResults2026(): Promise<void> {
  const data = loadResultsData()

  console.log('Applying 2026 tournament results...')
  console.log(`Loaded ${data.results.length} results from ${data.sources.length} source(s).`)

  await applyFieldCorrections(data.field_corrections)
  console.log(`Applied ${data.field_corrections.length} field correction(s).`)

  await rewireFinalFour(data.final_four_feed_order)
  console.log('Rewired Final Four feed games.')

  await resetTournamentResults()
  console.log('Reset existing tournament result state.')

  await applyResults(data.results)
  console.log('Applied all game results.')

  const scoringResult = await recalculateAllScores()
  console.log(
    `Recalculated scoring for ${scoringResult.games_rescored} game(s) and ${scoringResult.brackets_updated} bracket(s).`
  )

  await markTournamentCompleted()
  console.log('Marked tournament status completed.')

  await verifyImport()
}

applyResults2026().catch((error) => {
  console.error('Failed to apply 2026 results:', error)
  process.exit(1)
})
