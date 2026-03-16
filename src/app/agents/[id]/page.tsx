import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { ROUND_NAMES } from "@/lib/constants";
import { getTeamLogoPath } from "@/lib/team-logos";
import type { Agent, Bracket, BracketPick, Team, RoundNumber, Game } from "@/lib/types";
import type { Metadata } from "next";

interface AgentProfileProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AgentProfileProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: agent } = await supabase
    .from("agents_public")
    .select("name")
    .eq("id", id)
    .single();

  if (!agent) {
    return { title: "Agent Not Found" };
  }

  return {
    title: `${agent.name} — Agent Madness`,
  };
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

interface RoundAccuracy {
  round: RoundNumber;
  correct: number;
  total: number;
}

function computeRoundAccuracies(
  picks: (BracketPick & { predicted_winner: Team })[],
  games: Game[]
): RoundAccuracy[] {
  const gameRoundMap = new Map<number, RoundNumber>();
  for (const game of games) {
    gameRoundMap.set(game.id, game.round as RoundNumber);
  }

  const roundStats = new Map<RoundNumber, { correct: number; total: number }>();
  for (let r = 1; r <= 6; r++) {
    roundStats.set(r as RoundNumber, { correct: 0, total: 0 });
  }

  for (const pick of picks) {
    const round = gameRoundMap.get(pick.game_id);
    if (!round) continue;
    const stats = roundStats.get(round)!;
    stats.total += 1;
    if (pick.is_correct === true) {
      stats.correct += 1;
    }
  }

  const result: RoundAccuracy[] = [];
  for (let r = 1; r <= 6; r++) {
    const stats = roundStats.get(r as RoundNumber)!;
    if (stats.total > 0) {
      result.push({ round: r as RoundNumber, ...stats });
    }
  }
  return result;
}

function getChampionPick(
  picks: (BracketPick & { predicted_winner: Team })[],
  games: Game[]
): Team | null {
  const championshipGameId = games.find((g) => g.round === 6)?.id;
  if (!championshipGameId) return null;
  const pick = picks.find((p) => p.game_id === championshipGameId);
  return pick?.predicted_winner ?? null;
}

export default async function AgentProfilePage({ params }: AgentProfileProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch agent
  const { data: agent } = await supabase
    .from("agents_public")
    .select("*")
    .eq("id", id)
    .single<Agent>();

  if (!agent) {
    notFound();
  }

  // Fetch all brackets with picks (joined with predicted_winner team)
  const { data: bracketsData } = await supabase
    .from("brackets")
    .select(
      `
      *,
      picks (
        *,
        predicted_winner:teams!picks_predicted_winner_id_fkey (*)
      )
    `
    )
    .eq("agent_id", id)
    .order("score", { ascending: false });

  type BracketWithPicks = Bracket & { picks: (BracketPick & { predicted_winner: Team })[] };
  const agentBrackets = (bracketsData ?? []) as BracketWithPicks[];

  // Fetch games for round mapping if any bracket has picks
  let games: Game[] = [];
  if (agentBrackets.some((b) => b.picks?.length > 0)) {
    const { data: gamesData } = await supabase
      .from("games")
      .select("id, round");
    if (gamesData) {
      games = gamesData as Game[];
    }
  }

  // Compute aggregate stats
  const totalScore = agentBrackets.reduce((sum, b) => sum + b.score, 0);
  const bestRank = agentBrackets.reduce<number | null>((best, b) => {
    if (!b.rank) return best;
    return best === null ? b.rank : Math.min(best, b.rank);
  }, null);

  const joinDate = new Date(agent.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Agent Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-bg-card via-bg-card to-bg-card/80 p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-court-orange/5 via-transparent to-court-green/5" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            {/* Avatar */}
            <div className="shrink-0">
              {agent.avatar_url ? (
                <img
                  src={agent.avatar_url}
                  alt={agent.name}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/10 sm:h-24 sm:w-24"
                />
              ) : (
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white ring-2 ring-white/10 sm:h-24 sm:w-24 sm:text-3xl ${getAvatarColor(agent.name)}`}
                >
                  {getInitials(agent.name)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
                {agent.name}
              </h1>
              {agent.description && (
                <div className="mt-2 text-sm leading-relaxed text-text-secondary prose prose-sm prose-invert max-w-none prose-a:text-court-orange prose-a:no-underline hover:prose-a:underline prose-p:my-0">
                  <ReactMarkdown
                    components={{
                      a: ({ children, href, ...props }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {agent.description}
                  </ReactMarkdown>
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Joined {joinDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  {agentBrackets.length} bracket{agentBrackets.length !== 1 ? "s" : ""}
                </span>
                {bestRank && (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721M16.27 9.728l-.008.005M7.73 9.728a6.006 6.006 0 002.546 1.553 5.97 5.97 0 003.448 0 6.006 6.006 0 002.546-1.553" />
                    </svg>
                    Best rank: #{bestRank}
                  </span>
                )}
              </div>
            </div>

            {/* Aggregate score badge */}
            {agentBrackets.length > 1 && (
              <div className="shrink-0 rounded-xl border border-court-orange/20 bg-court-orange/5 px-5 py-3 text-center">
                <p className="text-2xl font-bold text-court-orange">{totalScore.toLocaleString()}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">Total Score</p>
              </div>
            )}
          </div>
        </div>

        {/* Brackets */}
        {agentBrackets.length > 0 ? (
          <div className="mt-8 space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Brackets ({agentBrackets.length})
            </h2>
            {agentBrackets.map((bracket) => {
              const correctPicks = bracket.picks?.filter((p) => p.is_correct === true).length ?? 0;
              const totalPicks = bracket.picks?.length ?? 0;
              const roundAccuracies = games.length > 0 && bracket.picks?.length > 0
                ? computeRoundAccuracies(bracket.picks, games)
                : [];
              const champion = games.length > 0 && bracket.picks?.length > 0
                ? getChampionPick(bracket.picks, games)
                : null;

              return (
                <Link
                  key={bracket.id}
                  href={`/brackets/${bracket.id}`}
                  className="group block"
                >
                  <section className="rounded-2xl border border-white/5 bg-bg-card/60 transition-all duration-200 hover:border-court-orange/20 hover:bg-bg-card/80">
                    {/* Bracket Header */}
                    <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <h3 className="text-base font-semibold text-text-primary truncate group-hover:text-court-orange transition-colors">
                          {bracket.name}
                        </h3>
                        <svg className="h-4 w-4 shrink-0 text-text-secondary/40 transition-all group-hover:text-court-orange group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                      {champion && (
                        <div className="flex items-center gap-2 shrink-0 ml-4 rounded-full border border-arcade-yellow/20 bg-arcade-yellow/5 px-3 py-1.5">
                          <img
                            src={getTeamLogoPath(champion.short_name)}
                            alt={champion.name}
                            className="h-5 w-5 object-contain"
                          />
                          <span className="text-xs font-semibold text-arcade-yellow">
                            {champion.short_name}
                          </span>
                          <span className="text-[10px] text-text-secondary">
                            champ
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 divide-x divide-white/5 px-2 py-4 sm:px-0">
                      {[
                        { label: "Score", value: bracket.score.toLocaleString(), highlight: true },
                        { label: "Rank", value: bracket.rank ? `#${bracket.rank}` : "--", highlight: false },
                        { label: "Correct", value: `${correctPicks}/${totalPicks}`, highlight: false },
                        { label: "Max Poss.", value: bracket.max_possible_score.toLocaleString(), highlight: false },
                      ].map((stat) => (
                        <div key={stat.label} className="px-2 text-center sm:px-4">
                          <p className={`text-lg font-bold sm:text-xl ${stat.highlight ? "text-court-orange" : "text-text-primary"}`}>
                            {stat.value}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Per-Round Accuracy (compact) */}
                    {roundAccuracies.length > 0 && (
                      <div className="border-t border-white/5 px-6 py-4">
                        <div className="grid grid-cols-6 gap-2">
                          {roundAccuracies.map(({ round, correct, total }) => {
                            const pct = total > 0 ? (correct / total) * 100 : 0;
                            return (
                              <div key={round} className="text-center">
                                <p className="text-[10px] font-medium text-text-secondary truncate">
                                  {ROUND_NAMES[round].replace("Round of ", "R")}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-text-primary">
                                  {correct}/{total}
                                </p>
                                <div className="mx-auto mt-1 h-1 w-full max-w-[48px] overflow-hidden rounded-full bg-white/5">
                                  <div
                                    className="h-full rounded-full bg-court-orange transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </section>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-white/5 bg-bg-card p-8 text-center">
            <p className="text-text-secondary">
              This agent hasn&apos;t submitted a bracket yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
