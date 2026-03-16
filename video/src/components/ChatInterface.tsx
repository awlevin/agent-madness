import React from "react";
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { FONT_BODY } from "../fonts";

type ChatMessage = {
  role: "user" | "assistant";
  content: React.ReactNode;
  delay: number; // seconds
};

type ChatInterfaceProps = {
  messages: ChatMessage[];
  style?: React.CSSProperties;
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        width: 1500,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        ...style,
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
        {/* Avatar */}
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
          }}
        >
          C
        </div>
        <div>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 16,
              fontWeight: 700,
              color: "#e0e0e0",
            }}
          >
            Claude
          </div>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 12,
              color: "#888",
            }}
          >
            AI Assistant
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#28c840",
            }}
          />
          <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: "#888" }}>
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          backgroundColor: "#0f0f1a",
          padding: "24px 32px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          minHeight: 600,
        }}
      >
        {messages.map((msg, i) => {
          const startFrame = msg.delay * fps;
          const isVisible = frame >= startFrame;
          if (!isVisible) return null;

          const localFrame = frame - startFrame;
          const slideUp = interpolate(localFrame, [0, 10], [20, 0], {
            extrapolateRight: "clamp",
          });
          const opacity = interpolate(localFrame, [0, 10], [0, 1], {
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
                  maxWidth: 1100,
                  padding: "16px 22px",
                  borderRadius: 16,
                  borderTopRightRadius: isUser ? 4 : 16,
                  borderTopLeftRadius: isUser ? 16 : 4,
                  backgroundColor: isUser ? "#2563eb" : "#1e1e2e",
                  border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
                  fontFamily: FONT_BODY,
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: isUser ? "#fff" : "#e0e0e0",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {(() => {
          // Find the last visible assistant message
          const lastAssistantIdx = [...messages]
            .reverse()
            .findIndex(
              (m) => m.role === "assistant" && frame >= m.delay * fps
            );
          const nextAssistantIdx = messages.findIndex(
            (m, idx) =>
              m.role === "assistant" && frame < m.delay * fps
          );

          if (nextAssistantIdx !== -1) {
            const nextMsg = messages[nextAssistantIdx];
            const showTyping =
              frame >= (nextMsg.delay - 0.8) * fps &&
              frame < nextMsg.delay * fps;
            if (showTyping) {
              const dotPhase = Math.floor(frame / 6) % 4;
              return (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "14px 22px",
                      borderRadius: 16,
                      borderTopLeftRadius: 4,
                      backgroundColor: "#1e1e2e",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontFamily: FONT_BODY,
                      fontSize: 22,
                      color: "#666",
                      letterSpacing: 4,
                    }}
                  >
                    {".".repeat(Math.min(dotPhase + 1, 3))}
                  </div>
                </div>
              );
            }
          }
          return null;
        })()}
      </div>
    </div>
  );
};
