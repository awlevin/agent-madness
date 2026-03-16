import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { GlowText } from "../components/GlowText";
import { FONT_PIXEL } from "../fonts";

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "64 TEAMS" slams in from left
  const teams64X = interpolate(frame, [0, 0.4 * fps], [-800, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "63 GAMES" slams in from right
  const games63X = interpolate(frame, [0.3 * fps, 0.7 * fps], [800, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bracket lines drawing animation
  const bracketProgress = interpolate(
    frame,
    [1 * fps, 2.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // "ONE CHAMPION" reveal
  const championScale = spring({
    frame: frame - Math.floor(2.8 * fps),
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  // Bracket visualization - simplified tournament bracket lines
  const bracketLines = [];
  const rounds = [16, 8, 4, 2, 1];
  const startX = 200;
  const totalWidth = 1520;
  const roundSpacing = totalWidth / (rounds.length + 1);

  for (let r = 0; r < rounds.length; r++) {
    const count = rounds[r];
    const x = startX + r * roundSpacing;
    const roundProgress = interpolate(
      bracketProgress,
      [r / rounds.length, (r + 1) / rounds.length],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    for (let i = 0; i < count; i++) {
      const totalHeight = 600;
      const spacing = totalHeight / count;
      const y = 240 + i * spacing + spacing / 2;

      bracketLines.push(
        <div
          key={`line-${r}-${i}`}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: roundSpacing * 0.8 * roundProgress,
            height: 2,
            backgroundColor:
              r < 3
                ? COLORS.courtOrange
                : r < 4
                  ? COLORS.arcadeYellow
                  : COLORS.arcadeGreen,
            opacity: roundProgress * 0.6,
            boxShadow: `0 0 8px ${COLORS.courtOrange}60`,
          }}
        />
      );
    }
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDark,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Bracket visualization background */}
      <AbsoluteFill>{bracketLines}</AbsoluteFill>

      {/* Dark overlay to make text readable */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(10,10,20,0.7) 0%, rgba(10,10,20,0.9) 80%)",
        }}
      />

      {/* Text content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          zIndex: 10,
        }}
      >
        <div
          style={{
            transform: `translateX(${teams64X}px)`,
            fontFamily: FONT_PIXEL,
            fontSize: 72,
            color: COLORS.textPrimary,
          }}
        >
          64 TEAMS
        </div>

        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 24,
            color: COLORS.textSecondary,
            opacity: interpolate(frame, [0.5 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          .
        </div>

        <div
          style={{
            transform: `translateX(${games63X}px)`,
            fontFamily: FONT_PIXEL,
            fontSize: 72,
            color: COLORS.textPrimary,
          }}
        >
          63 GAMES
        </div>

        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 24,
            color: COLORS.textSecondary,
            opacity: interpolate(frame, [0.8 * fps, 1.1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          .
        </div>

        <div
          style={{
            transform: `scale(${championScale})`,
          }}
        >
          <GlowText color={COLORS.arcadeYellow} fontSize={56}>
            ONE CHAMPION
          </GlowText>
        </div>
      </div>
    </AbsoluteFill>
  );
};
