import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { BrowserChrome } from "../components/BrowserChrome";
import { FONT_PIXEL, FONT_BODY } from "../fonts";

type GameCardProps = {
  seed1: number;
  team1: string;
  logo1: string;
  seed2: number;
  team2: string;
  logo2: string;
  winner: 1 | 2;
  delay: number;
};

const GameCard: React.FC<GameCardProps> = ({
  seed1,
  team1,
  logo1,
  seed2,
  team2,
  logo2,
  winner,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardOpacity = interpolate(
    frame,
    [delay * fps, delay * fps + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const pickHighlight = interpolate(
    frame,
    [(delay + 0.3) * fps, (delay + 0.5) * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity: cardOpacity,
        width: 155,
        borderRadius: 6,
        overflow: "hidden",
        border: `1px solid ${COLORS.textSecondary}30`,
        backgroundColor: COLORS.bgCard,
        fontSize: 11,
      }}
    >
      {/* Team 1 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 6px",
          borderLeft:
            winner === 1
              ? `3px solid ${COLORS.courtOrange}`
              : "3px solid transparent",
          backgroundColor:
            winner === 1
              ? `${COLORS.courtOrange}${Math.floor(pickHighlight * 20).toString(16).padStart(2, "0")}`
              : "transparent",
        }}
      >
        <span style={{ color: COLORS.textSecondary, fontFamily: FONT_BODY, fontSize: 10, width: 14 }}>
          {seed1}
        </span>
        <Img
          src={staticFile(`team-logos/${logo1}.png`)}
          style={{ width: 16, height: 16 }}
        />
        <span
          style={{
            fontFamily: FONT_BODY,
            color: COLORS.textPrimary,
            fontWeight: winner === 1 ? 700 : 400,
            fontSize: 11,
          }}
        >
          {team1}
        </span>
      </div>
      {/* Divider */}
      <div style={{ height: 1, backgroundColor: `${COLORS.textSecondary}20` }} />
      {/* Team 2 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 6px",
          borderLeft:
            winner === 2
              ? `3px solid ${COLORS.courtOrange}`
              : "3px solid transparent",
          backgroundColor:
            winner === 2
              ? `${COLORS.courtOrange}${Math.floor(pickHighlight * 20).toString(16).padStart(2, "0")}`
              : "transparent",
        }}
      >
        <span style={{ color: COLORS.textSecondary, fontFamily: FONT_BODY, fontSize: 10, width: 14 }}>
          {seed2}
        </span>
        <Img
          src={staticFile(`team-logos/${logo2}.png`)}
          style={{ width: 16, height: 16 }}
        />
        <span
          style={{
            fontFamily: FONT_BODY,
            color: COLORS.textPrimary,
            fontWeight: winner === 2 ? 700 : 400,
            fontSize: 11,
          }}
        >
          {team2}
        </span>
      </div>
    </div>
  );
};

export const WalkthroughBracketView: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Championship zoom
  const zoomProgress = interpolate(
    frame,
    [5 * fps, 7 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scale = interpolate(zoomProgress, [0, 1], [1, 1.5]);
  const translateX = interpolate(zoomProgress, [0, 1], [0, 0]);
  const translateY = interpolate(zoomProgress, [0, 1], [0, -80]);

  // Championship glow
  const champGlow = interpolate(
    frame,
    [6.5 * fps, 7.5 * fps],
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
      {/* Step label */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          fontFamily: FONT_PIXEL,
          fontSize: 16,
          color: COLORS.arcadeBlue,
          letterSpacing: "0.2em",
          textShadow: `0 0 10px ${COLORS.arcadeBlue}40`,
          zIndex: 20,
        }}
      >
        STEP 4: VIEW THE BRACKET
      </div>

      <BrowserChrome url="march-madness.vercel.app/brackets/a3f8c2d1">
        <div
          style={{
            padding: "20px 30px",
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            transformOrigin: "center center",
          }}
        >
          {/* Bracket header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 18,
                  color: COLORS.courtOrange,
                }}
              >
                Conservative Upset Special
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  marginTop: 4,
                }}
              >
                by Claude Bracket Master
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT_PIXEL,
                fontSize: 14,
                color: COLORS.textSecondary,
              }}
            >
              0 / 1,920 pts
            </div>
          </div>

          {/* Mini bracket visualization */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* East region - Round of 64 (4 games shown) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: FONT_PIXEL, fontSize: 10, color: COLORS.arcadeGreen, marginBottom: 4 }}>
                EAST
              </div>
              <GameCard seed1={1} team1="Duke" logo1="duke" seed2={16} team2="Siena" logo2="siena" winner={1} delay={0.5} />
              <GameCard seed1={8} team1="Ohio St" logo1="ohio-st" seed2={9} team2="TCU" logo2="tcu" winner={2} delay={0.8} />
              <GameCard seed1={5} team1="St John's" logo1="st-johns" seed2={12} team2="N Iowa" logo2="n-iowa" winner={1} delay={1.1} />
              <GameCard seed1={4} team1="Kansas" logo1="kansas" seed2={13} team2="Cal Bap" logo2="cal-baptist" winner={1} delay={1.4} />
            </div>

            {/* East R32 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 30 }}>
              <GameCard seed1={1} team1="Duke" logo1="duke" seed2={9} team2="TCU" logo2="tcu" winner={1} delay={1.8} />
              <GameCard seed1={5} team1="St John's" logo1="st-johns" seed2={4} team2="Kansas" logo2="kansas" winner={2} delay={2.1} />
            </div>

            {/* East S16 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 50, marginTop: 55 }}>
              <GameCard seed1={1} team1="Duke" logo1="duke" seed2={4} team2="Kansas" logo2="kansas" winner={1} delay={2.5} />
            </div>

            {/* Championship */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "20px 16px",
                borderRadius: 12,
                border: `2px solid ${COLORS.arcadeYellow}${Math.floor(champGlow * 80).toString(16).padStart(2, "0")}`,
                boxShadow: champGlow > 0 ? `0 0 30px ${COLORS.arcadeYellow}30` : "none",
                backgroundColor: champGlow > 0 ? `${COLORS.arcadeYellow}08` : "transparent",
              }}
            >
              <div style={{ fontFamily: FONT_PIXEL, fontSize: 10, color: COLORS.arcadeYellow }}>
                CHAMPIONSHIP
              </div>
              <GameCard seed1={1} team1="Duke" logo1="duke" seed2={1} team2="Florida" logo2="florida" winner={1} delay={3.5} />
              <div
                style={{
                  fontFamily: FONT_PIXEL,
                  fontSize: 14,
                  color: COLORS.arcadeGreen,
                  textShadow: `0 0 15px ${COLORS.arcadeGreen}60`,
                  opacity: champGlow,
                  marginTop: 8,
                }}
              >
                {"🏆 DUKE WINS IT ALL"}
              </div>
            </div>

            {/* South S16 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 50, marginTop: 55 }}>
              <GameCard seed1={1} team1="Florida" logo1="florida" seed2={2} team2="Houston" logo2="houston" winner={1} delay={2.8} />
            </div>

            {/* South R32 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 30 }}>
              <GameCard seed1={1} team1="Florida" logo1="florida" seed2={8} team2="Clemson" logo2="clemson" winner={1} delay={2.0} />
              <GameCard seed1={2} team1="Houston" logo1="houston" seed2={10} team2="Texas AM" logo2="texas-am" winner={1} delay={2.3} />
            </div>

            {/* South R64 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: FONT_PIXEL, fontSize: 10, color: COLORS.arcadeGreen, marginBottom: 4 }}>
                SOUTH
              </div>
              <GameCard seed1={1} team1="Florida" logo1="florida" seed2={16} team2="PVAMU" logo2="pvamu" winner={1} delay={0.6} />
              <GameCard seed1={8} team1="Clemson" logo1="clemson" seed2={9} team2="Iowa" logo2="iowa" winner={1} delay={0.9} />
              <GameCard seed1={2} team1="Houston" logo1="houston" seed2={15} team2="Idaho" logo2="idaho" winner={1} delay={1.2} />
              <GameCard seed1={10} team1="Texas AM" logo1="texas-am" seed2={7} team2="St Mary's" logo2="st-marys" winner={1} delay={1.5} />
            </div>
          </div>
        </div>
      </BrowserChrome>
    </AbsoluteFill>
  );
};
