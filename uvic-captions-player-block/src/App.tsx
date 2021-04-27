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

const AppContainerLandscape = `
  grid-template-columns: 50% 50%;
  align-items: stretch;
  grid-auto-rows: 1fr;
`;

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

const AppContainer = styled.div`
  ${AppContainerBase}
  ${(props: IAppContainerProps) =>
    props.portrait ? AppContainerPortrait : AppContainerLandscape}
`;

const NoPlayerWarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const NoPlayerWarning = styled.h1`
  padding: 10px;
`;

interface AppCtxValue {
  currentTime: number;
  subtitleTrack: ITrack | null;
  setTime: (time: number) => void;
  appProps: IAppProps;
}

const defaultAppCtxValue: AppCtxValue = {
  currentTime: 0,
  subtitleTrack: null,
  setTime: (time: number) => {},
  appProps: { loadHypothesis: true, responsive: true }
};

export const AppCtx = createContext(defaultAppCtxValue);
export const DYNAMIC_PLAYER_EMBED_ID = "dynamic-player-embed-block";

export interface IAppProps {
  loadHypothesis: boolean;
  playerEmbed?: string;
  width?: string;
  height?: string;
  fontFamily?: string;
  responsive: boolean;
}

interface IAppContainerProps {
  width?: string;
  height?: string;
  fontFamily?: string;
  portrait: boolean;
}

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
    subtitleTracks.length > currentTrackIdx
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
      <AppContainer>
        <NoPlayerWarningContainer>
          <NoPlayerWarning>
            No Player Embed Code Found. Please check your post and try again.
          </NoPlayerWarning>
        </NoPlayerWarningContainer>
      </AppContainer>
    );
  }
}

export default App;
