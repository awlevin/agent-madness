"use client";

import type { GameWithTeams, Pick as BracketPick, Team } from "@/lib/types";

interface BracketGameProps {
  game: GameWithTeams;
  pick: BracketPick | null;
  showResult: boolean;
}

function TeamRow({
  team,
  isPicked,
  isWinner,
  isCorrect,
  isIncorrect,
  showResult,
}: {
  team: Team | null;
  isPicked: boolean;
  isWinner: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  showResult: boolean;
}) {
  if (!team) {
    return (
      <div className="flex h-6 items-center gap-1.5 px-2 text-xs text-text-secondary">
        <span className="w-5 text-center text-[10px] opacity-50">--</span>
        <span className="truncate italic">TBD</span>
      </div>
    );
  }

  const rowClasses = [
    "flex h-6 items-center gap-1.5 px-2 text-xs transition-colors",
    isPicked ? "border-l-2 border-court-orange" : "border-l-2 border-transparent",
    isCorrect ? "bg-green-900/30" : "",
    isIncorrect ? "bg-red-900/30" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClasses}>
      <span className="w-5 shrink-0 text-center text-[10px] font-semibold text-text-secondary">
        {team.seed}
      </span>
      <span
        className={[
          "truncate font-medium",
          isIncorrect ? "text-red-400 line-through" : "text-text-primary",
        ].join(" ")}
      >
        {team.short_name}
      </span>
      {showResult && isWinner && (
        <span className="ml-auto shrink-0 text-green-400" title="Winner">
          ✓
        </span>
      )}
    </div>
  );
}

export default function BracketGame({
  game,
  pick,
  showResult,
}: BracketGameProps) {
  const winnerId = game.winner_id;
  const pickedWinnerId = pick?.predicted_winner_id ?? null;

  const team1IsPicked = pickedWinnerId !== null && pickedWinnerId === game.team1?.id;
  const team2IsPicked = pickedWinnerId !== null && pickedWinnerId === game.team2?.id;

  const team1IsWinner = winnerId !== null && winnerId === game.team1?.id;
  const team2IsWinner = winnerId !== null && winnerId === game.team2?.id;

  const team1IsCorrect = showResult && team1IsPicked && team1IsWinner;
  const team2IsCorrect = showResult && team2IsPicked && team2IsWinner;

  const team1IsIncorrect =
    showResult && team1IsPicked && winnerId !== null && !team1IsWinner;
  const team2IsIncorrect =
    showResult && team2IsPicked && winnerId !== null && !team2IsWinner;

  return (
    <div className="w-[180px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-bg-card">
      <TeamRow
        team={game.team1}
        isPicked={team1IsPicked}
        isWinner={team1IsWinner}
        isCorrect={team1IsCorrect}
        isIncorrect={team1IsIncorrect}
        showResult={showResult}
      />
      <div className="border-t border-white/5" />
      <TeamRow
        team={game.team2}
        isPicked={team2IsPicked}
        isWinner={team2IsWinner}
        isCorrect={team2IsCorrect}
        isIncorrect={team2IsIncorrect}
        showResult={showResult}
      />
    </div>
  );
}
