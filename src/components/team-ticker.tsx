"use client";

import Image from "next/image";
import { getTeamLogoPath } from "@/lib/team-logos";

const TEAMS = [
  // EAST REGION
  { name: "Duke", espnId: 150 },
  { name: "UConn", espnId: 41 },
  { name: "Mich St", espnId: 127 },
  { name: "Kansas", espnId: 2305 },
  { name: "St John's", espnId: 2599 },
  { name: "Louisville", espnId: 97 },
  { name: "UCLA", espnId: 26 },
  { name: "Ohio St", espnId: 194 },
  { name: "TCU", espnId: 2628 },
  { name: "UCF", espnId: 2116 },
  { name: "USF", espnId: 58 },
  { name: "N Iowa", espnId: 2460 },
  { name: "Cal Baptist", espnId: 2856 },
  { name: "NDSU", espnId: 2449 },
  { name: "Furman", espnId: 231 },
  { name: "Siena", espnId: 2561 },
  // WEST REGION
  { name: "Arizona", espnId: 12 },
  { name: "Purdue", espnId: 2509 },
  { name: "Gonzaga", espnId: 2250 },
  { name: "Arkansas", espnId: 8 },
  { name: "Wisconsin", espnId: 275 },
  { name: "BYU", espnId: 252 },
  { name: "Miami FL", espnId: 2390 },
  { name: "Villanova", espnId: 222 },
  { name: "Utah St", espnId: 328 },
  { name: "Missouri", espnId: 142 },
  { name: "Texas", espnId: 251 },
  { name: "High Point", espnId: 2272 },
  { name: "Hawaii", espnId: 62 },
  { name: "Kennesaw St", espnId: 338 },
  { name: "Queens", espnId: 2511 },
  { name: "LIU", espnId: 2344 },
  // MIDWEST REGION
  { name: "Michigan", espnId: 130 },
  { name: "Iowa St", espnId: 66 },
  { name: "Virginia", espnId: 258 },
  { name: "Alabama", espnId: 333 },
  { name: "Texas Tech", espnId: 2641 },
  { name: "Tennessee", espnId: 2633 },
  { name: "Kentucky", espnId: 96 },
  { name: "Georgia", espnId: 61 },
  { name: "Saint Louis", espnId: 139 },
  { name: "Santa Clara", espnId: 2541 },
  { name: "SMU", espnId: 2567 },
  { name: "Akron", espnId: 2006 },
  { name: "Hofstra", espnId: 2275 },
  { name: "Wright St", espnId: 2750 },
  { name: "Tenn St", espnId: 2634 },
  { name: "UMBC", espnId: 2378 },
  // SOUTH REGION
  { name: "Florida", espnId: 57 },
  { name: "Houston", espnId: 248 },
  { name: "Illinois", espnId: 356 },
  { name: "Nebraska", espnId: 158 },
  { name: "Vanderbilt", espnId: 238 },
  { name: "UNC", espnId: 153 },
  { name: "St Mary's", espnId: 2608 },
  { name: "Clemson", espnId: 228 },
  { name: "Iowa", espnId: 2294 },
  { name: "Texas A&M", espnId: 245 },
  { name: "VCU", espnId: 2670 },
  { name: "McNeese", espnId: 2377 },
  { name: "Troy", espnId: 2653 },
  { name: "Penn", espnId: 219 },
  { name: "Idaho", espnId: 70 },
  { name: "PVAMU", espnId: 2504 },
];

function TeamBadge({ team }: { team: (typeof TEAMS)[0] }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 shrink-0">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/10 p-1.5"
      >
        <Image
          src={getTeamLogoPath(team.name)}
          alt={team.name}
          width={28}
          height={28}
          className="w-full h-full object-contain"
          unoptimized
        />
      </div>
      <span className="text-xs text-text-primary whitespace-nowrap font-[family-name:var(--font-pixel)] text-[8px]">
        {team.name}
      </span>
    </div>
  );
}

export default function TeamTicker() {
  const row1 = TEAMS.slice(0, 32);
  const row2 = TEAMS.slice(32, 64);

  return (
    <div className="overflow-hidden py-2 space-y-3 group">
      <div
        className="flex animate-marquee-left"
        style={{ width: "max-content" }}
      >
        {[...row1, ...row1].map((team, i) => (
          <TeamBadge key={`r1-${i}`} team={team} />
        ))}
      </div>
      <div
        className="flex animate-marquee-right"
        style={{ width: "max-content" }}
      >
        {[...row2, ...row2].map((team, i) => (
          <TeamBadge key={`r2-${i}`} team={team} />
        ))}
      </div>
    </div>
  );
}
