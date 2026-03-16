"use client";

import { useState, useEffect, useCallback } from "react";
import type { GameWithTeams, RoundNumber } from "@/lib/types";
import GameResultForm from "@/components/game-result-form";

const ROUND_TABS: { round: RoundNumber; label: string; short: string }[] = [
  { round: 1, label: "Round of 64", short: "R64" },
  { round: 2, label: "Round of 32", short: "R32" },
  { round: 3, label: "Sweet 16", short: "S16" },
  { round: 4, label: "Elite 8", short: "E8" },
  { round: 5, label: "Final Four", short: "F4" },
  { round: 6, label: "Championship", short: "CHP" },
];

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [secretInput, setSecretInput] = useState("");

  const [games, setGames] = useState<GameWithTeams[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<RoundNumber>(1);

  const fetchGames = useCallback(async () => {
    if (!adminSecret) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tournament");
      if (!res.ok) throw new Error(`Failed to fetch tournament data (${res.status})`);
      const data = await res.json();
      setGames(data.games ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load games");
    } finally {
      setLoading(false);
    }
  }, [adminSecret]);

  useEffect(() => {
    if (authenticated) {
      fetchGames();
    }
  }, [authenticated, fetchGames]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!secretInput.trim()) return;
    setAdminSecret(secretInput.trim());
    setAuthenticated(true);
  }

  // Compute progress stats
  const totalGames = games.length;
  const completedGames = games.filter((g) => g.winner_id !== null).length;
  const progressPercent = totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0;

  // Filter games for the active round
  const filteredGames = games.filter((g) => g.round === activeRound);

  // Per-round completion counts
  const roundStats = ROUND_TABS.map((tab) => {
    const roundGames = games.filter((g) => g.round === tab.round);
    const completed = roundGames.filter((g) => g.winner_id !== null).length;
    return { ...tab, completed, total: roundGames.length };
  });

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-white/10 bg-bg-card p-8">
            <h1 className="text-2xl font-bold text-text-primary">Admin Login</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Enter the admin secret to manage tournament results.
            </p>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-secret"
                  className="block text-sm font-medium text-text-secondary"
                >
                  Admin Secret
                </label>
                <input
                  id="admin-secret"
                  type="password"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder="Enter admin secret..."
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-bg-dark px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-court-orange focus:outline-none focus:ring-1 focus:ring-court-orange"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!secretInput.trim()}
                className="w-full rounded-lg bg-court-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-court-orange/90 disabled:opacity-50"
              >
                Enter Admin Panel
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Tournament Admin
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Enter game results to update the bracket and leaderboard.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 rounded-xl border border-white/10 bg-bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">
              Tournament Progress
            </span>
            <span className="text-sm font-semibold text-court-orange">
              {completedGames}/{totalGames} games ({progressPercent}%)
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-dark">
            <div
              className="h-full rounded-full bg-court-orange transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Per-round mini stats */}
          <div className="mt-3 flex flex-wrap gap-3">
            {roundStats.map((rs) => (
              <span key={rs.round} className="text-xs text-text-secondary">
                {rs.short}: {rs.completed}/{rs.total}
              </span>
            ))}
          </div>
        </div>

        {/* Round tabs */}
        <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-white/5 bg-bg-card p-1">
          {ROUND_TABS.map((tab) => {
            const isActive = activeRound === tab.round;
            const rs = roundStats.find((r) => r.round === tab.round);
            const isRoundComplete = rs ? rs.completed === rs.total && rs.total > 0 : false;

            return (
              <button
                key={tab.round}
                onClick={() => setActiveRound(tab.round)}
                className={[
                  "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-court-orange text-white"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                ].join(" ")}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
                {isRoundComplete && (
                  <span className="text-xs text-green-400" title="Round complete">
                    &#10003;
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
            <button
              onClick={fetchGames}
              className="ml-3 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-court-orange border-t-transparent" />
          </div>
        )}

        {/* Game result form */}
        {!loading && filteredGames.length > 0 && (
          <GameResultForm
            games={filteredGames}
            adminSecret={adminSecret}
            onResultSubmitted={fetchGames}
          />
        )}

        {!loading && filteredGames.length === 0 && !error && (
          <div className="py-20 text-center text-text-secondary">
            No games found for this round.
          </div>
        )}
      </div>
    </main>
  );
}
