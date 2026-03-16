"use client";

import { useState, useMemo } from "react";
import type {
  GameWithTeams,
  Team,
  BracketPick,
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

/**
 * Compute predicted matchups for every game by resolving feeder game picks,
 * and determine which teams have been eliminated from the tournament.
 */
function usePredictedBracket(games: GameWithTeams[], picks?: BracketPick[]) {
  return useMemo(() => {
    const predictedMatchups = new Map<number, { team1: Team | null; team2: Team | null }>();
    const eliminatedTeamIds = new Set<number>();

    if (!picks || picks.length === 0) {
      return { predictedMatchups, eliminatedTeamIds };
    }

    const picksByGameId = new Map<number, BracketPick>();
    for (const pick of picks) {
      picksByGameId.set(pick.game_id, pick);
    }

    // Eliminated = lost a completed game
    for (const game of games) {
      if (game.winner_id !== null) {
        if (game.team1_id !== null && game.team1_id !== game.winner_id) {
          eliminatedTeamIds.add(game.team1_id);
        }
        if (game.team2_id !== null && game.team2_id !== game.winner_id) {
          eliminatedTeamIds.add(game.team2_id);
        }
      }
    }

    // Resolve predicted teams for each game from feeder game picks
    for (const game of games) {
      let predTeam1: Team | null = game.team1;
      let predTeam2: Team | null = game.team2;

      if (!predTeam1 && game.feed_game_1_id) {
        const feederPick = picksByGameId.get(game.feed_game_1_id);
        predTeam1 = feederPick?.predicted_winner ?? null;
      }
      if (!predTeam2 && game.feed_game_2_id) {
        const feederPick = picksByGameId.get(game.feed_game_2_id);
        predTeam2 = feederPick?.predicted_winner ?? null;
      }

      predictedMatchups.set(game.id, { team1: predTeam1, team2: predTeam2 });
    }

    return { predictedMatchups, eliminatedTeamIds };
  }, [games, picks]);
}

/* ─── Region bracket (4 rounds) with absolute positioning + SVG connectors ─── */

const GAME_H = 42; // approximate rendered height of a game card
const GAME_W = 115; // matches w-[115px] in BracketGame
const COL_GAP = 20; // horizontal gap between round columns (connector space)
const R1_GAP = 4; // vertical gap between R1 games
const NUM_ROUNDS = 4;

interface RegionBracketProps {
  region: Region;
  rounds: Record<number, GameWithTeams[]>;
  picks?: BracketPick[];
  predictedMatchups: Map<number, { team1: Team | null; team2: Team | null }>;
  eliminatedTeamIds: Set<number>;
  showResults: boolean;
  leftToRight: boolean;
}

function RegionBracket({
  region,
  rounds,
  picks,
  predictedMatchups,
  eliminatedTeamIds,
  showResults,
  leftToRight,
}: RegionBracketProps) {
  const r1Count = rounds[1]?.length ?? 8;

  // Compute vertical positions: R1 evenly spaced, R2+ centered on feeder pairs
  const positions = useMemo(() => {
    const pos: Record<number, number[]> = {};
    pos[1] = Array.from({ length: r1Count }, (_, i) => i * (GAME_H + R1_GAP));
    for (let r = 2; r <= NUM_ROUNDS; r++) {
      const prev = pos[r - 1];
      pos[r] = [];
      for (let j = 0; j < Math.floor(prev.length / 2); j++) {
        const topCenter = prev[2 * j] + GAME_H / 2;
        const botCenter = prev[2 * j + 1] + GAME_H / 2;
        pos[r].push((topCenter + botCenter) / 2 - GAME_H / 2);
      }
    }
    return pos;
  }, [r1Count]);

  const totalHeight = r1Count * GAME_H + Math.max(0, r1Count - 1) * R1_GAP;
  const totalWidth = NUM_ROUNDS * GAME_W + (NUM_ROUNDS - 1) * COL_GAP;

  const colX = (round: number) => {
    const col = leftToRight ? round - 1 : NUM_ROUNDS - round;
    return col * (GAME_W + COL_GAP);
  };

  // Build SVG connector lines between rounds
  const connectorLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let r = 1; r < NUM_ROUNDS; r++) {
      const curr = positions[r] ?? [];
      const next = positions[r + 1] ?? [];

      const fromX = leftToRight ? colX(r) + GAME_W : colX(r);
      const toX = leftToRight ? colX(r + 1) : colX(r + 1) + GAME_W;
      const midX = (fromX + toX) / 2;

      for (let j = 0; j < next.length; j++) {
        if (2 * j + 1 >= curr.length) break;
        const topY = curr[2 * j] + GAME_H / 2;
        const botY = curr[2 * j + 1] + GAME_H / 2;
        const nextY = next[j] + GAME_H / 2;

        // Horizontal from each feeder game to the midpoint
        lines.push({ x1: fromX, y1: topY, x2: midX, y2: topY });
        lines.push({ x1: fromX, y1: botY, x2: midX, y2: botY });
        // Vertical connecting the pair
        lines.push({ x1: midX, y1: topY, x2: midX, y2: botY });
        // Horizontal from midpoint to the next round game
        lines.push({ x1: midX, y1: nextY, x2: toX, y2: nextY });
      }
    }
    return lines;
  }, [positions, leftToRight]);

  return (
    <div className="flex flex-col">
      <h3 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-court-orange">
        {REGION_NAMES[region]}
      </h3>
      <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
        {/* SVG connector lines */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={totalWidth}
          height={totalHeight}
        >
          {connectorLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
            />
          ))}
        </svg>

        {/* Game cards positioned absolutely */}
        {([1, 2, 3, 4] as RoundNumber[]).map((round) => {
          const gamesInRound = rounds[round] ?? [];
          const tops = positions[round] ?? [];
          return gamesInRound.map((game, i) => (
            <div
              key={game.id}
              className="absolute"
              style={{ left: colX(round), top: tops[i] }}
            >
              <BracketGame
                game={game}
                pick={pickForGame(picks, game.id)}
                predictedTeam1={predictedMatchups.get(game.id)?.team1}
                predictedTeam2={predictedMatchups.get(game.id)?.team2}
                eliminatedTeamIds={eliminatedTeamIds}
                showResult={showResults}
              />
            </div>
          ));
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
  predictedMatchups: Map<number, { team1: Team | null; team2: Team | null }>;
  eliminatedTeamIds: Set<number>;
  showResults: boolean;
}

function FinalFourColumn({
  finalFourGames,
  championshipGame,
  picks,
  predictedMatchups,
  eliminatedTeamIds,
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
            predictedTeam1={predictedMatchups.get(game.id)?.team1}
            predictedTeam2={predictedMatchups.get(game.id)?.team2}
            eliminatedTeamIds={eliminatedTeamIds}
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
              predictedTeam1={predictedMatchups.get(game.id)?.team1}
              predictedTeam2={predictedMatchups.get(game.id)?.team2}
              eliminatedTeamIds={eliminatedTeamIds}
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
  predictedMatchups: Map<number, { team1: Team | null; team2: Team | null }>;
  eliminatedTeamIds: Set<number>;
  showResults: boolean;
}

type MobileTab = Region | "finalfour";

function MobileBracket({
  regionGames,
  finalFourGames,
  championshipGame,
  picks,
  predictedMatchups,
  eliminatedTeamIds,
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
          predictedMatchups={predictedMatchups}
          eliminatedTeamIds={eliminatedTeamIds}
          showResults={showResults}
        />
      ) : (
        <MobileRegion
          region={activeTab}
          rounds={regionGames[activeTab]}
          picks={picks}
          predictedMatchups={predictedMatchups}
          eliminatedTeamIds={eliminatedTeamIds}
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
  predictedMatchups,
  eliminatedTeamIds,
  showResults,
}: {
  region: Region;
  rounds: Record<number, GameWithTeams[]>;
  picks?: BracketPick[];
  predictedMatchups: Map<number, { team1: Team | null; team2: Team | null }>;
  eliminatedTeamIds: Set<number>;
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
                  predictedTeam1={predictedMatchups.get(game.id)?.team1}
                  predictedTeam2={predictedMatchups.get(game.id)?.team2}
                  eliminatedTeamIds={eliminatedTeamIds}
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
  predictedMatchups: Map<number, { team1: Team | null; team2: Team | null }>;
  eliminatedTeamIds: Set<number>;
  showResults: boolean;
}

function DesktopBracket({
  regionGames,
  finalFourGames,
  championshipGame,
  picks,
  predictedMatchups,
  eliminatedTeamIds,
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
          predictedMatchups={predictedMatchups}
          eliminatedTeamIds={eliminatedTeamIds}
          showResults={showResults}
          leftToRight={true}
        />
        <RegionBracket
          region="midwest"
          rounds={regionGames.midwest}
          picks={picks}
          predictedMatchups={predictedMatchups}
          eliminatedTeamIds={eliminatedTeamIds}
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
          predictedMatchups={predictedMatchups}
          eliminatedTeamIds={eliminatedTeamIds}
          showResults={showResults}
        />
      </div>

      {/* Right half */}
      <div className="flex shrink-0 flex-col gap-6">
        <RegionBracket
          region="west"
          rounds={regionGames.west}
          picks={picks}
          predictedMatchups={predictedMatchups}
          eliminatedTeamIds={eliminatedTeamIds}
          showResults={showResults}
          leftToRight={false}
        />
        <RegionBracket
          region="south"
          rounds={regionGames.south}
          picks={picks}
          predictedMatchups={predictedMatchups}
          eliminatedTeamIds={eliminatedTeamIds}
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
  const { predictedMatchups, eliminatedTeamIds } =
    usePredictedBracket(games, picks);

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
          predictedMatchups={predictedMatchups}
          eliminatedTeamIds={eliminatedTeamIds}
          showResults={showResults}
        />
      </div>

      {/* Medium screens: 768–1280px — full bracket, compressed */}
      <div className="hidden md:block xl:hidden">
        <div className="origin-top-left scale-[0.8]">
          <DesktopBracket
            regionGames={regionGames}
            finalFourGames={finalFourGames}
            championshipGame={championshipGame}
            picks={picks}
            predictedMatchups={predictedMatchups}
            eliminatedTeamIds={eliminatedTeamIds}
            showResults={showResults}
          />
        </div>
      </div>

      {/* Large screens: > 1280px — full horizontal bracket */}
      <div className="hidden xl:block">
        <div>
          <DesktopBracket
            regionGames={regionGames}
            finalFourGames={finalFourGames}
            championshipGame={championshipGame}
            picks={picks}
            predictedMatchups={predictedMatchups}
            eliminatedTeamIds={eliminatedTeamIds}
            showResults={showResults}
          />
        </div>
      </div>
    </div>
  );
}
