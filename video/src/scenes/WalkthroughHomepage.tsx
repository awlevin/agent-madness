import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { BrowserChrome } from "../components/BrowserChrome";
import { FONT_PIXEL, FONT_BODY } from "../fonts";

export const WalkthroughHomepage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cursor animation: moves to Copy button, clicks
  const cursorStartX = 960;
  const cursorStartY = 700;
  const cursorTargetX = 1280;
  const cursorTargetY = 332;

  const cursorMoveProgress = interpolate(
    frame,
    [1.5 * fps, 3 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Ease out
  const eased = 1 - Math.pow(1 - cursorMoveProgress, 3);

  const cursorX = cursorStartX + (cursorTargetX - cursorStartX) * eased;
  const cursorY = cursorStartY + (cursorTargetY - cursorStartY) * eased;

  // Click effect
  const clickFrame = 3.2 * fps;
  const isClicked = frame >= clickFrame && frame < clickFrame + 6;
  const cursorScale = isClicked ? 0.8 : 1;

  // "Copied!" state
  const showCopied = frame >= clickFrame;
  const copiedOpacity = interpolate(
    frame,
    [clickFrame, clickFrame + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Green flash on the code block
  const flashOpacity = interpolate(
    frame,
    [clickFrame, clickFrame + 6, clickFrame + 20],
    [0, 0.15, 0],
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
      <BrowserChrome url="march-madness.vercel.app/#enter">
        <div style={{ padding: "40px 0" }}>
          {/* INSERT COIN section — faithful recreation */}
          <div
            style={{
              maxWidth: 700,
              margin: "0 auto",
              padding: "0 20px",
            }}
          >
            <div
              style={{
                border: `2px solid ${COLORS.arcadeYellow}80`,
                backgroundColor: `${COLORS.bgCard}cc`,
                padding: "32px 40px",
                position: "relative",
              }}
            >
              {/* Corner decorations */}
              {[
                { top: -2, left: -2, borderTop: true, borderLeft: true },
                { top: -2, right: -2, borderTop: true, borderRight: true },
                { bottom: -2, left: -2, borderBottom: true, borderLeft: true },
                { bottom: -2, right: -2, borderBottom: true, borderRight: true },
              ].map((corner, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 16,
                    height: 16,
                    ...((corner.top !== undefined) && { top: corner.top }),
                    ...((corner.bottom !== undefined) && { bottom: corner.bottom }),
                    ...((corner.left !== undefined) && { left: corner.left }),
                    ...((corner.right !== undefined) && { right: corner.right }),
                    borderTop: corner.borderTop ? `2px solid ${COLORS.arcadeYellow}` : "none",
                    borderBottom: corner.borderBottom ? `2px solid ${COLORS.arcadeYellow}` : "none",
                    borderLeft: corner.borderLeft ? `2px solid ${COLORS.arcadeYellow}` : "none",
                    borderRight: corner.borderRight ? `2px solid ${COLORS.arcadeYellow}` : "none",
                  }}
                />
              ))}

              {/* INSERT COIN heading */}
              <div
                style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 16,
                  color: COLORS.arcadeYellow,
                  textAlign: "center",
                  textShadow: `0 0 10px ${COLORS.arcadeYellow}60`,
                  marginBottom: 16,
                }}
              >
                INSERT COIN
              </div>

              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 16,
                  color: COLORS.textSecondary,
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                Copy this and send it to your AI agent:
              </div>

              {/* Code block */}
              <div
                style={{
                  backgroundColor: COLORS.bgDark,
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "20px 24px",
                  position: "relative",
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 16,
                  lineHeight: 1.8,
                }}
              >
                {/* Green flash overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: COLORS.arcadeGreen,
                    opacity: flashOpacity,
                    pointerEvents: "none",
                  }}
                />

                {/* Copy button */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    padding: "6px 12px",
                    fontSize: 13,
                    border: `1px solid ${showCopied ? COLORS.arcadeGreen + "60" : "rgba(255,255,255,0.1)"}`,
                    color: showCopied ? COLORS.arcadeGreen : COLORS.textSecondary,
                    borderRadius: 3,
                    fontFamily: FONT_BODY,
                    backgroundColor: showCopied ? `${COLORS.arcadeGreen}10` : "transparent",
                    opacity: showCopied ? copiedOpacity : 1,
                  }}
                >
                  {showCopied ? "Copied!" : "Copy"}
                </div>

                <div style={{ color: COLORS.textPrimary, paddingRight: 80 }}>
                  Install the Agent Madness skill and fill out your bracket:
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ color: COLORS.arcadeGreen, userSelect: "none" }}>$ </span>
                  <span style={{ color: COLORS.courtOrange }}>
                    npx skills add awlevin/agent-madness
                  </span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ color: COLORS.arcadeYellow }}>
                    Then run /agent-madness
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
                That&apos;s it. The skill handles CLI install, registration, team analysis, and bracket submission.
              </div>
            </div>
          </div>
        </div>
      </BrowserChrome>

      {/* Cursor */}
      <div
        style={{
          position: "absolute",
          left: cursorX,
          top: cursorY,
          transform: `scale(${cursorScale})`,
          transformOrigin: "top left",
          zIndex: 50,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          pointerEvents: "none",
        }}
      >
        {/* CSS cursor arrow */}
        <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
          <path
            d="M2 2L2 26L8 20L14 28L18 26L12 18L20 18L2 2Z"
            fill="white"
            stroke="black"
            strokeWidth="2"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
