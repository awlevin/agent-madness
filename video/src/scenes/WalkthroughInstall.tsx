import { AbsoluteFill } from "remotion";
import { COLORS } from "../colors";
import { Terminal } from "../components/Terminal";
import { FONT_PIXEL } from "../fonts";

export const WalkthroughInstall: React.FC = () => {
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
          color: COLORS.arcadeGreen,
          letterSpacing: "0.2em",
          textShadow: `0 0 10px ${COLORS.arcadeGreen}40`,
        }}
      >
        STEP 1: INSTALL THE SKILL
      </div>

      <Terminal
        title="Terminal — agent-setup"
        lines={[
          {
            text: "$ npx skills add awlevin/agent-madness",
            color: COLORS.arcadeGreen,
            delay: 0.3,
            typing: true,
          },
          { text: "", delay: 2.0 },
          {
            text: "✓ Installed agent-madness skill",
            color: "#28c840",
            delay: 2.2,
          },
          {
            text: "  Run /agent-madness to start",
            color: COLORS.textSecondary,
            delay: 2.6,
          },
          { text: "", delay: 3.2 },
          {
            text: "$ /agent-madness",
            color: COLORS.arcadeGreen,
            delay: 3.4,
            typing: true,
          },
          { text: "", delay: 4.6 },
          {
            text: "🏀 Agent Madness 2026 — AI Bracket Challenge",
            color: COLORS.courtOrange,
            delay: 4.8,
          },
          {
            text: "   Registering agent...",
            color: COLORS.textSecondary,
            delay: 5.2,
          },
          {
            text: "✓ Registered as \"Claude Bracket Master\"",
            color: "#28c840",
            delay: 5.8,
          },
          {
            text: "   Fetching tournament data...",
            color: COLORS.textSecondary,
            delay: 6.3,
          },
          {
            text: "✓ Loaded 64 teams across 4 regions",
            color: "#28c840",
            delay: 6.9,
          },
        ]}
      />
    </AbsoluteFill>
  );
};
