import { useEffect, useState, useCallback, useRef } from "@wordpress/element";
import { loadJWPlayerScript } from "../utils/scriptloader";
import styled from "styled-components";
import { JWPlayer, TimeParam } from "../types/jwplayer";

interface IVideoPlayerProps {
  rawHtml: string;
  seek?: number;
  onTime?: (time: number) => void;
  onPlayerConfigParsed?: (config: IPlayerConfig) => void;
  onPlayerReady?: (player: JWPlayer) => void;
  onCaptionsChanged?: (idx: number) => void; // captions index
}

interface ISource {
  file: string;
}

export interface ITrack {
  file: string;
  label: string;
  kind: string;
}

// player callback params are different from the jwplayer definition
interface ICaptionsChangedParam {
  tracks: { id: string; label: string };
  track: number;
  type: string;
}

interface IPlaylistItem {
  title: string;
  image?: string;
  sources: ISource[];
  tracks: ITrack[];
}

export interface IPlayerConfig {
  flashplayer: string;
  playlist: IPlaylistItem[];
  primary: string;
  hlshtml: string;
  width: string;
  aspectratio: string;
  autostart: string;
  repeat: string;
  controls: string;
  rtmp: {
    bufferlength: string;
  };
}

interface IPlayer {
  jwPlayerSrc: string;
  jwPlayerKey: string;
  config: IPlayerConfig;
}

function parsePlayerConfig(rawObj: string): IPlayerConfig {
  const evalFunc = Function(`"use strict";return (${rawObj})`);
  return evalFunc() as IPlayerConfig;
}

function parseRawHtml(html: string): IPlayer {
  // grab source and key
  const src = html.match(/src="(.*)\.js*/);
  const key = html.match(/jwplayer.key="(.*)";/);
  const playerSource = src && src[1] ? `https:${src[1]}.js` : null;
  const playerKey = (key && key[1]) || null;

  // grab js config object
  const config = html.match(/\.setup\(([\s\S]*)}\);/);
  const playerConfig =
    config && config[1] ? parsePlayerConfig(`${config[1]}}`) : null; // TODO get regex to work w/ last character

  // convert playerConfig to a valid JS object
  if (playerSource && playerKey && playerConfig) {
    return {
      jwPlayerSrc: playerSource,
      jwPlayerKey: playerKey,
      config: playerConfig
    };
  }
  throw new Error("Unable to Parse Player HTML");
}

const VideoPlayerContainer = styled.div`
  position: relative;
  max-height: inherit;
  flex: 1;
  display: flex;
  margin: 20px;
`;

export default function VideoPlayer(props: IVideoPlayerProps) {
  const {
    rawHtml,
    seek,
    onTime,
    onPlayerReady,
    onPlayerConfigParsed,
    onCaptionsChanged
  } = props;
  const [jwPlayer, setjwPlayer] = useState<JWPlayer | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const setUpJWPlayer = useCallback(
    async (player: IPlayer): Promise<void> => {
      function handleTime(param: TimeParam) {
        if (onTime) {
          onTime(Math.floor(param.position * 1000));
        }
      }

      function handleCaptionsChange(param: ICaptionsChangedParam): void {
        // track 0 is "off"
        const { track } = param;
        if (onCaptionsChanged && track > 0) {
          onCaptionsChanged(track - 1);
        }
      }

      const jwStatic = await loadJWPlayerScript(
        document,
        player.jwPlayerSrc,
        "jw-player",
        player.jwPlayerKey
      );

      if (playerRef.current) {
        const p = jwStatic(playerRef.current);
        p.setup({
          ...player.config,
          events: { onTime: handleTime, onCaptionsChange: handleCaptionsChange }
        });
        setjwPlayer(p);
        if (onPlayerReady) {
          onPlayerReady(p);
        }
      }
    },
    [playerRef, onTime, onPlayerReady]
  );

  useEffect(() => {
    const player = parseRawHtml(rawHtml);
    if (onPlayerConfigParsed) {
      onPlayerConfigParsed(player.config);
    }
    if (player) {
      setUpJWPlayer(player);
    }
  }, [rawHtml, setUpJWPlayer, onPlayerConfigParsed]);

  // seeking

  useEffect(() => {
    if (seek !== undefined && jwPlayer) {
      jwPlayer.seek(seek);
    }
  }, [seek, jwPlayer]);

  return (
    <VideoPlayerContainer>
      <div ref={playerRef}></div>
    </VideoPlayerContainer>
  );
}
