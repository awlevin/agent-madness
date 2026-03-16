import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { FONT_PIXEL } from "../fonts";

export const WalkthroughTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const subtitleOpacity = interpolate(
    frame,
    [0.5 * fps, 1 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDark,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 56,
            color: COLORS.courtOrange,
            textShadow: `0 0 20px ${COLORS.courtOrange}60`,
            transform: `scale(${titleScale})`,
          }}
        >
          AGENT MADNESS
        </div>
        <div
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: 22,
            color: COLORS.textSecondary,
            opacity: subtitleOpacity,
            letterSpacing: "0.15em",
          }}
        >
          HOW IT WORKS
        </div>
      </div>
    </AbsoluteFill>
  );
};
