"use client";

import Image from "next/image";
import type { GameWithTeams, BracketPick, Team } from "@/lib/types";
import { getTeamLogoPath } from "@/lib/team-logos";

interface BracketGameProps {
  game: GameWithTeams;
  pick: BracketPick | null;
  /** Predicted team for slot 1 (from feeder game pick) */
  predictedTeam1?: Team | null;
  /** Predicted team for slot 2 (from feeder game pick) */
  predictedTeam2?: Team | null;
  /** Teams that have been eliminated from the tournament */
  eliminatedTeamIds?: Set<number>;
  showResult: boolean;
}

function TeamRow({
  team,
  isPicked,
  isWinner,
  isCorrect,
  isIncorrect,
  isEliminated,
  showResult,
}: {
  team: Team | null;
  isPicked: boolean;
  isWinner: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  isEliminated: boolean;
  showResult: boolean;
}) {
  if (!team) {
    return (
      <div className="flex h-5 items-center gap-1 px-1.5 text-[11px] text-text-secondary">
        <span className="w-4 text-center text-[9px] opacity-50">--</span>
        <span className="truncate italic">TBD</span>
      </div>
    );
  }

  const rowClasses = [
    "flex h-5 items-center gap-1 px-1.5 text-[11px] transition-colors",
    isPicked ? "border-l-2 border-court-orange" : "border-l-2 border-transparent",
    isCorrect ? "bg-green-900/30" : "",
    isIncorrect ? "bg-red-900/30" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClasses}>
      <span className="w-4 shrink-0 text-center text-[9px] font-semibold text-text-secondary">
        {team.seed}
      </span>
      <Image
        src={getTeamLogoPath(team.short_name)}
        alt={team.short_name}
        width={14}
        height={14}
        className="shrink-0 [image-rendering:pixelated]"
        unoptimized
      />
      <span
        className={[
          "truncate font-medium",
          isIncorrect
            ? "text-red-400 line-through"
            : isEliminated
              ? "text-red-400/60 line-through"
              : "text-text-primary",
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
  predictedTeam1,
  predictedTeam2,
  eliminatedTeamIds,
  showResult,
}: BracketGameProps) {
  const winnerId = game.winner_id;
  const pickedWinnerId = pick?.predicted_winner_id ?? null;

  // Use predicted teams from feeder picks to fill TBD slots
  const displayTeam1 = game.team1 ?? predictedTeam1 ?? null;
  const displayTeam2 = game.team2 ?? predictedTeam2 ?? null;

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

  // A predicted team is "eliminated" if they lost in a prior round
  const team1IsEliminated = !!(displayTeam1 && !game.team1 && eliminatedTeamIds?.has(displayTeam1.id));
  const team2IsEliminated = !!(displayTeam2 && !game.team2 && eliminatedTeamIds?.has(displayTeam2.id));

  return (
    <div className="w-[144px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-bg-card">
      <TeamRow
        team={displayTeam1}
        isPicked={team1IsPicked}
        isWinner={team1IsWinner}
        isCorrect={team1IsCorrect}
        isIncorrect={team1IsIncorrect}
        isEliminated={team1IsEliminated}
        showResult={showResult}
      />
      <div className="border-t border-white/5" />
      <TeamRow
        team={displayTeam2}
        isPicked={team2IsPicked}
        isWinner={team2IsWinner}
        isCorrect={team2IsCorrect}
        isIncorrect={team2IsIncorrect}
        isEliminated={team2IsEliminated}
        showResult={showResult}
      />
    </div>
  );
}
