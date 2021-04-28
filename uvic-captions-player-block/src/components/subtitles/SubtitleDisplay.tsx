import { useContext, useEffect, useRef, useState } from "@wordpress/element";
import { AppCtx } from "../../App";
import Palette from "../../styles/palette";
import styled from "styled-components";
import { formatTimestamp } from "subtitle";

import type {
  ISubtitleDisplayProps,
  IClickableProps,
  IScreenPos
} from "./types";

/**
 * A basic component to display a timecode
 */
const SubtitleTimecode = styled.div`
  font-size: 14px;
  margin-right: 10px;
  flex: 0.1;
`;

/**
 * A basic component to display the text content of a subtitle
 */
const SubtitleText = styled.div`
  font-size: 18px;
  flex: 0.9;
  padding-bottom: 10px;
`;

/**
 * Container component to display a SubtitleTimecode and SubtitleText
 */
const SubtitleDisplayContainer = styled.div`
  padding: 5px;
  display: grid;
  grid-template-columns: 20% 80%;
  align-items: baseline;
  cursor: pointer;
  color: ${(props: IClickableProps) =>
    props.active ? Palette.DarkBlue : Palette.LightGray};
  transition: color 300ms ease-in-out;
  &:hover {
    color: ${Palette.DarkBlue};
  }
`;

/**
 * Renders a subtitle's timecode and text content.
 * Sets global video player time to the start time of
 * its subtitle prop when clicked.
 * 
 * @param props - see ISubtitleDisplayProps interface
 * @returns 
 */
export default function SubtitleDisplay(props: ISubtitleDisplayProps) {
  const { autoScroll, scrollRef } = props;
  const { setTime } = useContext(AppCtx);
  const [mouseDownPos, setMouseDownPos] = useState<IScreenPos>({
    screenX: 0,
    screenY: 0
  });
  const subRef = useRef<HTMLDivElement>(null);
  const { start, end, text } = props.subtitle.data;
  const { currentTime } = useContext(AppCtx);
  const active = currentTime >= start && currentTime <= end;

  // ensures video player only seeks when clicking, not highlighting
  function handleMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    setMouseDownPos(({ screenX, screenY } = evt));
  }

  function handleMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const { screenX, screenY } = evt;
    const deltaX = Math.abs(screenX - mouseDownPos.screenX);
    const deltaY = Math.abs(screenY - mouseDownPos.screenY);
    if (deltaX === 0 && deltaY === 0) {
      setTime(start);
    }
  }

  useEffect(() => {
    if (autoScroll && active) {
      const { current } = subRef;
      if (current && scrollRef.current) {
        scrollRef.current.scrollTop = current.offsetTop;
      }
    }
  }, [active, autoScroll, subRef, scrollRef]);

  return (
    <SubtitleDisplayContainer
      ref={subRef}
      active={active}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <SubtitleTimecode>
        {formatTimestamp(start).replace(/\,(.*)/g, "")}
      </SubtitleTimecode>
      <SubtitleText>{text}</SubtitleText>
    </SubtitleDisplayContainer>
  );
}
