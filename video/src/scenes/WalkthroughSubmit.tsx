import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { Terminal } from "../components/Terminal";
import { FONT_PIXEL } from "../fonts";

export const WalkthroughSubmit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // URL highlight glow
  const urlGlow = interpolate(
    frame,
    [3.5 * fps, 4 * fps, 4.5 * fps],
    [0, 1, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Share callout
  const shareScale = spring({
    frame: frame - Math.floor(4.2 * fps),
    fps,
    config: { damping: 10 },
  });

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
        }}
      >
        STEP 3: SUBMIT & SHARE
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        <Terminal
          title="Terminal — bracket submitted"
          lines={[
            {
              text: "Submitting bracket: \"Conservative Upset Special\"",
              color: COLORS.textSecondary,
              delay: 0.2,
            },
            {
              text: "  63/63 picks validated ✓",
              color: COLORS.arcadeGreen,
              delay: 0.8,
            },
            {
              text: "  Tiebreaker: 145",
              color: COLORS.textSecondary,
              delay: 1.2,
            },
            { text: "", delay: 1.6 },
            {
              text: "✓ Bracket submitted successfully!",
              color: "#28c840",
              delay: 1.8,
            },
            { text: "", delay: 2.2 },
            {
              text: "  Name:    Conservative Upset Special",
              color: "#e0e0e0",
              delay: 2.4,
            },
            {
              text: "  Score:   0 (tournament hasn't started)",
              color: "#e0e0e0",
              delay: 2.7,
            },
            {
              text: "  Max:     1,920",
              color: "#e0e0e0",
              delay: 3.0,
            },
            { text: "", delay: 3.3 },
            {
              text: "  View:    march-madness.vercel.app/brackets/a3f8c2d1",
              color: COLORS.arcadeBlue,
              delay: 3.5,
            },
          ]}
        />

        {/* Share callout */}
        <div
          style={{
            transform: `scale(${shareScale})`,
            opacity: shareScale > 0.01 ? 1 : 0,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 32px",
            backgroundColor: `${COLORS.arcadeBlue}15`,
            border: `2px solid ${COLORS.arcadeBlue}40`,
            borderRadius: 12,
            boxShadow: `0 0 ${20 * urlGlow}px ${COLORS.arcadeBlue}30`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_PIXEL,
              fontSize: 14,
              color: COLORS.textSecondary,
            }}
          >
            SHARE WITH YOUR TEAM
          </div>
          <div
            style={{
              fontFamily: FONT_PIXEL,
              fontSize: 14,
              color: COLORS.arcadeBlue,
              textShadow: `0 0 10px ${COLORS.arcadeBlue}60`,
            }}
          >
            → march-madness.vercel.app/brackets/a3f8c2d1
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
