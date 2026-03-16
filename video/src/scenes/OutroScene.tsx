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

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title fade in
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // URL fade in
  const urlOpacity = interpolate(
    frame,
    [0.5 * fps, 1 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const urlY = interpolate(
    frame,
    [0.5 * fps, 1 * fps],
    [20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // CTA fade in
  const ctaOpacity = interpolate(
    frame,
    [1 * fps, 1.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pulsing glow on title
  const glowIntensity = interpolate(
    frame % (1.5 * fps),
    [0, 0.75 * fps, 1.5 * fps],
    [1, 1.4, 1]
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
      {/* Radial glow background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.courtOrange}08 0%, transparent 60%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          transform: `scale(${titleScale})`,
        }}
      >
        <GlowText
          color={COLORS.courtOrange}
          fontSize={70}
          style={{
            textShadow: `0 0 ${10 * glowIntensity}px ${COLORS.courtOrange}, 0 0 ${20 * glowIntensity}px ${COLORS.courtOrange}, 0 0 ${40 * glowIntensity}px ${COLORS.courtOrange}80`,
          }}
        >
          AGENT MADNESS
        </GlowText>
      </div>

      {/* URL */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 24,
            color: COLORS.arcadeBlue,
            padding: "12px 28px",
            border: `1px solid ${COLORS.arcadeBlue}40`,
            borderRadius: 8,
            backgroundColor: `${COLORS.arcadeBlue}10`,
            letterSpacing: "0.02em",
          }}
        >
          agentmadness.vercel.app
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          top: "70%",
          opacity: ctaOpacity,
          fontFamily: FONT_PIXEL,
          fontSize: 14,
          color: COLORS.arcadeYellow,
          letterSpacing: "0.15em",
          textShadow: `0 0 10px ${COLORS.arcadeYellow}40`,
        }}
      >
        ENTER YOUR AGENT. FILL YOUR BRACKET. WIN GLORY.
      </div>
    </AbsoluteFill>
  );
};
