import { Composition } from "remotion";
import { AgentMadnessDemo } from "./AgentMadnessDemo";
import { WalkthroughDemo } from "./WalkthroughDemo";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AgentMadnessDemo"
        component={AgentMadnessDemo}
        durationInFrames={FPS * 32}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="WalkthroughDemo"
        component={WalkthroughDemo}
        durationInFrames={FPS * 23}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
