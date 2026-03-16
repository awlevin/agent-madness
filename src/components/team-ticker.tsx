"use client";

const TEAMS = [
  { name: "Duke", color: "#003087" },
  { name: "UConn", color: "#000E2F" },
  { name: "Mich St", color: "#18453B" },
  { name: "Kansas", color: "#0051BA" },
  { name: "Marquette", color: "#003366" },
  { name: "Clemson", color: "#F56600" },
  { name: "St Mary's", color: "#D50032" },
  { name: "Ole Miss", color: "#CE1126" },
  { name: "Creighton", color: "#005CA9" },
  { name: "New Mexico", color: "#BA0C2F" },
  { name: "Drake", color: "#004477" },
  { name: "UCSD", color: "#182B49" },
  { name: "Yale", color: "#00356B" },
  { name: "Lipscomb", color: "#461D7C" },
  { name: "Troy", color: "#8B2332" },
  { name: "American", color: "#CC0000" },
  { name: "Arizona", color: "#CC0033" },
  { name: "Iowa St", color: "#C8102E" },
  { name: "Wisconsin", color: "#C5050C" },
  { name: "Purdue", color: "#CEB888" },
  { name: "Oregon", color: "#154733" },
  { name: "Illinois", color: "#E84A27" },
  { name: "UCLA", color: "#2D68C4" },
  { name: "Gonzaga", color: "#002967" },
  { name: "Baylor", color: "#154734" },
  { name: "VCU", color: "#F8B800" },
  { name: "UNC", color: "#7BAFD4" },
  { name: "Liberty", color: "#002D62" },
  { name: "High Point", color: "#330072" },
  { name: "Montana", color: "#6F2C3F" },
  { name: "Omaha", color: "#000000" },
  { name: "Norfolk St", color: "#007A53" },
  { name: "Michigan", color: "#FFCB05" },
  { name: "Houston", color: "#C8102E" },
  { name: "Texas Tech", color: "#CC0000" },
  { name: "Maryland", color: "#E03A3E" },
  { name: "Memphis", color: "#003087" },
  { name: "Missouri", color: "#F1B82D" },
  { name: "Miss St", color: "#660000" },
  { name: "Louisville", color: "#AD0000" },
  { name: "Georgia", color: "#BA0C2F" },
  { name: "Xavier", color: "#0C2340" },
  { name: "SDSU", color: "#A6192E" },
  { name: "McNeese", color: "#005DAA" },
  { name: "Vermont", color: "#154734" },
  { name: "GCU", color: "#522398" },
  { name: "Wofford", color: "#886B3D" },
  { name: "FDU", color: "#003366" },
  { name: "Florida", color: "#0021A5" },
  { name: "Auburn", color: "#DD550C" },
  { name: "Tennessee", color: "#FF8200" },
  { name: "Alabama", color: "#9E1B32" },
  { name: "St John's", color: "#D0202F" },
  { name: "BYU", color: "#002E5D" },
  { name: "Texas A&M", color: "#500000" },
  { name: "Pitt", color: "#003594" },
  { name: "Arkansas", color: "#9D2235" },
  { name: "Utah St", color: "#0F2439" },
  { name: "SMU", color: "#CC0000" },
  { name: "CSU", color: "#1E4D2B" },
  { name: "Akron", color: "#041E42" },
  { name: "Colgate", color: "#862633" },
  { name: "RMU", color: "#003876" },
  { name: "SEMO", color: "#C8102E" },
];

function TeamBadge({ team }: { team: (typeof TEAMS)[0] }) {
  const initials = team.name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 shrink-0">
      <div
        className="w-8 h-8 rounded-sm flex items-center justify-center text-white font-bold pixel-render"
        style={{
          backgroundColor: team.color,
          boxShadow: `0 0 8px ${team.color}44`,
          fontSize: "9px",
          letterSpacing: "-0.5px",
        }}
      >
        {initials}
      </div>
      <span className="text-xs text-text-secondary whitespace-nowrap font-mono">
        {team.name}
      </span>
    </div>
  );
}

export default function TeamTicker() {
  const row1 = TEAMS.slice(0, 32);
  const row2 = TEAMS.slice(32, 64);

  return (
    <div className="overflow-hidden py-2 space-y-2 group">
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
