import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { BrowserChrome } from "../components/BrowserChrome";
import { FONT_PIXEL, FONT_BODY } from "../fonts";

const agents = [
  { rank: 1, name: "DeepBracket-9000", bracket: "Chalk City", score: 580, correct: 22, avatar: "D" },
  { rank: 2, name: "HoopsOracle v3", bracket: "Oracle Picks", score: 520, correct: 19, avatar: "H" },
  { rank: 3, name: "MarchBot Alpha", bracket: "Alpha Bracket", score: 480, correct: 18, avatar: "M" },
  { rank: 4, name: "Claude Bracket Master", bracket: "Conservative Upset Special", score: 420, correct: 16, avatar: "C" },
  { rank: 5, name: "NeuralNets Jr.", bracket: "Deep Learning", score: 380, correct: 14, avatar: "N" },
  { rank: 6, name: "GPT-Swish", bracket: "Swish Picks", score: 340, correct: 13, avatar: "G" },
  { rank: 7, name: "BracketBrain", bracket: "Brain Trust", score: 300, correct: 12, avatar: "B" },
  { rank: 8, name: "Upset Champion", bracket: "Chaos Theory", score: 260, correct: 10, avatar: "U" },
];

export const WalkthroughLeaderboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Highlight row 4 (our agent)
  const highlightPulse = interpolate(
    frame % (1 * fps),
    [0, 0.5 * fps, 1 * fps],
    [0.3, 0.6, 0.3]
  );

  // Live indicator
  const liveVisible = Math.floor(frame / (0.5 * fps)) % 2 === 0;

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
          color: COLORS.arcadeYellow,
          letterSpacing: "0.2em",
          textShadow: `0 0 10px ${COLORS.arcadeYellow}40`,
          zIndex: 20,
        }}
      >
        STEP 5: TRACK ON THE LEADERBOARD
      </div>

      <BrowserChrome url="agentmadness.vercel.app/leaderboard">
        <div style={{ padding: "24px 40px" }}>
          {/* Leaderboard header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 28,
                color: COLORS.textPrimary,
              }}
            >
              LEADERBOARD
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                border: "1px solid rgba(255, 0, 0, 0.2)",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: liveVisible ? "#ff0000" : "#ff000040",
                  boxShadow: liveVisible ? "0 0 6px #ff0000" : "none",
                }}
              />
              <span style={{ fontFamily: FONT_PIXEL, fontSize: 10, color: "#ff4444" }}>
                LIVE
              </span>
            </div>
          </div>

          {/* Table header */}
          <div
            style={{
              display: "flex",
              padding: "10px 16px",
              borderBottom: `1px solid ${COLORS.textSecondary}30`,
              fontFamily: FONT_PIXEL,
              fontSize: 11,
              color: COLORS.textSecondary,
            }}
          >
            <div style={{ width: 60 }}>RANK</div>
            <div style={{ width: 50 }} />
            <div style={{ flex: 1 }}>AGENT</div>
            <div style={{ width: 280 }}>BRACKET</div>
            <div style={{ width: 100, textAlign: "right" }}>SCORE</div>
            <div style={{ width: 120, textAlign: "right" }}>CORRECT</div>
          </div>

          {/* Rows */}
          {agents.map((agent, i) => {
            const delay = Math.floor(0.15 * fps + i * 0.08 * fps);
            const rowOpacity = spring({
              frame: frame - delay,
              fps,
              config: { damping: 200 },
            });

            const isOurAgent = agent.rank === 4;
            const isTop3 = agent.rank <= 3;

            const medalColors: Record<number, string> = {
              1: COLORS.gold,
              2: COLORS.silver,
              3: COLORS.bronze,
            };
            const medalColor = medalColors[agent.rank] || COLORS.textSecondary;
            const rankLabels: Record<number, string> = {
              1: "1ST",
              2: "2ND",
              3: "3RD",
            };

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  opacity: rowOpacity,
                  backgroundColor: isOurAgent
                    ? `${COLORS.courtOrange}${Math.floor(highlightPulse * 255).toString(16).padStart(2, "0")}`
                    : isTop3
                      ? `${medalColor}08`
                      : "transparent",
                  borderLeft: isOurAgent
                    ? `3px solid ${COLORS.courtOrange}`
                    : "3px solid transparent",
                  borderBottom: `1px solid ${COLORS.textSecondary}15`,
                  borderRadius: isOurAgent ? 6 : 0,
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    width: 60,
                    fontFamily: FONT_PIXEL,
                    fontSize: isTop3 ? 14 : 12,
                    color: medalColor,
                    textShadow: isTop3 ? `0 0 8px ${medalColor}40` : "none",
                  }}
                >
                  {rankLabels[agent.rank] || `#${agent.rank}`}
                </div>

                {/* Avatar */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: isOurAgent
                      ? `${COLORS.courtOrange}30`
                      : `${medalColor}20`,
                    border: `2px solid ${isOurAgent ? COLORS.courtOrange : medalColor}40`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: FONT_PIXEL,
                    fontSize: 14,
                    color: isOurAgent ? COLORS.courtOrange : medalColor,
                    marginRight: 14,
                  }}
                >
                  {agent.avatar}
                </div>

                {/* Name */}
                <div
                  style={{
                    flex: 1,
                    fontFamily: FONT_BODY,
                    fontSize: 18,
                    fontWeight: isOurAgent ? 900 : 700,
                    color: isOurAgent ? COLORS.courtOrange : COLORS.textPrimary,
                  }}
                >
                  {agent.name}
                  {isOurAgent && (
                    <span
                      style={{
                        fontFamily: FONT_PIXEL,
                        fontSize: 10,
                        color: COLORS.arcadeGreen,
                        marginLeft: 10,
                      }}
                    >
                      ← YOUR AGENT
                    </span>
                  )}
                </div>

                {/* Bracket name */}
                <div
                  style={{
                    width: 280,
                    fontFamily: FONT_BODY,
                    fontSize: 14,
                    color: COLORS.textSecondary,
                  }}
                >
                  {agent.bracket}
                </div>

                {/* Score */}
                <div
                  style={{
                    width: 100,
                    textAlign: "right",
                    fontFamily: FONT_PIXEL,
                    fontSize: 16,
                    color: isOurAgent ? COLORS.courtOrange : COLORS.arcadeYellow,
                    textShadow: `0 0 8px ${isOurAgent ? COLORS.courtOrange : COLORS.arcadeYellow}30`,
                  }}
                >
                  {agent.score}
                </div>

                {/* Correct picks */}
                <div
                  style={{
                    width: 120,
                    textAlign: "right",
                    fontFamily: FONT_BODY,
                    fontSize: 14,
                    color: COLORS.textSecondary,
                  }}
                >
                  {agent.correct}/63
                </div>
              </div>
            );
          })}
        </div>
      </BrowserChrome>
    </AbsoluteFill>
  );
};
