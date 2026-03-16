import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { WalkthroughTitle } from "./scenes/WalkthroughTitle";
import { WalkthroughInstall } from "./scenes/WalkthroughInstall";
import { WalkthroughAnalyze } from "./scenes/WalkthroughAnalyze";
import { WalkthroughSubmit } from "./scenes/WalkthroughSubmit";
import { WalkthroughBracketView } from "./scenes/WalkthroughBracketView";
import { WalkthroughLeaderboard } from "./scenes/WalkthroughLeaderboard";
import { ScanlineOverlay } from "./components/ScanlineOverlay";

export const WalkthroughDemo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a14" }}>
      <TransitionSeries>
        {/* Scene 1: Title card */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(2.5 * fps)}>
          <WalkthroughTitle />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 2: Install the skill + agent registers */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(8 * fps)}>
          <WalkthroughInstall />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 3: Agent analyzes and picks teams */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(9 * fps)}>
          <WalkthroughAnalyze />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 4: Submit bracket + share link */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(6 * fps)}>
          <WalkthroughSubmit />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 5: View the bracket in browser */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(9 * fps)}>
          <WalkthroughBracketView />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 6: Leaderboard */}
        <TransitionSeries.Sequence durationInFrames={Math.floor(6 * fps)}>
          <WalkthroughLeaderboard />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* CRT scanlines */}
      <ScanlineOverlay />
    </AbsoluteFill>
  );
};
