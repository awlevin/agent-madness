"use client";

import { useState, useMemo } from "react";
import type {
  GameWithTeams,
  Team,
  Pick as BracketPick,
  Region,
  RoundNumber,
} from "@/lib/types";
import { REGION_NAMES } from "@/lib/constants";
import BracketGame from "./bracket-game";

interface BracketViewerProps {
  games: GameWithTeams[];
  teams: Team[];
  picks?: BracketPick[];
  showResults?: boolean;
}

/**
 * Organize games by region and round for bracket layout.
 */
function useOrganizedGames(games: GameWithTeams[]) {
  return useMemo(() => {
    const regionGames: Record<Region, Record<number, GameWithTeams[]>> = {
      east: {},
      west: {},
      midwest: {},
      south: {},
    };
    const finalFourGames: GameWithTeams[] = [];
    const championshipGame: GameWithTeams[] = [];

    for (const game of games) {
      if (game.round === 5) {
        finalFourGames.push(game);
      } else if (game.round === 6) {
        championshipGame.push(game);
      } else if (game.region) {
        const region = game.region;
        if (!regionGames[region][game.round]) {
          regionGames[region][game.round] = [];
        }
        regionGames[region][game.round].push(game);
      }
    }

    // Sort games within each round by position
    for (const region of Object.keys(regionGames) as Region[]) {
      for (const round of Object.keys(regionGames[region])) {
        regionGames[region][Number(round)].sort(
          (a, b) => a.position - b.position
        );
      }
    }
    finalFourGames.sort((a, b) => a.position - b.position);

    return { regionGames, finalFourGames, championshipGame };
  }, [games]);
}

function pickForGame(
  picks: BracketPick[] | undefined,
  gameId: number
): BracketPick | null {
  if (!picks) return null;
  return picks.find((p) => p.game_id === gameId) ?? null;
}

/* ─── Region bracket (4 rounds) ─── */

interface RegionBracketProps {
  region: Region;
  rounds: Record<number, GameWithTeams[]>;
  picks?: BracketPick[];
  showResults: boolean;
  /** If true, columns go R1 left -> R4 right (left half).
   *  If false, columns go R4 left -> R1 right (right half). */
  leftToRight: boolean;
}

function RegionBracket({
  region,
  rounds,
  picks,
  showResults,
  leftToRight,
}: RegionBracketProps) {
  const roundOrder: RoundNumber[] = leftToRight
    ? [1, 2, 3, 4]
    : [4, 3, 2, 1];

  return (
    <div className="flex flex-col">
      <h3 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-court-orange">
        {REGION_NAMES[region]}
      </h3>
      <div className="flex items-center gap-1">
        {roundOrder.map((round) => {
          const gamesInRound = rounds[round] ?? [];
          // Vertical spacing increases each round so games align with feeders
          const gapClass = round === 1
            ? "gap-1"
            : round === 2
              ? "gap-[52px]"
              : round === 3
                ? "gap-[156px]"
                : "gap-0";

          return (
            <div key={round} className="flex flex-col items-center">
              <div className={`flex flex-col justify-center ${gapClass}`}>
                {gamesInRound.map((game) => (
                  <div key={game.id} className="relative flex items-center">
                    {/* Connector line coming in from the previous round */}
                    {round > 1 && (
                      <div
                        className={`absolute top-1/2 h-px w-2 bg-white/20 ${
                          leftToRight ? "-left-2" : "-right-2"
                        }`}
                      />
                    )}
                    {/* Connector line going out to the next round */}
                    {round < 4 && (
                      <div
                        className={`absolute top-1/2 h-px w-2 bg-white/20 ${
                          leftToRight ? "-right-2" : "-left-2"
                        }`}
                      />
                    )}
                    <BracketGame
                      game={game}
                      pick={pickForGame(picks, game.id)}
                      showResult={showResults}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Final Four center column ─── */

interface FinalFourProps {
  finalFourGames: GameWithTeams[];
  championshipGame: GameWithTeams[];
  picks?: BracketPick[];
  showResults: boolean;
}

function FinalFourColumn({
  finalFourGames,
  championshipGame,
  picks,
  showResults,
}: FinalFourProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-court-orange">
        Final Four
      </h3>
      <div className="flex flex-col items-center gap-8">
        {finalFourGames.map((game) => (
          <BracketGame
            key={game.id}
            game={game}
            pick={pickForGame(picks, game.id)}
            showResult={showResults}
          />
        ))}
      </div>
      {championshipGame.length > 0 && (
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-court-orange">
            Championship
          </h3>
          {championshipGame.map((game) => (
            <BracketGame
              key={game.id}
              game={game}
              pick={pickForGame(picks, game.id)}
              showResult={showResults}
            />
          ))}
        </>
      )}
    </div>
  );
}

/* ─── Mobile region tab view ─── */

interface MobileBracketProps {
  regionGames: Record<Region, Record<number, GameWithTeams[]>>;
  finalFourGames: GameWithTeams[];
  championshipGame: GameWithTeams[];
  picks?: BracketPick[];
  showResults: boolean;
}

type MobileTab = Region | "finalfour";

function MobileBracket({
  regionGames,
  finalFourGames,
  championshipGame,
  picks,
  showResults,
}: MobileBracketProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>("east");

  const tabs: { key: MobileTab; label: string }[] = [
    { key: "east", label: "East" },
    { key: "west", label: "West" },
    { key: "midwest", label: "Midwest" },
    { key: "south", label: "South" },
    { key: "finalfour", label: "Final 4" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-court-orange text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "finalfour" ? (
        <FinalFourColumn
          finalFourGames={finalFourGames}
          championshipGame={championshipGame}
          picks={picks}
          showResults={showResults}
        />
      ) : (
        <MobileRegion
          region={activeTab}
          rounds={regionGames[activeTab]}
          picks={picks}
          showResults={showResults}
        />
      )}
    </div>
  );
}

function MobileRegion({
  region,
  rounds,
  picks,
  showResults,
}: {
  region: Region;
  rounds: Record<number, GameWithTeams[]>;
  picks?: BracketPick[];
  showResults: boolean;
}) {
  const roundNumbers: RoundNumber[] = [1, 2, 3, 4];
  const roundNames: Record<number, string> = {
    1: "Round of 64",
    2: "Round of 32",
    3: "Sweet 16",
    4: "Elite 8",
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-court-orange">
        {REGION_NAMES[region]}
      </h3>
      {roundNumbers.map((round) => {
        const gamesInRound = rounds[round] ?? [];
        if (gamesInRound.length === 0) return null;
        return (
          <div key={round} className="flex flex-col gap-2">
            <h4 className="text-xs font-medium text-text-secondary">
              {roundNames[round]}
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {gamesInRound.map((game) => (
                <BracketGame
                  key={game.id}
                  game={game}
                  pick={pickForGame(picks, game.id)}
                  showResult={showResults}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Desktop full bracket layout ─── */

interface DesktopBracketProps {
  regionGames: Record<Region, Record<number, GameWithTeams[]>>;
  finalFourGames: GameWithTeams[];
  championshipGame: GameWithTeams[];
  picks?: BracketPick[];
  showResults: boolean;
}

function DesktopBracket({
  regionGames,
  finalFourGames,
  championshipGame,
  picks,
  showResults,
}: DesktopBracketProps) {
  // Left half: East (top) and Midwest (bottom) — R1 on far left
  // Right half: West (top) and South (bottom) — R1 on far right
  return (
    <div className="flex items-center gap-2">
      {/* Left half */}
      <div className="flex shrink-0 flex-col gap-6">
        <RegionBracket
          region="east"
          rounds={regionGames.east}
          picks={picks}
          showResults={showResults}
          leftToRight={true}
        />
        <RegionBracket
          region="midwest"
          rounds={regionGames.midwest}
          picks={picks}
          showResults={showResults}
          leftToRight={true}
        />
      </div>

      {/* Center — Final Four + Championship */}
      <div className="shrink-0 px-4">
        <FinalFourColumn
          finalFourGames={finalFourGames}
          championshipGame={championshipGame}
          picks={picks}
          showResults={showResults}
        />
      </div>

      {/* Right half */}
      <div className="flex shrink-0 flex-col gap-6">
        <RegionBracket
          region="west"
          rounds={regionGames.west}
          picks={picks}
          showResults={showResults}
          leftToRight={false}
        />
        <RegionBracket
          region="south"
          rounds={regionGames.south}
          picks={picks}
          showResults={showResults}
          leftToRight={false}
        />
      </div>
    </div>
  );
}

/* ─── Main BracketViewer ─── */

export default function BracketViewer({
  games,
  teams: _teams,
  picks,
  showResults = false,
}: BracketViewerProps) {
  const { regionGames, finalFourGames, championshipGame } =
    useOrganizedGames(games);

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-text-secondary">
        <p>No bracket data available yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile: < 768px — tabbed region view */}
      <div className="block md:hidden">
        <MobileBracket
          regionGames={regionGames}
          finalFourGames={finalFourGames}
          championshipGame={championshipGame}
          picks={picks}
          showResults={showResults}
        />
      </div>

      {/* Medium screens: 768–1280px — full bracket, compressed */}
      <div className="hidden md:block xl:hidden">
        <div className="origin-top-left scale-[0.8] overflow-x-auto">
          <DesktopBracket
            regionGames={regionGames}
            finalFourGames={finalFourGames}
            championshipGame={championshipGame}
            picks={picks}
            showResults={showResults}
          />
        </div>
      </div>

      {/* Large screens: > 1280px — full horizontal bracket */}
      <div className="hidden xl:block">
        <div className="overflow-x-auto">
          <DesktopBracket
            regionGames={regionGames}
            finalFourGames={finalFourGames}
            championshipGame={championshipGame}
            picks={picks}
            showResults={showResults}
          />
        </div>
      </div>
    </div>
  );
}
