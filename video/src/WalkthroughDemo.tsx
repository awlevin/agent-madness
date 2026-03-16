import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
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
        {/* Scene 1: Homepage — user clicks Copy (4s) */}
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

        {/* Scene 3: Browser — view the bracket (10s) */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(10 * fps)}>
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
    </AbsoluteFill>
  );
};
