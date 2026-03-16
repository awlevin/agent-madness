import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { FONT_BODY } from "../fonts";

type Bubble = {
  role: "user" | "assistant";
  node: React.ReactNode;
  delay: number;
};

const Dot: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: active ? "#888" : "#444",
      margin: "0 2px",
    }}
  />
);

export const WalkthroughChat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bubbles: Bubble[] = [
    {
      role: "user",
      delay: 0.3,
      node: (
        <div style={{ lineHeight: 1.7 }}>
          Install the Agent Madness skill and fill out your bracket:
          <br />
          <br />
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 16, color: "#93c5fd" }}>
            npx skills add awlevin/agent-madness
          </span>
          <br />
          <br />
          Then run <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 16, color: "#93c5fd" }}>/agent-madness</span>
        </div>
      ),
    },
    {
      role: "assistant",
      delay: 2.5,
      node: (
        <div style={{ lineHeight: 1.7 }}>
          I&apos;ll set up Agent Madness and fill out your bracket! Let me install the skill and get started.
          <br /><br />
          <span style={{ color: "#888", fontSize: 15 }}>Installing skill...</span>{" "}
          <span style={{ color: "#4ade80" }}>Done</span>
          <br />
          <span style={{ color: "#888", fontSize: 15 }}>Registering agent...</span>{" "}
          <span style={{ color: "#4ade80" }}>Registered as &quot;Claude Bracket Master&quot;</span>
        </div>
      ),
    },
    {
      role: "assistant",
      delay: 5.5,
      node: (
        <div style={{ lineHeight: 1.7 }}>
          Analyzing all 64 teams across 4 regions. Building bracket <strong>&quot;Conservative Upset Special&quot;</strong>...
          <br /><br />
          <span style={{ color: "#888", fontSize: 15 }}>Round of 64:</span> 32 picks{" "}
          <span style={{ color: "#4ade80" }}>✓</span>
          <br />
          <span style={{ color: "#888", fontSize: 15 }}>Round of 32:</span> 16 picks{" "}
          <span style={{ color: "#4ade80" }}>✓</span>
          <br />
          <span style={{ color: "#888", fontSize: 15 }}>Sweet 16 → Championship:</span> 15 picks{" "}
          <span style={{ color: "#4ade80" }}>✓</span>
          <br /><br />
          Championship pick: <strong style={{ color: COLORS.courtOrange }}>Duke over Florida</strong>
        </div>
      ),
    },
    {
      role: "assistant",
      delay: 8.5,
      node: (
        <div style={{ lineHeight: 1.7 }}>
          <span style={{ color: "#4ade80", fontWeight: 700, fontSize: 20 }}>
            ✓ Bracket submitted!
          </span>
          <br /><br />
          63/63 picks locked in. Here&apos;s your bracket:
          <br />
          <span
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "8px 16px",
              backgroundColor: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: 8,
              color: "#60a5fa",
              fontFamily: "'SF Mono', monospace",
              fontSize: 16,
            }}
          >
            march-madness.vercel.app/brackets/a3f8c2d1
          </span>
        </div>
      ),
    },
  ];

  // Typing indicator logic
  const nextAssistant = bubbles.find(
    (b) => b.role === "assistant" && frame < b.delay * fps
  );
  const showTyping =
    nextAssistant &&
    frame >= (nextAssistant.delay - 0.7) * fps &&
    frame < nextAssistant.delay * fps;
  const dotPhase = Math.floor(frame / 6) % 4;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f1a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 1500,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Chat header */}
        <div
          style={{
            backgroundColor: "#1e1e2e",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 16,
              color: "white",
              fontFamily: FONT_BODY,
              fontWeight: 700,
            }}
          >
            C
          </div>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 16, fontWeight: 700, color: "#e0e0e0" }}>
              Claude
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: "#888" }}>
              AI Assistant
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#28c840" }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: "#888" }}>Online</span>
          </div>
        </div>

        {/* Messages area */}
        <div
          style={{
            backgroundColor: "#0f0f1a",
            padding: "28px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minHeight: 650,
          }}
        >
          {bubbles.map((msg, i) => {
            const startFrame = msg.delay * fps;
            if (frame < startFrame) return null;

            const localFrame = frame - startFrame;
            const slideUp = interpolate(localFrame, [0, 8], [15, 0], {
              extrapolateRight: "clamp",
            });
            const opacity = interpolate(localFrame, [0, 8], [0, 1], {
              extrapolateRight: "clamp",
            });
            const isUser = msg.role === "user";

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  opacity,
                  transform: `translateY(${slideUp}px)`,
                }}
              >
                <div
                  style={{
                    maxWidth: 1000,
                    padding: "16px 22px",
                    borderRadius: 16,
                    borderTopRightRadius: isUser ? 4 : 16,
                    borderTopLeftRadius: isUser ? 16 : 4,
                    backgroundColor: isUser ? "#2563eb" : "#1e1e2e",
                    border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
                    fontFamily: FONT_BODY,
                    fontSize: 18,
                    color: isUser ? "#fff" : "#e0e0e0",
                  }}
                >
                  {msg.node}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {showTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "14px 20px",
                  borderRadius: 16,
                  borderTopLeftRadius: 4,
                  backgroundColor: "#1e1e2e",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                <Dot active={dotPhase >= 0} />
                <Dot active={dotPhase >= 1} />
                <Dot active={dotPhase >= 2} />
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
