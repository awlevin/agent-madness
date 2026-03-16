"use client";

import Image from "next/image";

const TEAMS = [
  { name: "Duke", color: "#003087", espnId: 150 },
  { name: "UConn", color: "#000E2F", espnId: 41 },
  { name: "Mich St", color: "#18453B", espnId: 127 },
  { name: "Kansas", color: "#0051BA", espnId: 2305 },
  { name: "Marquette", color: "#003366", espnId: 269 },
  { name: "Clemson", color: "#F56600", espnId: 228 },
  { name: "St Mary's", color: "#D50032", espnId: 2608 },
  { name: "Ole Miss", color: "#CE1126", espnId: 145 },
  { name: "Creighton", color: "#005CA9", espnId: 156 },
  { name: "New Mexico", color: "#BA0C2F", espnId: 167 },
  { name: "Drake", color: "#004477", espnId: 2181 },
  { name: "UCSD", color: "#182B49", espnId: 28 },
  { name: "Yale", color: "#00356B", espnId: 43 },
  { name: "Lipscomb", color: "#461D7C", espnId: 288 },
  { name: "Troy", color: "#8B2332", espnId: 2653 },
  { name: "American", color: "#CC0000", espnId: 44 },
  { name: "Arizona", color: "#CC0033", espnId: 12 },
  { name: "Iowa St", color: "#C8102E", espnId: 66 },
  { name: "Wisconsin", color: "#C5050C", espnId: 275 },
  { name: "Purdue", color: "#CEB888", espnId: 2509 },
  { name: "Oregon", color: "#154733", espnId: 2483 },
  { name: "Illinois", color: "#E84A27", espnId: 356 },
  { name: "UCLA", color: "#2D68C4", espnId: 26 },
  { name: "Gonzaga", color: "#002967", espnId: 2250 },
  { name: "Baylor", color: "#154734", espnId: 239 },
  { name: "VCU", color: "#F8B800", espnId: 2670 },
  { name: "UNC", color: "#7BAFD4", espnId: 153 },
  { name: "Liberty", color: "#002D62", espnId: 2335 },
  { name: "High Point", color: "#330072", espnId: 2272 },
  { name: "Montana", color: "#6F2C3F", espnId: 149 },
  { name: "Omaha", color: "#000000", espnId: 2437 },
  { name: "Norfolk St", color: "#007A53", espnId: 2450 },
  { name: "Michigan", color: "#FFCB05", espnId: 130 },
  { name: "Houston", color: "#C8102E", espnId: 248 },
  { name: "Texas Tech", color: "#CC0000", espnId: 2641 },
  { name: "Maryland", color: "#E03A3E", espnId: 120 },
  { name: "Memphis", color: "#003087", espnId: 235 },
  { name: "Missouri", color: "#F1B82D", espnId: 142 },
  { name: "Miss St", color: "#660000", espnId: 344 },
  { name: "Louisville", color: "#AD0000", espnId: 97 },
  { name: "Georgia", color: "#BA0C2F", espnId: 61 },
  { name: "Xavier", color: "#0C2340", espnId: 2752 },
  { name: "SDSU", color: "#A6192E", espnId: 21 },
  { name: "McNeese", color: "#005DAA", espnId: 2377 },
  { name: "Vermont", color: "#154734", espnId: 261 },
  { name: "GCU", color: "#522398", espnId: 2253 },
  { name: "Wofford", color: "#886B3D", espnId: 2747 },
  { name: "FDU", color: "#003366", espnId: 161 },
  { name: "Florida", color: "#0021A5", espnId: 57 },
  { name: "Auburn", color: "#DD550C", espnId: 2 },
  { name: "Tennessee", color: "#FF8200", espnId: 2633 },
  { name: "Alabama", color: "#9E1B32", espnId: 333 },
  { name: "St John's", color: "#D0202F", espnId: 2599 },
  { name: "BYU", color: "#002E5D", espnId: 252 },
  { name: "Texas A&M", color: "#500000", espnId: 245 },
  { name: "Pitt", color: "#003594", espnId: 221 },
  { name: "Arkansas", color: "#9D2235", espnId: 8 },
  { name: "Utah St", color: "#0F2439", espnId: 328 },
  { name: "SMU", color: "#CC0000", espnId: 2567 },
  { name: "CSU", color: "#1E4D2B", espnId: 36 },
  { name: "Akron", color: "#041E42", espnId: 2006 },
  { name: "Colgate", color: "#862633", espnId: 2142 },
  { name: "RMU", color: "#003876", espnId: 2523 },
  { name: "SEMO", color: "#C8102E", espnId: 2546 },
];

function TeamBadge({ team }: { team: (typeof TEAMS)[0] }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 shrink-0">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/10"
        style={{
          boxShadow: `0 0 12px ${team.color}66`,
        }}
      >
        <Image
          src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${team.espnId}.png`}
          alt={team.name}
          width={40}
          height={40}
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
