import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { FONT_PIXEL, FONT_BODY } from "../fonts";
import { GlowText } from "../components/GlowText";

const rounds = [
  { name: "ROUND OF 64", points: 10, games: 32, total: 320 },
  { name: "ROUND OF 32", points: 20, games: 16, total: 320 },
  { name: "SWEET 16", points: 40, games: 8, total: 320 },
  { name: "ELITE 8", points: 80, games: 4, total: 320 },
  { name: "FINAL FOUR", points: 160, games: 2, total: 320 },
  { name: "CHAMPIONSHIP", points: 320, games: 1, total: 320 },
];

export const ScoringScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header
  const headerScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // Running total counter
  const totalRevealFrame = 0.5 * fps;
  const runningTotal = Math.floor(
    interpolate(
      frame,
      [totalRevealFrame, totalRevealFrame + 3 * fps],
      [0, 1920],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )
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
        }}
      >
        {/* Header */}
        <div
          style={{
            transform: `scale(${headerScale})`,
            fontFamily: FONT_PIXEL,
            fontSize: 40,
            color: COLORS.textPrimary,
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          SCORING
        </div>

        {/* Scoring table */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: 900,
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 20px 10px",
              borderBottom: `2px solid ${COLORS.textSecondary}40`,
            }}
          >
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 14,
                color: COLORS.textSecondary,
                width: 280,
              }}
            >
              ROUND
            </div>
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 14,
                color: COLORS.textSecondary,
                width: 120,
                textAlign: "center",
              }}
            >
              PTS/WIN
            </div>
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 14,
                color: COLORS.textSecondary,
                width: 120,
                textAlign: "center",
              }}
            >
              GAMES
            </div>
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 14,
                color: COLORS.textSecondary,
                width: 140,
                textAlign: "right",
              }}
            >
              MAX
            </div>
          </div>

          {rounds.map((round, i) => {
            const delay = Math.floor(0.5 * fps + i * 0.4 * fps);
            const rowProgress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 200 },
            });

            const rowX = interpolate(rowProgress, [0, 1], [-400, 0]);

            // Color intensity increases with later rounds
            const intensity = 0.4 + i * 0.12;
            const barWidth = interpolate(rowProgress, [0, 1], [0, round.total / 320 * 100]);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 20px",
                  transform: `translateX(${rowX}px)`,
                  opacity: rowProgress,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background bar */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${barWidth}%`,
                    backgroundColor: `${COLORS.courtOrange}${Math.floor(intensity * 30).toString(16).padStart(2, "0")}`,
                  }}
                />
                <div
                  style={{
                    fontFamily: FONT_PIXEL,
                    fontSize: 18,
                    color: COLORS.textPrimary,
                    width: 280,
                    zIndex: 1,
                  }}
                >
                  {round.name}
                </div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.courtOrange,
                    width: 120,
                    textAlign: "center",
                    zIndex: 1,
                  }}
                >
                  {round.points}
                </div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 22,
                    color: COLORS.textSecondary,
                    width: 120,
                    textAlign: "center",
                    zIndex: 1,
                  }}
                >
                  {round.games}
                </div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.arcadeYellow,
                    width: 140,
                    textAlign: "right",
                    zIndex: 1,
                  }}
                >
                  {round.total}
                </div>
              </div>
            );
          })}
        </div>

        {/* Perfect bracket total */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontFamily: FONT_PIXEL,
              fontSize: 16,
              color: COLORS.arcadeGreen,
              letterSpacing: "0.2em",
            }}
          >
            PERFECT BRACKET
          </div>
          <GlowText color={COLORS.arcadeGreen} fontSize={64}>
            {runningTotal.toLocaleString()}
          </GlowText>
        </div>
      </div>
    </AbsoluteFill>
  );
};
