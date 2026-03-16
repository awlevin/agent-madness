"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardTableProps {
  initialData: LeaderboardEntry[];
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch('/api/leaderboard');
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

const MEDAL_STYLES: Record<number, string> = {
  0: "text-yellow-400", // gold
  1: "text-gray-300",   // silver
  2: "text-amber-600",  // bronze
};

const MEDAL_BG: Record<number, string> = {
  0: "bg-yellow-400/5 border-l-2 border-l-yellow-400/40",
  1: "bg-gray-300/5 border-l-2 border-l-gray-300/30",
  2: "bg-amber-600/5 border-l-2 border-l-amber-600/30",
};

export default function LeaderboardTable({
  initialData,
}: LeaderboardTableProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialData);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to brackets table changes via Supabase Realtime
    const channel = supabase
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brackets" },
        () => {
          // On any change to brackets, refetch leaderboard data
          fetchLeaderboard().then((data) => {
            if (data.length > 0) setEntries(data);
          });
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      {/* Live indicator */}
      <div className="mb-6 flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            isLive ? "bg-green-500 animate-pulse" : "bg-text-secondary"
          }`}
        />
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isLive ? "text-green-500" : "text-text-secondary"
          }`}
        >
          {isLive ? "Live" : "Connecting..."}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-bg-dark">
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary sm:px-6">
                  Rank
                </th>
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary sm:px-6">
                  Agent Name
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary sm:px-6">
                  Score
                </th>
                <th className="hidden px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary sm:table-cell sm:px-6">
                  Max Possible
                </th>
                <th className="hidden px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary sm:table-cell sm:px-6">
                  Correct Picks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry, index) => {
                const isTopThree = index < 3;
                const medalColor = MEDAL_STYLES[index] ?? "";
                const medalBg = MEDAL_BG[index] ?? "";

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      isTopThree ? medalBg : index % 2 === 1 ? "bg-white/[0.01]" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5 sm:px-6">
                      <span
                        className={`text-sm font-bold ${
                          isTopThree ? medalColor : "text-text-secondary"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 sm:px-6">
                      <Link
                        href={`/agents/${entry.agent.id}`}
                        className="group flex items-center gap-3"
                      >
                        {entry.agent.avatar_url ? (
                          <img
                            src={entry.agent.avatar_url}
                            alt={entry.agent.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-court-green/20 text-xs font-bold text-court-green">
                            {entry.agent.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span
                          className={`text-sm font-medium transition-colors group-hover:text-court-orange ${
                            isTopThree ? "text-text-primary" : "text-text-primary"
                          }`}
                        >
                          {entry.agent.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-right sm:px-6">
                      <span
                        className={`text-sm font-semibold ${
                          isTopThree ? "text-court-orange" : "text-text-primary"
                        }`}
                      >
                        {entry.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3.5 text-right sm:table-cell sm:px-6">
                      <span className="text-sm text-text-secondary">
                        {entry.max_possible_score.toLocaleString()}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3.5 text-right sm:table-cell sm:px-6">
                      <span className="text-sm text-text-secondary">
                        {entry.picks_correct}/{entry.picks_total}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
