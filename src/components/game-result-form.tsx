"use client";

import { useState } from "react";
import type { GameWithTeams, RoundNumber } from "@/lib/types";

const ROUND_LABELS: Record<RoundNumber, string> = {
  1: "Round of 64",
  2: "Round of 32",
  3: "Sweet 16",
  4: "Elite 8",
  5: "Final Four",
  6: "Championship",
};

interface GameResultFormProps {
  games: GameWithTeams[];
  adminSecret: string;
  onResultSubmitted: () => void;
}

export default function GameResultForm({
  games,
  adminSecret,
  onResultSubmitted,
}: GameResultFormProps) {
  const [confirmingGame, setConfirmingGame] = useState<{
    gameId: number;
    winnerId: number;
    winnerName: string;
    loserName: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Group games by round
  const gamesByRound = games.reduce<Record<number, GameWithTeams[]>>(
    (acc, game) => {
      if (!acc[game.round]) acc[game.round] = [];
      acc[game.round].push(game);
      return acc;
    },
    {}
  );

  const rounds = Object.keys(gamesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  function handleTeamClick(game: GameWithTeams, winnerId: number) {
    if (game.winner_id !== null) return;
    const winner =
      game.team1?.id === winnerId ? game.team1 : game.team2;
    const loser =
      game.team1?.id === winnerId ? game.team2 : game.team1;
    if (!winner) return;

    setError(null);
    setSuccessMessage(null);
    setConfirmingGame({
      gameId: game.id,
      winnerId,
      winnerName: `(${winner.seed}) ${winner.name}`,
      loserName: loser ? `(${loser.seed}) ${loser.name}` : "TBD",
    });
  }

  async function submitResult() {
    if (!confirmingGame) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          game_id: confirmingGame.gameId,
          winner_id: confirmingGame.winnerId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error ?? `Request failed with status ${res.status}`
        );
      }

      setSuccessMessage(
        `Result recorded: ${confirmingGame.winnerName} defeats ${confirmingGame.loserName}`
      );
      setConfirmingGame(null);
      onResultSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Status messages */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg border border-green-500/30 bg-green-900/20 px-4 py-3 text-sm text-green-400">
          {successMessage}
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmingGame && (
        <div className="rounded-xl border border-court-orange/40 bg-bg-card p-6">
          <h3 className="text-lg font-semibold text-text-primary">
            Confirm Result
          </h3>
          <p className="mt-2 text-text-secondary">
            Set <span className="font-semibold text-court-orange">{confirmingGame.winnerName}</span>{" "}
            as the winner, defeating{" "}
            <span className="font-semibold text-text-primary">{confirmingGame.loserName}</span>?
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            This action cannot be undone.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={submitResult}
              disabled={submitting}
              className="rounded-lg bg-court-orange px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-court-orange/90 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Confirm"}
            </button>
            <button
              onClick={() => setConfirmingGame(null)}
              disabled={submitting}
              className="rounded-lg border border-white/10 px-5 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Games grouped by round */}
      {rounds.map((round) => {
        const roundGames = gamesByRound[round];
        const roundLabel = ROUND_LABELS[round as RoundNumber] ?? `Round ${round}`;
        const completedCount = roundGames.filter((g) => g.winner_id !== null).length;
        const totalCount = roundGames.length;

        return (
          <div key={round}>
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                {roundLabel}
              </h3>
              <span className="text-xs text-text-secondary">
                {completedCount}/{totalCount} completed
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {roundGames.map((game) => {
                const isComplete = game.winner_id !== null;
                const bothTeamsKnown =
                  game.team1 !== null && game.team2 !== null;

                return (
                  <div
                    key={game.id}
                    className={[
                      "overflow-hidden rounded-lg border",
                      isComplete
                        ? "border-white/5 bg-bg-card/40 opacity-50"
                        : "border-white/10 bg-bg-card",
                    ].join(" ")}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      Game {game.position}
                      {game.region ? ` - ${game.region}` : ""}
                      {isComplete && (
                        <span className="ml-2 text-green-400">Completed</span>
                      )}
                    </div>
                    <div className="border-t border-white/5">
                      <TeamButton
                        team={game.team1}
                        isWinner={game.winner_id === game.team1?.id}
                        isComplete={isComplete}
                        canClick={!isComplete && bothTeamsKnown && game.team1 !== null}
                        onClick={() => {
                          if (game.team1) handleTeamClick(game, game.team1.id);
                        }}
                      />
                      <div className="border-t border-white/5" />
                      <TeamButton
                        team={game.team2}
                        isWinner={game.winner_id === game.team2?.id}
                        isComplete={isComplete}
                        canClick={!isComplete && bothTeamsKnown && game.team2 !== null}
                        onClick={() => {
                          if (game.team2) handleTeamClick(game, game.team2.id);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TeamButton({
  team,
  isWinner,
  isComplete,
  canClick,
  onClick,
}: {
  team: { id: number; name: string; short_name: string; seed: number } | null;
  isWinner: boolean;
  isComplete: boolean;
  canClick: boolean;
  onClick: () => void;
}) {
  if (!team) {
    return (
      <div className="flex h-9 items-center gap-2 px-3 text-xs text-text-secondary italic">
        <span className="w-5 text-center text-[10px] opacity-50">--</span>
        TBD
      </div>
    );
  }

  const classes = [
    "flex h-9 w-full items-center gap-2 px-3 text-xs text-left transition-colors",
    isComplete && isWinner ? "bg-green-900/30 text-green-400 font-semibold" : "",
    isComplete && !isWinner ? "text-text-secondary line-through" : "",
    canClick
      ? "cursor-pointer hover:bg-court-orange/10 hover:text-court-orange"
      : "",
    !canClick && !isComplete ? "cursor-default" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={canClick ? onClick : undefined}
      disabled={!canClick}
    >
      <span className="w-5 shrink-0 text-center text-[10px] font-semibold text-text-secondary">
        {team.seed}
      </span>
      <span className="truncate">{team.short_name}</span>
      {isComplete && isWinner && (
        <span className="ml-auto shrink-0 text-green-400">W</span>
      )}
    </button>
  );
}
