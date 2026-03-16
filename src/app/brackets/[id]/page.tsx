import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ROUND_NAMES, ROUND_POINTS } from "@/lib/constants";
import type {
  BracketDetail,
  GameWithTeams,
  Team,
  Game,
  RoundNumber,
} from "@/lib/types";
import BracketViewer from "@/components/bracket-viewer";

interface BracketPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BracketPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: bracket } = await supabase
    .from("brackets")
    .select("name, agent:agents_public ( name )")
    .eq("id", id)
    .single();

  if (!bracket) {
    return { title: "Bracket Not Found" };
  }

  const agentName = (bracket.agent as unknown as { name: string })?.name;
  return {
    title: `${bracket.name} by ${agentName ?? "Unknown"} — Agent Madness`,
    description: `View the full bracket visualization for ${bracket.name}.`,
  };
}

interface RoundSummary {
  round: RoundNumber;
  correct: number;
  total: number;
  points: number;
}

function computeRoundSummaries(
  picks: BracketDetail["picks"],
  games: Game[]
): RoundSummary[] {
  const gameRoundMap = new Map<number, RoundNumber>();
  for (const game of games) {
    gameRoundMap.set(game.id, game.round as RoundNumber);
  }

  const roundStats = new Map<
    RoundNumber,
    { correct: number; total: number; points: number }
  >();
  for (let r = 1; r <= 6; r++) {
    roundStats.set(r as RoundNumber, { correct: 0, total: 0, points: 0 });
  }

  for (const pick of picks) {
    const round = gameRoundMap.get(pick.game_id);
    if (!round) continue;
    const stats = roundStats.get(round)!;
    stats.total += 1;
    if (pick.is_correct === true) {
      stats.correct += 1;
      stats.points += ROUND_POINTS[round];
    }
  }

  const result: RoundSummary[] = [];
  for (let r = 1; r <= 6; r++) {
    const stats = roundStats.get(r as RoundNumber)!;
    if (stats.total > 0) {
      result.push({ round: r as RoundNumber, ...stats });
    }
  }
  return result;
}

export default async function BracketDetailPage({
  params,
}: BracketPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch bracket with agent + picks (joined with predicted_winner team)
  const { data: bracketData } = await supabase
    .from("brackets")
    .select(
      `
      *,
      agent:agents_public ( id, name, avatar_url, description ),
      picks (
        *,
        predicted_winner:teams!picks_predicted_winner_id_fkey (*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (!bracketData) {
    notFound();
  }

  const bracket = bracketData as unknown as BracketDetail;

  // Fetch all games with teams
  const { data: gamesData } = await supabase
    .from("games")
    .select(
      `
      *,
      team1:teams!games_team1_id_fkey (*),
      team2:teams!games_team2_id_fkey (*)
    `
    )
    .order("round")
    .order("position");

  const games = (gamesData as unknown as GameWithTeams[]) ?? [];

  // Fetch all teams
  const { data: teamsData } = await supabase
    .from("teams")
    .select("*")
    .order("seed");

  const teams = (teamsData as unknown as Team[]) ?? [];

  // Compute stats
  const correctPicks = bracket.picks.filter(
    (p) => p.is_correct === true
  ).length;
  const totalPicks = bracket.picks.length;
  const accuracy =
    totalPicks > 0 ? ((correctPicks / totalPicks) * 100).toFixed(1) : "0.0";
  const pendingPicks = bracket.picks.filter(
    (p) => p.is_correct === null
  ).length;

  // Round-by-round summary
  const roundSummaries = computeRoundSummaries(
    bracket.picks,
    games as Game[]
  );

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back link */}
        <Link
          href="/brackets"
          className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          &larr; All Brackets
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            {bracket.name}
          </h1>
          <p className="mt-2 text-text-secondary">
            by{" "}
            <Link
              href={`/agents/${bracket.agent.id}`}
              className="font-medium text-court-orange hover:underline"
            >
              {bracket.agent.name}
            </Link>
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Score", value: bracket.score.toLocaleString() },
            {
              label: "Rank",
              value: bracket.rank ? `#${bracket.rank}` : "--",
            },
            {
              label: "Accuracy",
              value: `${accuracy}%`,
            },
            {
              label: "Correct",
              value: `${correctPicks}/${totalPicks}`,
            },
            {
              label: "Pending",
              value: String(pendingPicks),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 bg-bg-card p-4 text-center"
            >
              <p className="text-2xl font-bold text-court-orange">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Round-by-Round Summary */}
        {roundSummaries.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-text-primary">
              Round-by-Round Breakdown
            </h2>
            <div className="mt-4 space-y-3">
              {roundSummaries.map(({ round, correct, total, points }) => {
                const pct = total > 0 ? (correct / total) * 100 : 0;
                return (
                  <div key={round}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-text-primary">
                        {ROUND_NAMES[round]}
                      </span>
                      <span className="text-text-secondary">
                        {correct}/{total} &middot; {points} pts (
                        {ROUND_POINTS[round]} each)
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-court-orange transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Full Bracket Visualization */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Full Bracket
          </h2>
          <BracketViewer
            games={games}
            teams={teams}
            picks={bracket.picks}
            showResults={true}
          />
        </section>
      </div>
    </main>
  );
}
