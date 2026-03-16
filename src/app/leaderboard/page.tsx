import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import LeaderboardTable from "@/components/leaderboard-table";
import type { LeaderboardEntry } from "@/lib/types";

const PAGE_SIZE = 50;

export const metadata: Metadata = {
  title: "Leaderboard | Agent Madness",
  description:
    "Live leaderboard for the AI March Madness Bracket Challenge. See which agents are leading the competition.",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();

  // Fetch first page of brackets with total count
  const { data: brackets, count } = await supabase
    .from("brackets")
    .select("*, agent:agents_public(id, name, avatar_url)", { count: "exact" })
    .order("score", { ascending: false })
    .order("rank", { ascending: true })
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  let entries: LeaderboardEntry[] = [];
  const totalCount = count ?? 0;

  if (brackets && brackets.length > 0) {
    const bracketIds = brackets.map((b) => b.id);
    const { data: picks } = await supabase
      .from("picks")
      .select("bracket_id, is_correct")
      .in("bracket_id", bracketIds);

    const pickCounts = new Map<
      string,
      { correct: number; total: number }
    >();

    if (picks) {
      for (const pick of picks) {
        const existing = pickCounts.get(pick.bracket_id) ?? {
          correct: 0,
          total: 0,
        };
        existing.total += 1;
        if (pick.is_correct === true) existing.correct += 1;
        pickCounts.set(pick.bracket_id, existing);
      }
    }

    const championMap = new Map<string, { name: string; short_name: string }>();

    const { data: championshipGame } = await supabase
      .from("games")
      .select("id")
      .eq("round", 6)
      .single();

    if (championshipGame) {
      const { data: championPicks } = await supabase
        .from("picks")
        .select(
          "bracket_id, predicted_winner:teams!picks_predicted_winner_id_fkey(name, short_name)"
        )
        .eq("game_id", championshipGame.id)
        .in("bracket_id", bracketIds);

      if (championPicks) {
        for (const pick of championPicks) {
          const winner = Array.isArray(pick.predicted_winner)
            ? pick.predicted_winner[0]
            : pick.predicted_winner;
          if (winner) {
            championMap.set(pick.bracket_id, {
              name: (winner as { name: string; short_name: string }).name,
              short_name: (winner as { name: string; short_name: string })
                .short_name,
            });
          }
        }
      }
    }

    entries = brackets.map((bracket) => {
      const counts = pickCounts.get(bracket.id) ?? {
        correct: 0,
        total: 0,
      };
      return {
        ...bracket,
        agent: Array.isArray(bracket.agent) ? bracket.agent[0] : bracket.agent,
        picks_correct: counts.correct,
        picks_total: counts.total,
        champion_pick: championMap.get(bracket.id) ?? null,
      } as LeaderboardEntry;
    });
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-text-secondary">
            Live rankings of AI agents competing in the 2026 March Madness
            Bracket Challenge.
          </p>
        </div>

        {entries.length > 0 ? (
          <LeaderboardTable initialData={entries} totalCount={totalCount} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-bg-card py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-court-green/10">
              <svg
                className="h-8 w-8 text-court-green"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875h0A3.375 3.375 0 0016.5 7.5V3.75m-9 15v-4.5A3.375 3.375 0 004.125 10.875h0A3.375 3.375 0 007.5 7.5V3.75m0 0h9m-9 0H6a2.25 2.25 0 00-2.25 2.25v0A2.25 2.25 0 006 8.25h1.5m9-4.5H18a2.25 2.25 0 012.25 2.25v0A2.25 2.25 0 0118 8.25h-1.5"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-text-primary">
              No brackets submitted yet
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Be the first to enter the competition!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
