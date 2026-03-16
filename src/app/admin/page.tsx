"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameWithTeams, RoundNumber } from "@/lib/types";
import { ROUND_NAMES, TOTAL_GAMES } from "@/lib/constants";
import GameResultForm from "@/components/game-result-form";

const ROUND_TABS: { round: RoundNumber; label: string }[] = [
  { round: 1, label: "R64" },
  { round: 2, label: "R32" },
  { round: 3, label: "S16" },
  { round: 4, label: "E8" },
  { round: 5, label: "F4" },
  { round: 6, label: "Champ" },
];

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [secretInput, setSecretInput] = useState("");
  const [games, setGames] = useState<GameWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<RoundNumber>(1);

  // Check for existing admin secret on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_secret");
    if (stored) {
      setAdminSecret(stored);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchGames = useCallback(async () => {
    if (!adminSecret) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tournament");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to fetch tournament data");
        setLoading(false);
        return;
      }

      setGames(data.games ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [adminSecret]);

  // Fetch games when admin is authenticated
  useEffect(() => {
    if (adminSecret) {
      fetchGames();
    }
  }, [adminSecret, fetchGames]);

  function handleSecretSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!secretInput.trim()) return;
    sessionStorage.setItem("admin_secret", secretInput.trim());
    setAdminSecret(secretInput.trim());
    setSecretInput("");
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_secret");
    setAdminSecret(null);
    setGames([]);
  }

  // If no admin secret, show the prompt
  if (!adminSecret) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-xl border border-white/10 bg-bg-card p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-court-orange/10">
                <svg
                  className="h-6 w-6 text-court-orange"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-text-primary">
                Admin Access
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Enter the admin secret to manage game results.
              </p>
            </div>

            <form onSubmit={handleSecretSubmit}>
              <label htmlFor="admin-secret" className="sr-only">
                Admin Secret
              </label>
              <input
                id="admin-secret"
                type="password"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="Admin secret"
                className="w-full rounded-lg border border-white/10 bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-court-orange/50 focus:outline-none focus:ring-1 focus:ring-court-orange/50"
                autoFocus
              />
              <button
                type="submit"
                className="mt-4 w-full rounded-lg bg-court-orange px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-court-orange/80"
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const completedGames = games.filter((g) => g.winner_id !== null).length;
  const roundGames = games.filter(
    (g) => (g.round as RoundNumber) === activeRound
  );
  const roundCompletedGames = roundGames.filter(
    (g) => g.winner_id !== null
  ).length;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Admin: Game Results
            </h1>
            <p className="mt-2 text-text-secondary">
              Enter game results to score all brackets.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-white/10 bg-bg-card px-4 py-2">
              <span className="text-sm text-text-secondary">Progress: </span>
              <span className="text-sm font-semibold text-text-primary">
                {completedGames} of {TOTAL_GAMES}
              </span>
              <span className="text-sm text-text-secondary"> games completed</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-court-orange transition-all duration-500"
              style={{
                width: `${TOTAL_GAMES > 0 ? (completedGames / TOTAL_GAMES) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Round tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {ROUND_TABS.map(({ round, label }) => {
            const tabGames = games.filter(
              (g) => (g.round as RoundNumber) === round
            );
            const tabCompleted = tabGames.filter(
              (g) => g.winner_id !== null
            ).length;
            const isActive = activeRound === round;

            return (
              <button
                key={round}
                type="button"
                onClick={() => setActiveRound(round)}
                className={`relative rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-court-orange text-white"
                    : "border border-white/10 bg-bg-card text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <span>{label}</span>
                {tabGames.length > 0 && (
                  <span
                    className={`ml-2 text-xs ${
                      isActive ? "text-white/70" : "text-text-secondary/70"
                    }`}
                  >
                    {tabCompleted}/{tabGames.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active round heading */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            {ROUND_NAMES[activeRound]}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {roundCompletedGames} of {roundGames.length} games completed in this
            round.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-court-orange border-t-transparent" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Game results form */}
        {!loading && !error && (
          <GameResultForm
            games={roundGames}
            onResultSubmitted={fetchGames}
          />
        )}
      </div>
    </main>
  );
}
