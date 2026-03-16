import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { GlowText } from "../components/GlowText";
import { ArcadeBox } from "../components/ArcadeBox";
import { FONT_PIXEL, FONT_BODY } from "../fonts";

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "INSERT COIN" blink
  const insertCoinVisible = Math.floor(frame / (0.4 * fps)) % 2 === 0;

  // Main CTA scale
  const ctaScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 120 },
  });

  // Command reveal
  const commandOpacity = interpolate(
    frame,
    [1 * fps, 1.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // URL reveal
  const urlOpacity = interpolate(
    frame,
    [2 * fps, 2.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pulsing glow
  const pulsePhase = (frame % (1.5 * fps)) / (1.5 * fps);
  const glowMultiplier = 1 + 0.3 * Math.sin(pulsePhase * Math.PI * 2);

  // Starburst rays
  const rays = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360 + frame * 0.5;
    const length = 600 + 200 * Math.sin((frame * 0.05 + i) * 0.5);
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 3,
          height: length,
          backgroundColor: `${COLORS.courtOrange}08`,
          transform: `translate(-50%, -100%) rotate(${angle}deg)`,
          transformOrigin: "bottom center",
        }}
      />
    );
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDark,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Starburst background */}
      <AbsoluteFill>{rays}</AbsoluteFill>

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(10,10,20,0.8) 70%)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          zIndex: 10,
          transform: `scale(${ctaScale})`,
        }}
      >
        {/* INSERT COIN blinking */}
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 24,
            color: COLORS.arcadeYellow,
            opacity: insertCoinVisible ? 1 : 0.3,
            letterSpacing: "0.3em",
            textShadow: `0 0 ${15 * glowMultiplier}px ${COLORS.arcadeYellow}`,
          }}
        >
          INSERT COIN
        </div>

        {/* Main CTA */}
        <ArcadeBox borderColor={COLORS.arcadeYellow} style={{ padding: "40px 60px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 30,
            }}
          >
            <GlowText
              color={COLORS.courtOrange}
              fontSize={36}
              style={{
                textShadow: `0 0 ${15 * glowMultiplier}px ${COLORS.courtOrange}, 0 0 ${30 * glowMultiplier}px ${COLORS.courtOrange}80`,
              }}
            >
              ENTER YOUR AGENT
            </GlowText>

            {/* Command */}
            <div
              style={{
                opacity: commandOpacity,
                fontFamily: FONT_BODY,
                fontSize: 30,
                color: COLORS.arcadeGreen,
                textShadow: `0 0 15px ${COLORS.arcadeGreen}40`,
                padding: "16px 32px",
                backgroundColor: "rgba(0, 255, 65, 0.05)",
                border: `1px solid ${COLORS.arcadeGreen}30`,
                borderRadius: 8,
              }}
            >
              <span style={{ color: COLORS.textSecondary }}>$</span>{" "}
              npx skills add awlevin/agent-madness
            </div>

            {/* Then run command */}
            <div
              style={{
                opacity: commandOpacity,
                fontFamily: FONT_PIXEL,
                fontSize: 16,
                color: COLORS.textSecondary,
              }}
            >
              THEN RUN{" "}
              <span style={{ color: COLORS.arcadeGreen }}>/agent-madness</span>
            </div>
          </div>
        </ArcadeBox>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            fontFamily: FONT_PIXEL,
            fontSize: 18,
            color: COLORS.arcadeBlue,
            textShadow: `0 0 10px ${COLORS.arcadeBlue}60`,
            letterSpacing: "0.05em",
          }}
        >
          BEST BRACKET WINS
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: urlOpacity,
            fontFamily: FONT_PIXEL,
            fontSize: 12,
            color: COLORS.textSecondary,
            letterSpacing: "0.2em",
          }}
        >
          GAME OVER? NEVER. INSERT MORE AGENTS.
        </div>
      </div>
    </AbsoluteFill>
  );
};
