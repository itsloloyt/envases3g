import { Composition } from "remotion";
import { Reel, reelDuration } from "./Reel";
import { aromas, ideas } from "./reels";
import { Explainer, explainerDuration } from "./Explainer";
import { Combinaciones, combinacionesDuration } from "./Combinaciones";
import { Ranking, rankingDuration } from "./Ranking";
import { Ticket, ticketDuration } from "./Ticket";
import { Errores, erroresDuration } from "./Errores";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="ReelAromas" component={Reel} durationInFrames={reelDuration(aromas)} fps={30} width={1080} height={1920} defaultProps={aromas} />
      <Composition id="ReelIdeas" component={Reel} durationInFrames={reelDuration(ideas)} fps={30} width={1080} height={1920} defaultProps={ideas} />
      <Composition id="Explicativo" component={Explainer} durationInFrames={explainerDuration} fps={30} width={1080} height={1920} />
      <Composition id="Combinaciones" component={Combinaciones} durationInFrames={combinacionesDuration} fps={30} width={1080} height={1920} />
      <Composition id="Ranking" component={Ranking} durationInFrames={rankingDuration} fps={30} width={1080} height={1920} />
      <Composition id="Ticket" component={Ticket} durationInFrames={ticketDuration} fps={30} width={1080} height={1920} />
      <Composition id="Errores" component={Errores} durationInFrames={erroresDuration} fps={30} width={1080} height={1920} />
    </>
  );
};
