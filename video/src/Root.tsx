import { Composition } from "remotion";
import { Reel, reelDuration } from "./Reel";
import { aromas, ideas } from "./reels";
import { Explainer, explainerDuration } from "./Explainer";
import { Combinaciones, combinacionesDuration } from "./Combinaciones";
import { Ranking, rankingDuration } from "./Ranking";
import { Ticket, ticketDuration } from "./Ticket";
import { Errores, erroresDuration } from "./Errores";
import { Difusor, difusorDuration } from "./Difusor";
import { ComoComprar, comoComprarDuration } from "./ComoComprar";
import { DiaMadre, diaMadreDuration } from "./DiaMadre";
import { DiaMadreCombos, diaMadreCombosDuration } from "./DiaMadreCombos";
import { Mascota, MASCOTA_LOOP } from "./Mascota";
import { GraciasDiez } from "./Messi";
import { GraciasLeoStory } from "./MessiStory";
import { Liquid, liquidDuration, Bento, bentoDuration } from "./Trends";
import { GeoVs, geoVsDuration, GeoAromas, geoAromasDuration, GeoRubros, geoRubrosDuration } from "./Geo";

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
      <Composition id="Difusor" component={Difusor} durationInFrames={difusorDuration} fps={30} width={1080} height={1920} />
      <Composition id="ComoComprar" component={ComoComprar} durationInFrames={comoComprarDuration} fps={30} width={1080} height={1920} />
      <Composition id="DiaMadre" component={DiaMadre} durationInFrames={diaMadreDuration} fps={30} width={1080} height={1920} />
      <Composition id="DiaMadreCombos" component={DiaMadreCombos} durationInFrames={diaMadreCombosDuration} fps={30} width={1080} height={1920} />
      <Composition id="GeoVs" component={GeoVs} durationInFrames={geoVsDuration} fps={30} width={1080} height={1920} />
      <Composition id="GeoAromas" component={GeoAromas} durationInFrames={geoAromasDuration} fps={30} width={1080} height={1920} />
      <Composition id="GeoRubros" component={GeoRubros} durationInFrames={geoRubrosDuration} fps={30} width={1080} height={1920} />
      <Composition id="Liquid" component={Liquid} durationInFrames={liquidDuration} fps={30} width={1080} height={1920} />
      <Composition id="Bento" component={Bento} durationInFrames={bentoDuration} fps={30} width={1080} height={1920} />
      <Composition id="MascotaSticker" component={Mascota} durationInFrames={MASCOTA_LOOP} fps={30} width={512} height={512} />
      <Composition id="GraciasDiez" component={GraciasDiez} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="GraciasLeoStory" component={GraciasLeoStory} durationInFrames={1} fps={30} width={1080} height={1920} />
    </>
  );
};
