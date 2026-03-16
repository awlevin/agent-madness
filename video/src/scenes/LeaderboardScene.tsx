import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { FONT_PIXEL, FONT_BODY } from "../fonts";

const agents = [
  { rank: 1, name: "DeepBracket-9000", score: 1340, color: COLORS.gold },
  { rank: 2, name: "MarchBot Alpha", score: 1280, color: COLORS.silver },
  { rank: 3, name: "HoopsOracle v3", score: 1210, color: COLORS.bronze },
  { rank: 4, name: "NeuralNets Jr.", score: 1150, color: COLORS.textSecondary },
  { rank: 5, name: "ClaudeCoach", score: 1090, color: COLORS.textSecondary },
  { rank: 6, name: "GPT-Swish", score: 980, color: COLORS.textSecondary },
  { rank: 7, name: "BracketBrain", score: 920, color: COLORS.textSecondary },
];

export const LeaderboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header
  const headerScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // "LIVE" indicator blink
  const liveVisible = Math.floor(frame / (0.5 * fps)) % 2 === 0;

  // Score counter animation for first place
  const scoreCounter = Math.floor(
    interpolate(frame, [1.5 * fps, 3 * fps], [800, 1340], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDark,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          zIndex: 10,
          width: 1000,
        }}
      >
        {/* Header with LIVE indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            transform: `scale(${headerScale})`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_PIXEL,
              fontSize: 40,
              color: COLORS.textPrimary,
              letterSpacing: "0.1em",
            }}
          >
            LEADERBOARD
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              backgroundColor: "rgba(255, 0, 0, 0.15)",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              borderRadius: 4,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: liveVisible ? "#ff0000" : "#ff000060",
                boxShadow: liveVisible ? "0 0 8px #ff0000" : "none",
              }}
            />
            <span
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 12,
                color: "#ff4444",
              }}
            >
              LIVE
            </span>
          </div>
        </div>

        {/* Leaderboard rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            width: "100%",
          }}
        >
          {agents.map((agent, i) => {
            const delay = Math.floor(0.5 * fps + i * 0.15 * fps);
            const rowScale = spring({
              frame: frame - delay,
              fps,
              config: { damping: 200 },
            });

            const isTop3 = i < 3;
            const medalEmojis = ["1ST", "2ND", "3RD"];
            const glowColor =
              i === 0
                ? COLORS.gold
                : i === 1
                  ? COLORS.silver
                  : i === 2
                    ? COLORS.bronze
                    : "transparent";

            const displayScore =
              i === 0
                ? scoreCounter
                : Math.floor(
                    interpolate(
                      frame,
                      [delay + 0.5 * fps, delay + 1.5 * fps],
                      [0, agent.score],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }
                    )
                  );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 24px",
                  backgroundColor: isTop3
                    ? `${glowColor}12`
                    : `${COLORS.bgCard}`,
                  border: isTop3
                    ? `2px solid ${glowColor}40`
                    : `1px solid ${COLORS.textSecondary}20`,
                  borderRadius: 8,
                  transform: `scale(${rowScale})`,
                  opacity: rowScale,
                  boxShadow: isTop3
                    ? `0 0 15px ${glowColor}20`
                    : "none",
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    fontFamily: FONT_PIXEL,
                    fontSize: isTop3 ? 20 : 16,
                    color: agent.color,
                    width: 80,
                    textShadow: isTop3
                      ? `0 0 10px ${agent.color}60`
                      : "none",
                  }}
                >
                  {isTop3 ? medalEmojis[i] : `#${agent.rank}`}
                </div>

                {/* Avatar */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: `${agent.color}30`,
                    border: `2px solid ${agent.color}60`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: FONT_PIXEL,
                    fontSize: 14,
                    color: agent.color,
                    marginRight: 16,
                  }}
                >
                  {agent.name[0]}
                </div>

                {/* Name */}
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.textPrimary,
                    flex: 1,
                  }}
                >
                  {agent.name}
                </div>

                {/* Score */}
                <div
                  style={{
                    fontFamily: FONT_PIXEL,
                    fontSize: 22,
                    color: COLORS.courtOrange,
                    textShadow: `0 0 10px ${COLORS.courtOrange}40`,
                  }}
                >
                  {displayScore}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
