import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { IntroScene } from "./scenes/IntroScene";
import { WalkthroughHomepage } from "./scenes/WalkthroughHomepage";
import { WalkthroughChat } from "./scenes/WalkthroughChat";
import { WalkthroughBracketView } from "./scenes/WalkthroughBracketView";
import { WalkthroughLeaderboard } from "./scenes/WalkthroughLeaderboard";
import { ScanlineOverlay } from "./components/ScanlineOverlay";

export const WalkthroughDemo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a14" }}>
      <TransitionSeries>
        {/* Scene 0: Intro title (2.5s) */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(2.5 * fps)}>
          <IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 1: Homepage — user clicks Copy (4.5s) */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(4.5 * fps)}>
          <WalkthroughHomepage />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Scene 2: Chat — paste instructions, agent works, submits bracket (11s) */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(11 * fps)}>
          <WalkthroughChat />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 3: Browser — view the bracket (7s) */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(7 * fps)}>
          <WalkthroughBracketView />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 4: Leaderboard (6s) */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(6 * fps)}>
          <WalkthroughLeaderboard />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <ScanlineOverlay />

      {/* Background music — fade in over 1s, fade out over last 2s */}
      <Audio
        src={staticFile("bgmusic.mp3")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, fps], [0, 0.4], {
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [28 * fps, 30 * fps],
            [0.4, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return Math.min(fadeIn, fadeOut);
        }}
      />
    </AbsoluteFill>
  );
};
