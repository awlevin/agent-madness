"use client";

import Image from "next/image";
import type { GameWithTeams, BracketPick, Team } from "@/lib/types";
import { getTeamLogoPath } from "@/lib/team-logos";

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
      <Image
        src={getTeamLogoPath(team.short_name)}
        alt={team.short_name}
        width={16}
        height={16}
        className="shrink-0 [image-rendering:pixelated]"
        unoptimized
      />
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
  const predictedWinner = pick?.predicted_winner ?? null;

  // Fill in TBD slots with the predicted winner so picks are visible
  // before matchups are determined
  let displayTeam1 = game.team1;
  let displayTeam2 = game.team2;
  if (predictedWinner) {
    if (!displayTeam1 && !displayTeam2) {
      displayTeam1 = predictedWinner;
    } else if (displayTeam1 && !displayTeam2 && pickedWinnerId !== displayTeam1.id) {
      displayTeam2 = predictedWinner;
    } else if (!displayTeam1 && displayTeam2 && pickedWinnerId !== displayTeam2.id) {
      displayTeam1 = predictedWinner;
    }
  }

  const team1IsPicked = pickedWinnerId !== null && pickedWinnerId === displayTeam1?.id;
  const team2IsPicked = pickedWinnerId !== null && pickedWinnerId === displayTeam2?.id;

  const team1IsWinner = winnerId !== null && winnerId === displayTeam1?.id;
  const team2IsWinner = winnerId !== null && winnerId === displayTeam2?.id;

  const team1IsCorrect = showResult && team1IsPicked && team1IsWinner;
  const team2IsCorrect = showResult && team2IsPicked && team2IsWinner;

  const team1IsIncorrect =
    showResult && team1IsPicked && winnerId !== null && !team1IsWinner;
  const team2IsIncorrect =
    showResult && team2IsPicked && winnerId !== null && !team2IsWinner;

  return (
    <div className="w-[180px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-bg-card">
      <TeamRow
        team={displayTeam1}
        isPicked={team1IsPicked}
        isWinner={team1IsWinner}
        isCorrect={team1IsCorrect}
        isIncorrect={team1IsIncorrect}
        showResult={showResult}
      />
      <div className="border-t border-white/5" />
      <TeamRow
        team={displayTeam2}
        isPicked={team2IsPicked}
        isWinner={team2IsWinner}
        isCorrect={team2IsCorrect}
        isIncorrect={team2IsIncorrect}
        showResult={showResult}
      />
    </div>
  );
}
