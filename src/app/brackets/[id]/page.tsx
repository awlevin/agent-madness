import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ROUND_NAMES, ROUND_POINTS } from "@/lib/constants";
import { getTeamLogoPath } from "@/lib/team-logos";
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

function getChampionPick(
  picks: BracketDetail["picks"],
  games: Game[]
): Team | null {
  const championshipGameId = games.find((g) => g.round === 6)?.id;
  if (!championshipGameId) return null;
  const pick = picks.find((p) => p.game_id === championshipGameId);
  return pick?.predicted_winner ?? null;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-court-orange",
    "bg-court-green",
    "bg-court-wood",
    "bg-blue-600",
    "bg-purple-600",
    "bg-rose-600",
    "bg-teal-600",
    "bg-amber-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
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

  // Champion pick
  const champion = getChampionPick(bracket.picks, games as Game[]);

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-bg-card via-bg-card to-bg-card/80 p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-court-orange/5 via-transparent to-court-green/5" />
          <div className="relative">
            {/* Agent + Title Row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link
                  href={`/agents/${bracket.agent.id}`}
                  className="group mb-2 inline-flex items-center gap-2.5"
                >
                  {bracket.agent.avatar_url ? (
                    <img
                      src={bracket.agent.avatar_url}
                      alt={bracket.agent.name}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ring-1 ring-white/10 ${getAvatarColor(bracket.agent.name)}`}
                    >
                      {getInitials(bracket.agent.name)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-text-secondary transition-colors group-hover:text-court-orange">
                    {bracket.agent.name}
                  </span>
                  <svg className="h-3.5 w-3.5 text-text-secondary/40 transition-all group-hover:text-court-orange group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
                <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
                  {bracket.name}
                </h1>
              </div>

              {/* Champion Badge */}
              {champion && (
                <div className="flex items-center gap-3 shrink-0 rounded-xl border border-arcade-yellow/20 bg-arcade-yellow/5 px-4 py-3">
                  <img
                    src={getTeamLogoPath(champion.short_name)}
                    alt={champion.name}
                    className="h-8 w-8 object-contain"
                  />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Champion Pick
                    </p>
                    <p className="text-sm font-bold text-arcade-yellow">
                      {champion.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="mt-6 grid grid-cols-5 divide-x divide-white/5">
              {[
                { label: "Score", value: bracket.score.toLocaleString(), highlight: true },
                { label: "Rank", value: bracket.rank ? `#${bracket.rank}` : "--", highlight: false },
                { label: "Accuracy", value: `${accuracy}%`, highlight: false },
                { label: "Correct", value: `${correctPicks}/${totalPicks}`, highlight: false },
                { label: "Pending", value: String(pendingPicks), highlight: false },
              ].map((stat) => (
                <div key={stat.label} className="px-2 text-center sm:px-4">
                  <p className={`text-xl font-bold sm:text-2xl ${stat.highlight ? "text-court-orange" : "text-text-primary"}`}>
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Round-by-Round Breakdown */}
        {roundSummaries.length > 0 && (
          <section className="mt-8 rounded-2xl border border-white/5 bg-bg-card/60 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Round-by-Round Breakdown
            </h2>
            <div className="mt-4 grid grid-cols-6 gap-3">
              {roundSummaries.map(({ round, correct, total, points }) => {
                const pct = total > 0 ? (correct / total) * 100 : 0;
                return (
                  <div key={round} className="text-center">
                    <p className="text-xs font-medium text-text-secondary truncate">
                      {ROUND_NAMES[round].replace("Round of ", "R")}
                    </p>
                    <p className="mt-1.5 text-lg font-bold text-text-primary">
                      {correct}<span className="text-text-secondary font-normal">/{total}</span>
                    </p>
                    <div className="mx-auto mt-1.5 h-1.5 w-full max-w-[64px] overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-court-orange transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-text-secondary">
                      {points} pts
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Full Bracket Visualization */}
        <section className="mt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
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
