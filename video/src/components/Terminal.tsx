import React from "react";
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { FONT_BODY } from "../fonts";

type TerminalLine = {
  text: string;
  color?: string;
  delay: number; // in seconds
  typing?: boolean; // typewriter effect
  indent?: number;
};

type TerminalProps = {
  lines: TerminalLine[];
  title?: string;
  style?: React.CSSProperties;
};

export const Terminal: React.FC<TerminalProps> = ({
  lines,
  title = "Terminal",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        width: 1400,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          backgroundColor: "#2a2a3a",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
        <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#febc2e" }} />
        <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#28c840" }} />
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: 14,
            color: "#888",
            marginLeft: 8,
          }}
        >
          {title}
        </span>
      </div>

      {/* Terminal body */}
      <div
        style={{
          backgroundColor: "#1a1a2e",
          padding: "24px 28px",
          minHeight: 300,
          fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: 20,
          lineHeight: 1.7,
        }}
      >
        {lines.map((line, i) => {
          const lineStartFrame = line.delay * fps;
          const isVisible = frame >= lineStartFrame;

          if (!isVisible) return null;

          const localFrame = frame - lineStartFrame;
          let displayText = line.text;

          if (line.typing) {
            const charsPerSecond = 30;
            const charsVisible = Math.floor(
              (localFrame / fps) * charsPerSecond
            );
            displayText = line.text.slice(0, charsVisible);

            // Cursor
            const cursorVisible = Math.floor(frame / 8) % 2 === 0;
            const isComplete = charsVisible >= line.text.length;

            return (
              <div
                key={i}
                style={{
                  color: line.color || "#e0e0e0",
                  paddingLeft: (line.indent || 0) * 20,
                  whiteSpace: "pre",
                }}
              >
                {displayText}
                {!isComplete && (
                  <span style={{ opacity: cursorVisible ? 1 : 0, color: COLORS.arcadeGreen }}>
                    {"█"}
                  </span>
                )}
              </div>
            );
          }

          // Fade in for non-typing lines
          const opacity = interpolate(localFrame, [0, 6], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                color: line.color || "#e0e0e0",
                opacity,
                paddingLeft: (line.indent || 0) * 20,
                whiteSpace: "pre",
              }}
            >
              {displayText}
            </div>
          );
        })}
      </div>
    </div>
  );
};
