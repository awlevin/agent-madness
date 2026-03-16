import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { Terminal } from "../components/Terminal";
import { FONT_PIXEL, FONT_BODY } from "../fonts";

const matchups = [
  { seed1: 1, team1: "Duke", seed2: 16, team2: "Siena", winner: "Duke", logo: "duke" },
  { seed1: 8, team1: "Ohio St", seed2: 9, team2: "TCU", winner: "TCU", logo: "tcu" },
  { seed1: 5, team1: "St John's", seed2: 12, team2: "N Iowa", winner: "St John's", logo: "st-johns" },
  { seed1: 4, team1: "Kansas", seed2: 13, team2: "Cal Baptist", winner: "Kansas", logo: "kansas" },
];

export const WalkthroughAnalyze: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDark,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Step label */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          fontFamily: FONT_PIXEL,
          fontSize: 16,
          color: COLORS.courtOrange,
          letterSpacing: "0.2em",
          textShadow: `0 0 10px ${COLORS.courtOrange}40`,
        }}
      >
        STEP 2: YOUR AGENT ANALYZES & PICKS
      </div>

      <div
        style={{
          display: "flex",
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        {/* Terminal on left */}
        <Terminal
          title="Terminal — agent running"
          style={{ width: 820 }}
          lines={[
            {
              text: "Analyzing 63 games across 6 rounds...",
              color: COLORS.textSecondary,
              delay: 0.2,
            },
            { text: "", delay: 0.6 },
            {
              text: "━━━ Round of 64 ━━━",
              color: COLORS.courtOrange,
              delay: 0.8,
            },
            {
              text: "(1) Duke vs (16) Siena",
              color: "#e0e0e0",
              delay: 1.2,
            },
            {
              text: "  → Duke (97% confidence)",
              color: COLORS.arcadeGreen,
              delay: 1.6,
            },
            {
              text: "(8) Ohio St vs (9) TCU",
              color: "#e0e0e0",
              delay: 2.2,
            },
            {
              text: "  → TCU (upset pick, 58%)",
              color: COLORS.arcadeYellow,
              delay: 2.6,
            },
            {
              text: "(5) St John's vs (12) N Iowa",
              color: "#e0e0e0",
              delay: 3.2,
            },
            {
              text: "  → St John's (72%)",
              color: COLORS.arcadeGreen,
              delay: 3.6,
            },
            {
              text: "(4) Kansas vs (13) Cal Baptist",
              color: "#e0e0e0",
              delay: 4.2,
            },
            {
              text: "  → Kansas (89%)",
              color: COLORS.arcadeGreen,
              delay: 4.6,
            },
            {
              text: "  ... picking 28 more games",
              color: COLORS.textSecondary,
              delay: 5.2,
            },
            { text: "", delay: 5.8 },
            {
              text: "━━━ Sweet 16 → Championship ━━━",
              color: COLORS.courtOrange,
              delay: 6.0,
            },
            {
              text: "  Championship: Duke vs Florida",
              color: "#e0e0e0",
              delay: 6.5,
            },
            {
              text: "  → Duke wins it all! 🏆",
              color: COLORS.arcadeGreen,
              delay: 7.0,
            },
          ]}
        />

        {/* Visual bracket picks on right */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 80,
          }}
        >
          <div
            style={{
              fontFamily: FONT_PIXEL,
              fontSize: 14,
              color: COLORS.textSecondary,
              marginBottom: 8,
            }}
          >
            EAST REGION
          </div>
          {matchups.map((m, i) => {
            const delay = Math.floor(1.2 * fps + i * 0.8 * fps);
            const cardScale = spring({
              frame: frame - delay,
              fps,
              config: { damping: 200 },
            });

            const winnerDelay = delay + Math.floor(0.4 * fps);
            const checkOpacity = interpolate(
              frame,
              [winnerDelay, winnerDelay + 8],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  opacity: cardScale,
                  transform: `scale(${cardScale})`,
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.textSecondary}30`,
                  borderRadius: 8,
                  padding: "10px 16px",
                  width: 380,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Img
                  src={staticFile(`team-logos/${m.logo}.png`)}
                  style={{ width: 32, height: 32, imageRendering: "pixelated" }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: 16,
                      color: COLORS.textPrimary,
                    }}
                  >
                    <span style={{ color: COLORS.textSecondary }}>({m.seed1})</span>{" "}
                    {m.team1}{" "}
                    <span style={{ color: COLORS.textSecondary }}>vs</span>{" "}
                    <span style={{ color: COLORS.textSecondary }}>({m.seed2})</span>{" "}
                    {m.team2}
                  </div>
                </div>
                <div
                  style={{
                    opacity: checkOpacity,
                    fontFamily: FONT_PIXEL,
                    fontSize: 12,
                    color: COLORS.arcadeGreen,
                  }}
                >
                  {"✓ " + m.winner}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
