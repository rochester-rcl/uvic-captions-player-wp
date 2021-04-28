import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from "@wordpress/element";
import Subtitles from "./components/subtitles/Subtitles";
import VideoPlayer, { IPlayerConfig, ITrack } from "./components/VideoPlayer";
import { loadHypothesisScript } from "./utils/scriptloader";
import styled from "styled-components";
import { isEmptyOrUndefined } from "./utils/string";
import "./styles/fonts.css";

import { JWPlayerStatic } from "./types/jwplayer";

declare global {
  interface Window {
    jwplayer?: JWPlayerStatic;
  }
}
/**
 * App container mixin component.
 *
 * @param props - see IAppContainerProps interface
 * @returns
 */
const AppContainerBase = (props: IAppContainerProps) => `
  display: grid;
  font-family:
    ${
      isEmptyOrUndefined(props.fontFamily)
        ? '"Roboto Condensed", Helvetica, sans-serif'
        : props.fontFamily
    };
  font-weight: 400;
  width: ${isEmptyOrUndefined(props.width) ? "auto" : props.width + "px"};
  height: ${isEmptyOrUndefined(props.height) ? "500" : props.height}px;
`;

/**
 * Mixin styles for landscape app display
 */
const AppContainerLandscape = `
  grid-template-columns: 50% 50%;
  align-items: stretch;
  grid-auto-rows: 1fr;
`;

/**
 * Mixin styles for portrait app display
 *
 * @param props - see IAppContainerProps interface
 * @returns
 */
const AppContainerPortrait = (props: IAppContainerProps) => `
  grid-template-columns: 1fr;
  align-items: stretch;
  grid-template-rows: 50% 50%;
  height: ${
    isEmptyOrUndefined(props.height)
      ? "1000"
      : (parseInt(props.height || "1000", 10) * 2).toString()
  }px;
`;

/**
 * Component for setting the height, width, font-family, and layout of the app
 */
const AppContainer = styled.div`
  ${AppContainerBase}
  ${(props: IAppContainerProps) =>
    props.portrait ? AppContainerPortrait : AppContainerLandscape}
`;

/**
 * Container component to display a warning if JWPlayer content couldn't be parsed
 */
const NoPlayerWarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: ${(props: IAppContainerProps) =>
    isEmptyOrUndefined(props.height) ? "500" : props.height}px;
`;

/**
 * Header component to display a warning if JWPlayer couldn't be parsed
 */
const NoPlayerWarning = styled.h2`
  padding: 10px;
`;

/**
 * Interface for all available properties in AppCtx
 */
interface AppCtxValue {
  currentTime: number;
  subtitleTrack: ITrack | null;
  setTime: (time: number) => void;
  appProps: IAppProps;
}

/**
 * Default prop values provided with AppCtx
 */
const defaultAppCtxValue: AppCtxValue = {
  currentTime: 0,
  subtitleTrack: null,
  setTime: (time: number) => null,
  appProps: { loadHypothesis: true, responsive: true }
};

export const AppCtx = createContext(defaultAppCtxValue);
export const DYNAMIC_PLAYER_EMBED_ID = "dynamic-player-embed-block";

/**
 * All available props for the App component
 */
export interface IAppProps {
  loadHypothesis: boolean;
  playerEmbed?: string;
  width?: string;
  height?: string;
  fontFamily?: string;
  responsive: boolean;
}

/**
 * All available props for the AppContainer component
 */
interface IAppContainerProps {
  width?: string;
  height?: string;
  fontFamily?: string;
  portrait: boolean;
}

/**
 * Main root component to render and sync a JWPlayer and its accompanying subtitles
 *
 * @param props - see IAppProps interface
 * @returns
 */
function App(props: IAppProps) {
  const { loadHypothesis, playerEmbed, responsive, ...rest } = props;
  const appRef = useRef<HTMLDivElement | null>(null);
  const [currentTime, setCurrentTime] = useState(
    defaultAppCtxValue.currentTime
  );
  const [seek, setSeek] = useState<number | undefined>(undefined);
  const [subtitleTracks, setSubtitleTracks] = useState<ITrack[]>([]);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [portrait, setPortrait] = useState(false);

  const handleConfig = useCallback(
    (config: IPlayerConfig): void => {
      // retrieve subtitle tracks from config - for now just grab the first tracks from playlist
      setSubtitleTracks(config.playlist[0].tracks);
    },
    [setSubtitleTracks]
  );

  const handleCaptionsChange = useCallback(
    (idx: number) => {
      setCurrentTrackIdx(idx);
    },
    [setCurrentTrackIdx]
  );

  const setTime = useCallback((time: number) => setSeek((time + 100) / 1000), [
    setSeek
  ]);

  useEffect(() => {
    if (loadHypothesis) {
      loadHypothesisScript(document);
    }
  }, [loadHypothesis]);

  useEffect(() => {
    function handleResize() {
      if (appRef.current) {
        const parent = appRef.current.parentElement;
        if (parent) {
          const { width } = parent.getBoundingClientRect();
          if (width < 738) {
            setPortrait(true);
          } else {
            setPortrait(false);
          }
        }
      }
    }

    if (responsive) {
      window.addEventListener("resize", handleResize);
      handleResize();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [responsive, appRef]);

  const subtitleTrack =
    subtitleTracks && subtitleTracks.length > currentTrackIdx
      ? subtitleTracks[currentTrackIdx]
      : null;

  if (playerEmbed) {
    return (
      <AppCtx.Provider
        value={{ currentTime, subtitleTrack, setTime, appProps: props }}
      >
        <AppContainer ref={appRef} portrait={portrait} {...rest}>
          <Subtitles />
          <VideoPlayer
            seek={seek}
            rawHtml={playerEmbed}
            onTime={setCurrentTime}
            onPlayerConfigParsed={handleConfig}
            onCaptionsChanged={handleCaptionsChange}
          />
        </AppContainer>
      </AppCtx.Provider>
    );
  } else {
    return (
      <NoPlayerWarningContainer>
        <NoPlayerWarning>
          No Player Embed Code Found. Please check your block configuration and try again.
        </NoPlayerWarning>
      </NoPlayerWarningContainer>
    );
  }
}

export default App;
