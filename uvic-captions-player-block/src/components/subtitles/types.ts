export interface ISubtitleData {
  start: number;
  end: number;
  text: string;
}

export interface ISubtitle {
  type: string;
  data: ISubtitleData;
}

export interface ISubtitleListProps {
  subtitles: ISubtitle[];
}

export interface ISubtitleDisplayProps {
  subtitle: ISubtitle;
  autoScroll: Boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export interface IScreenPos {
  screenX: number;
  screenY: number;
}

export interface ISubtitleTextProps {
  active: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export interface IClickableProps {
  active: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}
