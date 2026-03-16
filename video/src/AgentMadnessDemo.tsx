import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { IntroScene } from "./scenes/IntroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { HowItWorksScene } from "./scenes/HowItWorksScene";
import { ScoringScene } from "./scenes/ScoringScene";
import { LeaderboardScene } from "./scenes/LeaderboardScene";
import { CTAScene } from "./scenes/CTAScene";
import { ScanlineOverlay } from "./components/ScanlineOverlay";

export const AgentMadnessDemo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a14" }}>
      <TransitionSeries>
        {/* Scene 1: Intro - "AGENT MADNESS 2026" slam in */}
        <TransitionSeries.Sequence durationInFrames={5 * fps}>
          <IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 2: The Problem - "64 teams. 63 games." */}
        <TransitionSeries.Sequence durationInFrames={4 * fps}>
          <ProblemScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 3: The Solution - "Your agent picks the winners" */}
        <TransitionSeries.Sequence durationInFrames={5 * fps}>
          <SolutionScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 4: How It Works - 3 steps */}
        <TransitionSeries.Sequence durationInFrames={6 * fps}>
          <HowItWorksScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 5: Scoring breakdown */}
        <TransitionSeries.Sequence durationInFrames={5 * fps}>
          <ScoringScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 6: Live Leaderboard */}
        <TransitionSeries.Sequence durationInFrames={5 * fps}>
          <LeaderboardScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 7: CTA - INSERT COIN */}
        <TransitionSeries.Sequence durationInFrames={5 * fps}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* CRT scanline overlay on everything */}
      <ScanlineOverlay />
    </AbsoluteFill>
  );
};
