import { Composition } from "remotion";
import { Reel, reelDuration } from "./Reel";
import { aromas, ideas } from "./reels";
import { Explainer, explainerDuration } from "./Explainer";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="ReelAromas" component={Reel} durationInFrames={reelDuration(aromas)} fps={30} width={1080} height={1920} defaultProps={aromas} />
      <Composition id="ReelIdeas" component={Reel} durationInFrames={reelDuration(ideas)} fps={30} width={1080} height={1920} defaultProps={ideas} />
      <Composition id="Explicativo" component={Explainer} durationInFrames={explainerDuration} fps={30} width={1080} height={1920} />
    </>
  );
};
