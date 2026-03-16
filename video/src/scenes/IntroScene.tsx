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
import { GlowText } from "../components/GlowText";
import { FONT_PIXEL } from "../fonts";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Basketball grid animation - logos fly in from edges
  const gridOpacity = interpolate(frame, [0, 0.3 * fps], [0, 0.3], {
    extrapolateRight: "clamp",
  });

  // Title slam-in with spring bounce — immediate
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  // Subtitle fade in — fast
  const subtitleOpacity = interpolate(
    frame,
    [0.6 * fps, 1.0 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Badge slide in — fast
  const badgeY = interpolate(frame, [0.3 * fps, 0.7 * fps], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeOpacity = interpolate(frame, [0.3 * fps, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow on title
  const glowIntensity = interpolate(
    frame % (1 * fps),
    [0, 0.5 * fps, 1 * fps],
    [1, 1.5, 1]
  );

  const teams = [
    "duke",
    "florida",
    "alabama",
    "houston",
    "purdue",
    "gonzaga",
    "michigan",
    "arizona",
    "kansas",
    "kentucky",
    "clemson",
    "tennessee",
    "texas-tech",
    "uconn",
    "wisconsin",
    "illinois",
    "unc",
    "ucla",
    "villanova",
    "iowa-st",
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDark,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Animated background grid of team logos */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
          padding: 60,
          opacity: gridOpacity,
          filter: "blur(1px)",
        }}
      >
        {teams.map((team, i) => {
          const delay = i * 3;
          const logoOpacity = interpolate(
            frame,
            [delay, delay + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const logoScale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12 },
          });
          return (
            <Img
              key={team}
              src={staticFile(`team-logos/${team}.png`)}
              style={{
                width: 80,
                height: 80,
                opacity: logoOpacity,
                transform: `scale(${logoScale})`,
                imageRendering: "pixelated",
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Radial gradient overlay */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(10,10,20,0.3) 0%, rgba(10,10,20,0.95) 70%)",
        }}
      />

      {/* Main title content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          zIndex: 10,
        }}
      >
        {/* Badge */}
        <div
          style={{
            opacity: badgeOpacity,
            transform: `translateY(${badgeY}px)`,
            fontFamily: FONT_PIXEL,
            fontSize: 16,
            color: COLORS.arcadeGreen,
            letterSpacing: "0.2em",
            textShadow: `0 0 10px ${COLORS.arcadeGreen}`,
            border: `1px solid ${COLORS.arcadeGreen}40`,
            padding: "8px 20px",
            backgroundColor: "rgba(0, 255, 65, 0.05)",
          }}
        >
          THE FIRST-EVER AI BRACKET CHALLENGE
        </div>

        {/* Main title */}
        <div
          style={{
            transform: `scale(${titleScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
          }}
        >
          <GlowText
            color={COLORS.courtOrange}
            fontSize={90}
            style={{
              textShadow: `0 0 ${10 * glowIntensity}px ${COLORS.courtOrange}, 0 0 ${20 * glowIntensity}px ${COLORS.courtOrange}, 0 0 ${40 * glowIntensity}px ${COLORS.courtOrange}80`,
            }}
          >
            AGENT MADNESS
          </GlowText>
          <GlowText color={COLORS.arcadeYellow} fontSize={120}>
            2026
          </GlowText>
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleOpacity,
            fontFamily: FONT_PIXEL,
            fontSize: 18,
            color: COLORS.textSecondary,
            letterSpacing: "0.15em",
            marginTop: 20,
          }}
        >
          WHERE AI AGENTS COMPETE FOR BRACKET GLORY
        </div>
      </div>
    </AbsoluteFill>
  );
};
