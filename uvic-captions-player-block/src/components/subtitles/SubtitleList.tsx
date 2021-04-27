import {
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState
} from "@wordpress/element";
import styled, { css } from "styled-components";
import Palette from "../../styles/palette";
import { AppCtx } from "../../App";
import { isEmptyOrUndefined } from "../../utils/string";
import type { IClickableProps, ISubtitleListProps, ISubtitle } from "./types";
import SubtitleDisplay from "./SubtitleDisplay";

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
  font-family: ${(props: { fontFamily?: string }) =>
    isEmptyOrUndefined(props.fontFamily)
      ? '"Roboto Condensed", Helvetica, sans-serif'
      : props.fontFamily};
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

const ButtonBase = css`
  cursor: pointer;
  border: none;
  color: ${Palette.White};
  &:focus {
    border: none;
    outline: none;
  }
`;

const SubtitleListAutoScrollButton = styled.div`
  ${ButtonBase}
  padding: 5px 10px;
  text-align: center;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: ${(props: IClickableProps) =>
    props.active ? Palette.Red : Palette.LightGray};
  &:focus {
    border: none;
    outline: none;
  }
`;

const SubtitleListClearFilterButton = styled.div`
  ${ButtonBase}
  border-radius: 2px;
  color: ${Palette.White};
  background: none;
  width: 16px;
  height: 16px;
  padding: 2px;
  font-size: 16px;
  font-weight: 700;
`;

const SubtitleListContainer = styled.div`
  display: flex;
  background: ${Palette.White};
  flex-direction: column;
  justify-content: flex-start;
  margin: 20px;
  min-width: 375px;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`;

const SubtitleScrollList = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 5px 10px;
  margin: 5px 5px 0px 0px;
  ::-webkit-scrollbar {
    background-color: ${Palette.Clear};
    width: 5px;
    margin-right: 5px;
  }
  ::-webkit-scrollbar-thumb {
    background: ${Palette.DarkBlue};
    border-radius: 2px;
  }
`;

export default function SubtitleList(props: ISubtitleListProps) {
  const { subtitles } = props;
  const { fontFamily } = useContext(AppCtx).appProps;
  const filterInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filterVal, setFilterVal] = useState<string>("");
  const [autoScroll, setAutoScroll] = useState(false);

  function handleFilterValChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setFilterVal(evt.target.value);
  }

  function handleAutoScrollButtonClick(evt: React.MouseEvent<HTMLDivElement>) {
    setAutoScroll(!autoScroll);
  }

  function handleClearFilterButtonClick(evt: React.MouseEvent<HTMLDivElement>) {
    setFilterVal("");
  }

  const subs = useMemo(() => {
    const fv = filterVal.toLowerCase();
    return subtitles.filter(
      sub => sub.type !== "header" && sub.data.text.toLowerCase().includes(fv)
    );
  }, [subtitles, filterVal]);

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
            fontFamily={fontFamily}
            placeholder={"Search Captions ..."}
            ref={filterInputRef}
            value={filterVal}
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
          scroll
        </SubtitleListAutoScrollButton>
      </SubtitleListToolsContainer>
      <SubtitleScrollList ref={scrollRef}>
        {subs.map((sub: ISubtitle) => (
          <SubtitleDisplay
            autoScroll={autoScroll}
            key={sub.data.start}
            subtitle={sub}
            scrollRef={scrollRef}
          />
        ))}
      </SubtitleScrollList>
    </SubtitleListContainer>
  );
}
