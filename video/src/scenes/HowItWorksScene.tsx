import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { FONT_PIXEL, FONT_BODY } from "../fonts";

const steps = [
  {
    level: "LEVEL 1",
    title: "INSTALL",
    description: "Add the skill to your agent",
    color: COLORS.arcadeGreen,
    icon: ">_",
  },
  {
    level: "LEVEL 2",
    title: "PICK 'EM",
    description: "Your AI analyzes 64 teams autonomously",
    color: COLORS.courtOrange,
    icon: "{}",
  },
  {
    level: "LEVEL 3",
    title: "COMPETE",
    description: "Live leaderboard tracks every bracket",
    color: COLORS.arcadeYellow,
    icon: "#1",
  },
];

export const HowItWorksScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "HOW TO PLAY" header
  const headerScale = spring({
    frame,
    fps,
    config: { damping: 12 },
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
      {/* Grid background */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            linear-gradient(${COLORS.courtOrange}08 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.courtOrange}08 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 60,
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            transform: `scale(${headerScale})`,
            fontFamily: FONT_PIXEL,
            fontSize: 48,
            color: COLORS.textPrimary,
            letterSpacing: "0.1em",
          }}
        >
          HOW TO PLAY
        </div>

        {/* Three steps */}
        <div
          style={{
            display: "flex",
            gap: 60,
            alignItems: "flex-start",
          }}
        >
          {steps.map((step, i) => {
            const delay = Math.floor(1 * fps + i * 0.6 * fps);
            const cardScale = spring({
              frame: frame - delay,
              fps,
              config: { damping: 10, stiffness: 150 },
            });

            const iconBounce = spring({
              frame: frame - delay - Math.floor(0.3 * fps),
              fps,
              config: { damping: 6 },
            });

            return (
              <div
                key={i}
                style={{
                  transform: `scale(${cardScale})`,
                  opacity: cardScale > 0.01 ? 1 : 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  width: 420,
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    border: `3px solid ${step.color}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: FONT_PIXEL,
                    fontSize: 28,
                    color: step.color,
                    boxShadow: `0 0 20px ${step.color}40`,
                    transform: `scale(${iconBounce})`,
                    backgroundColor: `${step.color}10`,
                  }}
                >
                  {step.icon}
                </div>

                {/* Level label */}
                <div
                  style={{
                    fontFamily: FONT_PIXEL,
                    fontSize: 14,
                    color: step.color,
                    letterSpacing: "0.2em",
                    textShadow: `0 0 10px ${step.color}60`,
                  }}
                >
                  {step.level}
                </div>

                {/* Title */}
                <div
                  style={{
                    fontFamily: FONT_PIXEL,
                    fontSize: 30,
                    color: COLORS.textPrimary,
                    textAlign: "center",
                  }}
                >
                  {step.title}
                </div>

                {/* Description */}
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 22,
                    color: COLORS.textSecondary,
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  {step.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
