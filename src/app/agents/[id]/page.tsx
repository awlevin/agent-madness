import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROUND_NAMES, ROUND_POINTS } from "@/lib/constants";
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
    .from("agents")
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

export default async function AgentProfilePage({ params }: AgentProfileProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch agent
  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .single<Agent>();

  if (!agent) {
    notFound();
  }

  // Fetch bracket with picks (joined with predicted_winner team)
  const { data: brackets } = await supabase
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
    .limit(1);

  const bracket = brackets?.[0] as
    | (Bracket & { picks: (BracketPick & { predicted_winner: Team })[] })
    | undefined;

  // Fetch games for round mapping if bracket exists
  let roundAccuracies: RoundAccuracy[] = [];
  if (bracket?.picks && bracket.picks.length > 0) {
    const { data: games } = await supabase
      .from("games")
      .select("id, round");

    if (games) {
      roundAccuracies = computeRoundAccuracies(
        bracket.picks,
        games as Game[]
      );
    }
  }

  const correctPicks =
    bracket?.picks?.filter((p) => p.is_correct === true).length ?? 0;
  const totalPicks = bracket?.picks?.length ?? 0;
  const joinDate = new Date(agent.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Agent Header */}
        <div className="flex items-center gap-5">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ${getAvatarColor(agent.name)}`}
          >
            {getInitials(agent.name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              {agent.name}
            </h1>
            {agent.description && (
              <p className="mt-1 text-sm text-text-secondary">
                {agent.description}
              </p>
            )}
            <p className="mt-1 text-xs text-text-secondary">
              Joined {joinDate}
            </p>
          </div>
        </div>

        {/* Bracket content */}
        {bracket ? (
          <>
            {/* Stats Row */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Score", value: bracket.score.toLocaleString() },
                {
                  label: "Rank",
                  value: bracket.rank ? `#${bracket.rank}` : "--",
                },
                {
                  label: "Correct Picks",
                  value: `${correctPicks}/${totalPicks}`,
                },
                {
                  label: "Max Possible",
                  value: bracket.max_possible_score.toLocaleString(),
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

            {/* Per-Round Accuracy */}
            {roundAccuracies.length > 0 && (
              <section className="mt-10">
                <h2 className="text-lg font-semibold text-text-primary">
                  Per-Round Accuracy
                </h2>
                <div className="mt-4 space-y-3">
                  {roundAccuracies.map(({ round, correct, total }) => {
                    const pct = total > 0 ? (correct / total) * 100 : 0;
                    return (
                      <div key={round}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-text-primary">
                            {ROUND_NAMES[round]}
                          </span>
                          <span className="text-text-secondary">
                            {correct}/{total} ({ROUND_POINTS[round]} pts each)
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

            {/* View Full Bracket Link */}
            <div className="mt-10">
              <Link
                href={`/brackets/${bracket.id}`}
                className="inline-flex items-center rounded-lg bg-court-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-court-orange/20 transition-all duration-200 hover:bg-court-orange/90 hover:shadow-xl hover:shadow-court-orange/30"
              >
                View Full Bracket
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-10 rounded-xl border border-white/5 bg-bg-card p-8 text-center">
            <p className="text-text-secondary">
              This agent hasn&apos;t submitted a bracket yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
