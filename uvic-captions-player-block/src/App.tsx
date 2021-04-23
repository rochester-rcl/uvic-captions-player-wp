import {
  createContext,
  useEffect,
  useState,
  useCallback
} from "@wordpress/element";
// import Subtitles from "./components/Subtitles";
import VideoPlayer, { IPlayerConfig, ITrack } from "./components/VideoPlayer";
import { loadHypothesisScript } from "./utils/scriptloader";
import styled from "styled-components";

import { JWPlayerStatic } from "./types/jwplayer";
declare global {
  interface Window {
    jwplayer?: JWPlayerStatic;
  }
}

const rawHtml = `<div style="width: 100%; max-width: 512px;">
<div style="border: 1px solid #000; position: relative; width: 100%; padding: 0;" id="VidPlayerPlaceholder_3884" class="videoplayer">
</div>
<script type="text/javascript" src="//www.uvic.ca/video/player/js/7.11.2/jwplayer.js"></script>
<script type="text/javascript">jwplayer.key="UJGcVouk597phvGZrziZMHAb3IRluP27vKFmTIMbWyw=";</script>
<script type="text/javascript">
var p = jwplayer('VidPlayerPlaceholder_3884').setup({
flashplayer: "//www.uvic.ca/video/player/jwplayer.flash.swf",
playlist: [
{ title: "", image: "//hlsvod.uvic.ca/vod/mediaservices/UVic-webcasting.jpg", sources: [{ file: "//hlsvod.uvic.ca/hls-vod/tsobie/AdamsonFacultyDevelopment.mp4.m3u8"}], tracks: [{ file: "https://hlsvod.uvic.ca/vod/tsobie/AdamsonFacultyDevelopmentCaptions.vtt", label: "", kind: "captions"}]}
],
primary: 'html5',
hlshtml: 'true',
width: '100%',
aspectratio: '16:9',
autostart: 'false',
repeat: 'false',
controls: 'true',
rtmp: {
bufferlength: '5'
}
});
p.setVolume(50);
</script></div><!-- Closes video player -->`;

const AppContainer = styled.div`
  display: "flex",
  justifyContent: "flex-start",
  height: "100vh",
  overflow: "hidden"
`;

const NoPlayerWarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
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
