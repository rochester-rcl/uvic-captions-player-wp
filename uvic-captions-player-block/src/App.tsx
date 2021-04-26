import {
  createContext,
  useEffect,
  useState,
  useCallback
} from "@wordpress/element";
import Subtitles from "./components/Subtitles";
import VideoPlayer, { IPlayerConfig, ITrack } from "./components/VideoPlayer";
import { loadHypothesisScript } from "./utils/scriptloader";
import styled from "styled-components";

import "./styles/fonts.css";

import { JWPlayerStatic } from "./types/jwplayer";
declare global {
  interface Window {
    jwplayer?: JWPlayerStatic;
  }
}

const AppContainer = styled.div`
  display: grid;
  font-family: "Roboto Condensed", Helvetica, sans-serif;
  grid-template-columns: 50% 50%;
  align-items: stretch;
  font-weight: 400;
  grid-auto-rows: 1fr;
  height: 500px;
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
}

const defaultAppCtxValue: AppCtxValue = {
  currentTime: 0,
  subtitleTrack: null,
  setTime: (time: number) => {}
};

export const AppCtx = createContext(defaultAppCtxValue);
export const DYNAMIC_PLAYER_EMBED_ID = "dynamic-player-embed-block";

function App(props: { loadHypothesis: boolean; playerEmbed?: string }) {
  const { loadHypothesis, playerEmbed } = props;
  const [currentTime, setCurrentTime] = useState(
    defaultAppCtxValue.currentTime
  );
  const [seek, setSeek] = useState<number | undefined>(undefined);
  const [subtitleTracks, setSubtitleTracks] = useState<ITrack[]>([]);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
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

  const subtitleTrack =
    subtitleTracks.length > currentTrackIdx
      ? subtitleTracks[currentTrackIdx]
      : null;
  if (playerEmbed) {
    return (
      <AppCtx.Provider value={{ currentTime, subtitleTrack, setTime }}>
        <AppContainer>
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
