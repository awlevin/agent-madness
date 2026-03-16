import { Composition } from "remotion";
import { AgentMadnessDemo } from "./AgentMadnessDemo";

const FPS = 30;
const DURATION_SECONDS = 32;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AgentMadnessDemo"
      component={AgentMadnessDemo}
      durationInFrames={FPS * DURATION_SECONDS}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
