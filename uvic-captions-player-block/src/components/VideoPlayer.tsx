import { useEffect, useState, useCallback, useRef } from "@wordpress/element";
import { loadJWPlayerScript } from "../utils/scriptloader";
import styled from "styled-components";
import { JWPlayer, TimeParam } from "../types/jwplayer";
import Palette from "../styles/palette";
import { v4 as uuidv4 } from "uuid";

/**
 * Interface for high-level VideoPlayer component props
 */
interface IVideoPlayerProps {
  rawHtml: string;
  seek?: number;
  onTime?: (time: number) => void;
  onPlayerConfigParsed?: (config: IPlayerConfig) => void;
  onPlayerReady?: (player: JWPlayer) => void;
  onCaptionsChanged?: (idx: number) => void; // captions index
}

/**
 * Interface representing a JWPlayer source objectBut
 */
interface ISource {
  file: string;
}

/**
 * Interface representing a JWPlayer track object
 */
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

/**
 * Represents a JWPlayer Playlist item
 */
interface IPlaylistItem {
  title: string;
  image?: string;
  sources: ISource[];
  tracks: ITrack[];
}

/**
 * Interface for a standard JWPlayer config
 */
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

/**
 * Higher-level interface for storing parsed JWPlayer info
 */
interface IPlayer {
  jwPlayerSrc: string;
  jwPlayerKey: string;
  config: IPlayerConfig;
}

/**
 * Parses a stringified JWPlayer config and returns it
 * as a JS object
 * WARNING - uses eval and could pose a security threat
 * if used outside of this context
 *
 * @param rawObj - the raw stringified JS Object (not JSON)
 * @returns
 */
function parsePlayerConfig(rawObj: string): IPlayerConfig {
  const evalFunc = Function(`"use strict";return (${rawObj})`);
  return evalFunc() as IPlayerConfig;
}

/**
 * Parses a raw html string and attempts to extract
 * the JWPlayer source script, key, and config
 *
 * @param html - raw html snippet containing
 * the JWPlayer constructor and config
 * @returns
 */
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

/**
 * Flex container component to house the JWPlayer element
 */
const VideoPlayerContainer = styled.div`
  position: relative;
  max-height: inherit;
  background: ${Palette.Black};
  display: flex;
  margin: 20px;
  min-width: 350px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`;

/**
 * The root VideoPlayer component. Renders a JWPlayer parsed
 * from a raw html snippet
 *
 * @param props - see the IVideoPlayerProps interface
 * @returns
 */
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

      const jwStatic =
        window.jwplayer ||
        (await loadJWPlayerScript(
          document,
          player.jwPlayerSrc,
          "jw-player-script",
          player.jwPlayerKey
        ));
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
    <VideoPlayerContainer className="uvic-player-video-container">
      <div id={`jw-player-ref-${uuidv4()}`} ref={playerRef}></div>
    </VideoPlayerContainer>
  );
}
