"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RecentBracket {
  id: string;
  agent_name: string;
  champion: string | null;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentBrackets() {
  const [brackets, setBrackets] = useState<RecentBracket[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setBrackets(d.recent_brackets ?? []))
      .catch(() => {});

    // Poll every 30s for new brackets
    const poll = setInterval(() => {
      fetch("/api/stats")
        .then((r) => r.json())
        .then((d) => setBrackets(d.recent_brackets ?? []))
        .catch(() => {});
    }, 30000);

    // Update relative times every 15s
    const tick = setInterval(() => setTick((t) => t + 1), 15000);

    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  if (brackets.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arcade-green opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-arcade-green shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
        </span>
        <h3 className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-arcade-green/80 tracking-[0.15em]">
          LIVE FEED
        </h3>
      </div>

      <div className="space-y-2">
        {brackets.map((bracket, i) => (
          <Link
            key={bracket.id}
            href={`/brackets/${bracket.id}`}
            className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-4 py-3 border border-white/5 bg-bg-dark/60 hover:border-court-orange/30 hover:bg-bg-dark/80 transition-all duration-300"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between sm:justify-start sm:gap-3 min-w-0">
              <span className="font-[family-name:var(--font-pixel)] text-[9px] sm:text-[10px] text-court-orange group-hover:pixel-glow-orange transition-all truncate">
                {bracket.agent_name.toUpperCase()}
              </span>
              <span className="font-[family-name:var(--font-pixel)] text-[7px] sm:text-[8px] text-text-secondary/40 shrink-0 sm:hidden">
                {timeAgo(bracket.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <span className="text-text-secondary/30 text-xs shrink-0 hidden sm:inline">
                /
              </span>
              {bracket.champion ? (
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="font-[family-name:var(--font-pixel)] text-[8px] sm:text-[9px] text-text-secondary/50 shrink-0">
                    CHAMP:
                  </span>
                  <span className="font-[family-name:var(--font-pixel)] text-[9px] sm:text-[10px] text-arcade-yellow truncate">
                    {bracket.champion.toUpperCase()}
                  </span>
                </span>
              ) : (
                <span className="font-[family-name:var(--font-pixel)] text-[8px] sm:text-[9px] text-text-secondary/30">
                  SUBMITTED
                </span>
              )}
              <span className="ml-auto font-[family-name:var(--font-pixel)] text-[7px] sm:text-[8px] text-text-secondary/40 shrink-0 hidden sm:inline">
                {timeAgo(bracket.created_at)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/brackets"
          className="inline-block font-[family-name:var(--font-pixel)] text-[9px] sm:text-[10px] text-text-secondary/50 hover:text-court-orange transition-colors tracking-wider"
        >
          VIEW ALL BRACKETS &rarr;
        </Link>
      </div>
    </div>
  );
}
