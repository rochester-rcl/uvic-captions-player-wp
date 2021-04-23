import { useState, useEffect, useContext, useRef, useMemo } from "@wordpress/element";
import { parseSync, formatTimestamp } from "subtitle";
import styled, { css } from "styled-components";
import Palette from "../utils/palette";
import { AppCtx } from "../App";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

interface ISubtitleData {
  start: number;
  end: number;
  text: string;
}

interface ISubtitle {
  type: string;
  data: ISubtitleData;
}

interface ISubtitleListProps {
  subtitles: ISubtitle[];
  onClickSubtitle?: (startTime: number) => void;
}

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

const SubtitleDisplayContainer = styled.div`
  padding: 5px;
  display: flex;
  align-items: baseline;
  cursor: pointer;
  color: ${(props: ISubtitleTextProps) =>
    props.active ? Palette.DarkBlue : Palette.LightGray};
  transition: color 300ms ease-in-out;
  &:hover {
    color: ${Palette.DarkBlue};
  }
`;

const SubtitleTimecode = styled.span`
  font-size: 15px;
  margin-right: 10px;
  flex: 0.1;
`;

interface ISubtitleTextProps {
  active: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}
const SubtitleText = styled.span`
  font-size: 18px;
  flex: 0.9;
  padding-bottom: 10px;
`;

interface ISubtitleDisplayProps {
  subtitle: ISubtitle;
  autoScroll: Boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
}

function SubtitleDisplay(props: ISubtitleDisplayProps) {
  const { subtitle, autoScroll, scrollRef } = props;
  const { setTime } = useContext(AppCtx);
  const subRef = useRef<HTMLDivElement>(null);
  const { start, end, text } = props.subtitle.data;
  const { currentTime } = useContext(AppCtx);
  const active = currentTime >= start && currentTime <= end;

  function handleClick(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    setTime(start);
  }

  useEffect(() => {
    if (autoScroll && active) {
      const { current } = subRef;
      if (current) {
        const parent = current.parentElement;
        if (parent && scrollRef.current) {
          scrollRef.current.scrollTop = current.offsetTop - parent.offsetTop;
        }
      }
    }
  }, [active, autoScroll, subRef, scrollRef]);

  return (
    <SubtitleDisplayContainer
      ref={subRef}
      active={active}
      onClick={handleClick}
    >
      <SubtitleTimecode>
        {formatTimestamp(start).replace(/\,(.*)/g, "")}
      </SubtitleTimecode>
      <SubtitleText>{text}</SubtitleText>
    </SubtitleDisplayContainer>
  );
}

const SubtitleListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 0.8;
  margin: 20px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`;

const SubtitleListToolsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  padding: 20px;
  background: ${Palette.DarkBlue};
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`;

const SubtitleListFilterInput = styled.input`
  border: none;
  color: ${Palette.White};
  background: none;
  font-size: 20px;
  height: 50px;
  max-width: 400px;
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: ${Palette.White};
  }
`;

const SubtitleListFilterInputContainer = styled.div`
  display: flex;
  align-items: baseline;
  justifty-content: flex-start;
  border-bottom: 2px solid ${Palette.White};
`;

interface IAutoScrollButtonProps {
  active: boolean;
}

const ButtonBase = css`
  cursor: pointer;
  border: none;
  color: ${Palette.White};
  &:focus {
    border: none;
    outline: none;
  }
`;

const SubtitleListAutoScrollButton = styled.button`
  ${ButtonBase}
  width: 100px;
  height: 25px;
  border-radius: 2px;
  background: ${(props: IAutoScrollButtonProps) =>
    props.active ? Palette.Red : Palette.LightGray};
  &:focus {
    border: none;
    outline: none;
  }
`;

const SubtitleListClearFilterButton = styled.button`
  ${ButtonBase}
  border-radius: 2px;
  color: ${Palette.White};
  background: none;
  width: 16px;
  height: 16px;
  padding: 2px;
  font-size: 16px;
  font-family: "Roboto Condensed Bold", Helvetica, sans-serif;
  font-weight: 700;
`;

function SubtitleList(props: ISubtitleListProps) {
  const { subtitles } = props;
  const filterInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fitlerVal, setFilterVal] = useState<string>("");
  const [autoScroll, setAutoScroll] = useState(false);

  function handleFilterValChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setFilterVal(evt.target.value);
  }

  function handleAutoScrollButtonClick(
    evt: React.MouseEvent<HTMLButtonElement>
  ) {
    setAutoScroll(!autoScroll);
  }

  function handleClearFilterButtonClick(
    evt: React.MouseEvent<HTMLButtonElement>
  ) {
    setFilterVal("");
  }

  const subs = useMemo(
    () =>
      subtitles.filter(
        sub => sub.type !== "header" && sub.data.text.includes(fitlerVal)
      ),
    [subtitles, fitlerVal]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = "smooth";
    }
  }, [scrollRef]);
  return (
    <SubtitleListContainer>
      <SubtitleListToolsContainer>
        <SubtitleListFilterInputContainer>
          <SubtitleListFilterInput
            placeholder={"Search Captions ..."}
            ref={filterInputRef}
            value={fitlerVal}
            onChange={handleFilterValChange}
          />
          <SubtitleListClearFilterButton onClick={handleClearFilterButtonClick}>
            &#10006;
          </SubtitleListClearFilterButton>
        </SubtitleListFilterInputContainer>
        <SubtitleListAutoScrollButton
          active={autoScroll}
          onClick={handleAutoScrollButtonClick}
        >
          Auto Scroll
        </SubtitleListAutoScrollButton>
      </SubtitleListToolsContainer>
      <SimpleBar
        scrollableNodeProps={{ ref: scrollRef }}
        style={{
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          margin: "5px 20px"
        }}
      >
        {subs.map((sub: ISubtitle) => (
          <SubtitleDisplay
            autoScroll={autoScroll}
            key={sub.data.start}
            subtitle={sub}
            scrollRef={scrollRef}
          />
        ))}
      </SimpleBar>
    </SubtitleListContainer>
  );
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