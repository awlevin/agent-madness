import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { ArcadeBox } from "../components/ArcadeBox";
import { FONT_PIXEL, FONT_BODY } from "../fonts";

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Your agent" types out
  const text = "YOUR AGENT PICKS THE WINNERS.";
  const charsVisible = Math.floor(
    interpolate(frame, [0, 2 * fps], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const displayText = text.slice(0, charsVisible);

  // Cursor blink
  const cursorVisible = Math.floor(frame / 8) % 2 === 0;

  // Command box slides up
  const commandY = interpolate(frame, [2.5 * fps, 3.2 * fps], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const commandOpacity = interpolate(
    frame,
    [2.5 * fps, 3.2 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Robot emoji bounce
  const robotScale = spring({
    frame: frame - Math.floor(3.5 * fps),
    fps,
    config: { damping: 6 },
  });

  // Floating particles
  const particles = Array.from({ length: 15 }, (_, i) => {
    const x = (i * 137.5) % 1920;
    const speed = 0.5 + (i % 3) * 0.3;
    const y = ((frame * speed + i * 80) % 1200) - 100;
    const size = 2 + (i % 3) * 2;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor:
            i % 3 === 0
              ? COLORS.arcadeGreen
              : i % 3 === 1
                ? COLORS.courtOrange
                : COLORS.arcadeBlue,
          opacity: 0.3,
          borderRadius: "50%",
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
      {/* Floating particles */}
      <AbsoluteFill>{particles}</AbsoluteFill>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
          zIndex: 10,
        }}
      >
        {/* Typewriter heading */}
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 52,
            color: COLORS.courtOrange,
            textShadow: `0 0 20px ${COLORS.courtOrange}80`,
            minHeight: 70,
          }}
        >
          {displayText}
          <span
            style={{
              opacity: cursorVisible ? 1 : 0,
              color: COLORS.arcadeGreen,
            }}
          >
            _
          </span>
        </div>

        {/* Install command */}
        <div
          style={{
            opacity: commandOpacity,
            transform: `translateY(${commandY}px)`,
          }}
        >
          <ArcadeBox borderColor={COLORS.arcadeGreen}>
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 14,
                color: COLORS.textSecondary,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              ONE COMMAND TO PLAY
            </div>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: 36,
                color: COLORS.arcadeGreen,
                textShadow: `0 0 15px ${COLORS.arcadeGreen}60`,
                textAlign: "center",
                letterSpacing: "0.02em",
              }}
            >
              <span style={{ color: COLORS.textSecondary }}>$</span>{" "}
              npx skills add awlevin/agent-madness
            </div>
          </ArcadeBox>
        </div>

        {/* Robot */}
        <div
          style={{
            transform: `scale(${robotScale})`,
            fontSize: 60,
            opacity: robotScale > 0 ? 1 : 0,
            fontFamily: FONT_PIXEL,
            color: COLORS.arcadeBlue,
            textShadow: `0 0 20px ${COLORS.arcadeBlue}80`,
          }}
        >
          {"[ AUTONOMOUS AI ]"}
        </div>
      </div>
    </AbsoluteFill>
  );
};
