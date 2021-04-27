import { useState, useEffect, useContext } from "@wordpress/element";
import { parseSync } from "subtitle";
import { AppCtx } from "../../App";
import SubtitleList from "./SubtitleList";
import type { ISubtitle } from "./types";

/**
 * Retrieves subtitles from a url in raw text format0
 *
 * @param url - the url to the subtitle file (srt or webvtt)
 * @returns
 */
async function loadSubtitlesFromUrl(url: string): Promise<ISubtitle[]> {
  const result: string = await fetch(url).then((res: Response) => res.text());
  const subtitles = parseSync(result);
  return subtitles.map(node => node as ISubtitle);
}

export default function Subtitles() {
  const { subtitleTrack } = useContext(AppCtx);
  const [subs, setSubs] = useState<ISubtitle[] | null>(null);

  useEffect(() => {
    if (subtitleTrack) {
      loadSubtitlesFromUrl(subtitleTrack.file).then(subtitles =>
        setSubs(subtitles)
      );
    }
  }, [subtitleTrack, setSubs, loadSubtitlesFromUrl]);

  return <SubtitleList subtitles={subs || []} />;
}
