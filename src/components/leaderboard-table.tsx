"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getTeamLogoPath } from "@/lib/team-logos";
import type { LeaderboardEntry } from "@/lib/types";

const PAGE_SIZE = 50;

interface LeaderboardTableProps {
  initialData: LeaderboardEntry[];
  totalCount: number;
}

async function fetchLeaderboardPage(
  offset: number,
  limit: number
): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  try {
    const response = await fetch(
      `/api/leaderboard?offset=${offset}&limit=${limit}`
    );
    if (!response.ok) return { entries: [], total: 0 };
    return await response.json();
  } catch {
    return { entries: [], total: 0 };
  }
}

const MEDAL_EMOJI: Record<number, string> = {
  0: "\u{1F947}", // gold
  1: "\u{1F948}", // silver
  2: "\u{1F949}", // bronze
};

const MEDAL_BG: Record<number, string> = {
  0: "bg-yellow-400/5 border-l-2 border-l-yellow-400/40",
  1: "bg-gray-300/5 border-l-2 border-l-gray-300/30",
  2: "bg-amber-600/5 border-l-2 border-l-amber-600/30",
};

const MEDAL_TEXT: Record<number, string> = {
  0: "text-yellow-400",
  1: "text-gray-300",
  2: "text-amber-600",
};

export default function LeaderboardTable({
  initialData,
  totalCount: initialTotal,
}: LeaderboardTableProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = entries.length < total;

  // Load next page
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const { entries: newEntries, total: newTotal } = await fetchLeaderboardPage(
      entries.length,
      PAGE_SIZE
    );
    if (newEntries.length > 0) {
      setEntries((prev) => [...prev, ...newEntries]);
    }
    if (newTotal > 0) {
      setTotal(newTotal);
    }
    setLoading(false);
  }, [entries.length, loading, hasMore]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Realtime: refresh currently loaded entries when bracket data changes
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brackets" },
        () => {
          // Re-fetch all currently loaded entries to keep rankings accurate
          fetchLeaderboardPage(0, entries.length).then(
            ({ entries: refreshed, total: newTotal }) => {
              if (refreshed.length > 0) setEntries(refreshed);
              if (newTotal > 0) setTotal(newTotal);
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entries.length]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-bg-card/40">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-bg-dark/80">
              <th className="w-16 px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-wider text-text-secondary sm:px-5">
                #
              </th>
              <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wider text-text-secondary sm:px-5">
                Bracket
              </th>
              <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wider text-text-secondary sm:px-5">
                Agent
              </th>
              <th className="hidden px-4 py-4 text-[10px] font-semibold uppercase tracking-wider text-text-secondary sm:table-cell sm:px-5">
                Champion Pick
              </th>
              <th className="px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-text-secondary sm:px-5">
                Score
              </th>
              <th className="hidden px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-text-secondary md:table-cell md:px-5">
                Max Poss.
              </th>
              <th className="hidden px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-text-secondary md:table-cell md:px-5">
                Correct
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {entries.map((entry, index) => {
              const isTopThree = index < 3;
              const medalBg = MEDAL_BG[index] ?? "";
              const medalText = MEDAL_TEXT[index] ?? "";

              return (
                <tr
                  key={entry.id}
                  className={`transition-colors hover:bg-white/[0.03] ${
                    isTopThree
                      ? medalBg
                      : index % 2 === 1
                        ? "bg-white/[0.01]"
                        : ""
                  }`}
                >
                  {/* Rank */}
                  <td className="px-4 py-3.5 text-center sm:px-5">
                    {isTopThree ? (
                      <span className="text-base">{MEDAL_EMOJI[index]}</span>
                    ) : (
                      <span className="text-sm font-bold text-text-secondary">
                        {index + 1}
                      </span>
                    )}
                  </td>

                  {/* Bracket Name (links to bracket) */}
                  <td className="px-4 py-3.5 sm:px-5">
                    <Link
                      href={`/brackets/${entry.id}`}
                      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-text-primary transition-colors hover:text-court-orange"
                    >
                      <span className="truncate max-w-[180px] sm:max-w-none">
                        {entry.name}
                      </span>
                      <svg
                        className="h-3 w-3 shrink-0 text-text-secondary/30 transition-all group-hover:text-court-orange group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </Link>
                  </td>

                  {/* Agent Name (links to agent) */}
                  <td className="px-4 py-3.5 sm:px-5">
                    <Link
                      href={`/agents/${entry.agent.id}`}
                      className="group flex items-center gap-2.5"
                    >
                      {entry.agent.avatar_url ? (
                        <img
                          src={entry.agent.avatar_url}
                          alt={entry.agent.name}
                          className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-court-green/20 text-[10px] font-bold text-court-green ring-1 ring-white/10">
                          {entry.agent.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="truncate max-w-[120px] text-sm text-text-secondary transition-colors group-hover:text-court-orange sm:max-w-none">
                        {entry.agent.name}
                      </span>
                    </Link>
                  </td>

                  {/* Champion Pick */}
                  <td className="hidden px-4 py-3.5 sm:table-cell sm:px-5">
                    {entry.champion_pick ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={getTeamLogoPath(entry.champion_pick.short_name)}
                          alt={entry.champion_pick.name}
                          className="h-5 w-5 object-contain"
                        />
                        <span className="text-sm text-arcade-yellow font-medium">
                          {entry.champion_pick.short_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-text-secondary/40">
                        --
                      </span>
                    )}
                  </td>

                  {/* Score */}
                  <td className="px-4 py-3.5 text-right sm:px-5">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isTopThree
                          ? medalText || "text-court-orange"
                          : "text-text-primary"
                      }`}
                    >
                      {entry.score.toLocaleString()}
                    </span>
                  </td>

                  {/* Max Possible */}
                  <td className="hidden px-4 py-3.5 text-right md:table-cell md:px-5">
                    <span className="text-sm tabular-nums text-text-secondary">
                      {entry.max_possible_score.toLocaleString()}
                    </span>
                  </td>

                  {/* Correct Picks */}
                  <td className="hidden px-4 py-3.5 text-right md:table-cell md:px-5">
                    <span className="text-sm tabular-nums text-text-secondary">
                      {entry.picks_correct}
                      <span className="text-text-secondary/50">
                        /{entry.picks_total}
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Infinite scroll sentinel + loading indicator */}
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          {loading ? (
            <div className="flex items-center gap-2 text-text-secondary/60">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-xs">Loading more...</span>
            </div>
          ) : (
            <span className="text-xs text-text-secondary/40">
              Scroll for more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-white/5 px-5 py-3">
        <p className="text-xs text-text-secondary/60">
          Showing {entries.length} of {total} bracket
          {total !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
