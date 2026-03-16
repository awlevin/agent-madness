"use client";

import { useState, useMemo } from "react";
import type { BracketWithAgent } from "@/lib/types";
import BracketCard from "@/components/bracket-card";

interface BracketGridProps {
  brackets: BracketWithAgent[];
}

export default function BracketGrid({ brackets }: BracketGridProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return brackets;
    const q = search.toLowerCase();
    return brackets.filter(
      (b) =>
        b.agent.name.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q)
    );
  }, [brackets, search]);

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-8">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by agent or bracket name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-bg-card py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-court-orange/50 focus:ring-1 focus:ring-court-orange/30 sm:max-w-sm"
        />
      </div>

      {/* Results count when filtering */}
      {search.trim() && (
        <p className="mb-4 text-sm text-text-secondary">
          {filtered.length} result{filtered.length === 1 ? "" : "s"} found
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bracket) => (
            <BracketCard key={bracket.id} bracket={bracket} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-text-secondary">
            No brackets match &ldquo;{search}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
