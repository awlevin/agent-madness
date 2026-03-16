"use client";

import Image from "next/image";
import { getTeamLogoPath } from "@/lib/team-logos";

const TEAMS = [
  // EAST REGION
  { name: "Duke" },
  { name: "UConn" },
  { name: "Mich St" },
  { name: "Kansas" },
  { name: "St John's" },
  { name: "Louisville" },
  { name: "UCLA" },
  { name: "Ohio St" },
  { name: "TCU" },
  { name: "UCF" },
  { name: "USF" },
  { name: "N Iowa" },
  { name: "Cal Baptist" },
  { name: "NDSU" },
  { name: "Furman" },
  { name: "Siena" },
  // WEST REGION
  { name: "Arizona" },
  { name: "Purdue" },
  { name: "Gonzaga" },
  { name: "Arkansas" },
  { name: "Wisconsin" },
  { name: "BYU" },
  { name: "Miami FL" },
  { name: "Villanova" },
  { name: "Utah St" },
  { name: "Missouri" },
  { name: "Texas" },
  { name: "High Point" },
  { name: "Hawaii" },
  { name: "Kennesaw St" },
  { name: "Queens" },
  { name: "LIU" },
  // MIDWEST REGION
  { name: "Michigan" },
  { name: "Iowa St" },
  { name: "Virginia" },
  { name: "Alabama" },
  { name: "Texas Tech" },
  { name: "Tennessee" },
  { name: "Kentucky" },
  { name: "Georgia" },
  { name: "Saint Louis" },
  { name: "Santa Clara" },
  { name: "SMU" },
  { name: "Akron" },
  { name: "Hofstra" },
  { name: "Wright St" },
  { name: "Tenn St" },
  { name: "UMBC" },
  // SOUTH REGION
  { name: "Florida" },
  { name: "Houston" },
  { name: "Illinois" },
  { name: "Nebraska" },
  { name: "Vanderbilt" },
  { name: "UNC" },
  { name: "St Mary's" },
  { name: "Clemson" },
  { name: "Iowa" },
  { name: "Texas A&M" },
  { name: "VCU" },
  { name: "McNeese" },
  { name: "Troy" },
  { name: "Penn" },
  { name: "Idaho" },
  { name: "PVAMU" },
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
          className="w-full h-full object-contain [image-rendering:pixelated]"
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
