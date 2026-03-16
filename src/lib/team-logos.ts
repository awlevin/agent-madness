// Map from team short_name to logo filename
const TEAM_LOGO_MAP: Record<string, string> = {
  // EAST REGION
  "Duke": "duke.png",
  "UConn": "uconn.png",
  "Mich St": "mich-st.png",
  "Kansas": "kansas.png",
  "St John's": "st-johns.png",
  "Louisville": "louisville.png",
  "UCLA": "ucla.png",
  "Ohio St": "ohio-st.png",
  "TCU": "tcu.png",
  "UCF": "ucf.png",
  "USF": "usf.png",
  "N Iowa": "n-iowa.png",
  "Cal Baptist": "cal-baptist.png",
  "NDSU": "ndsu.png",
  "Furman": "furman.png",
  "Siena": "siena.png",
  // WEST REGION
  "Arizona": "arizona.png",
  "Purdue": "purdue.png",
  "Gonzaga": "gonzaga.png",
  "Arkansas": "arkansas.png",
  "Wisconsin": "wisconsin.png",
  "BYU": "byu.png",
  "Miami FL": "miami-fl.png",
  "Villanova": "villanova.png",
  "Utah St": "utah-st.png",
  "Missouri": "missouri.png",
  "Texas": "texas.png",
  "High Point": "high-point.png",
  "Hawaii": "hawaii.png",
  "Kennesaw St": "kennesaw-st.png",
  "Queens": "queens.png",
  "LIU": "liu.png",
  // MIDWEST REGION
  "Michigan": "michigan.png",
  "Iowa St": "iowa-st.png",
  "Virginia": "virginia.png",
  "Alabama": "alabama.png",
  "Texas Tech": "texas-tech.png",
  "Tennessee": "tennessee.png",
  "Kentucky": "kentucky.png",
  "Georgia": "georgia.png",
  "Saint Louis": "saint-louis.png",
  "Santa Clara": "santa-clara.png",
  "SMU": "smu.png",
  "Akron": "akron.png",
  "Hofstra": "hofstra.png",
  "Wright St": "wright-st.png",
  "Tenn St": "tenn-st.png",
  "UMBC": "umbc.png",
  // SOUTH REGION
  "Florida": "florida.png",
  "Houston": "houston.png",
  "Illinois": "illinois.png",
  "Nebraska": "nebraska.png",
  "Vanderbilt": "vanderbilt.png",
  "UNC": "unc.png",
  "St Mary's": "st-marys.png",
  "Clemson": "clemson.png",
  "Iowa": "iowa.png",
  "Texas A&M": "texas-am.png",
  "VCU": "vcu.png",
  "McNeese": "mcneese.png",
  "Troy": "troy.png",
  "Penn": "penn.png",
  "Idaho": "idaho.png",
  "PVAMU": "pvamu.png",
};

export function getTeamLogoPath(shortName: string): string {
  const filename = TEAM_LOGO_MAP[shortName];
  if (!filename) return '/team-logos/default.png';
  return `/team-logos/${filename}`;
}

export { TEAM_LOGO_MAP };
