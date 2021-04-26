import {
  BlockEditProps,
  BlockSaveProps,
  registerBlockType
} from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";

import {
  TextControl,
  TextareaControl,
  __experimentalNumberControl as NumberControl,
  CheckboxControl
} from "@wordpress/components";
import App, { DYNAMIC_PLAYER_EMBED_ID } from "./App";

registerBlockType<IUvicPlayerBlockProps>("uvic-captions-player/embed-player", {
  title: "UVic Captions Player",
  icon: "video-alt",
  category: "media",
  attributes: {
    playerEmbed: {
      type: "string"
    },
    width: {
      type: "string"
    },
    height: {
      type: "string"
    },
    fontFamily: {
      type: "string"
    },
    responsive: {
      type: "boolean"
    }
  },
  edit: onEditBlock,
  save: onSaveBlock
});

interface IUvicPlayerBlockProps {
  playerEmbed: string;
  width?: string;
  height?: string;
  fontFamily?: string;
  responsive: boolean;
}

function onEditBlock(props: BlockEditProps<IUvicPlayerBlockProps>) {
  const { attributes, setAttributes } = props;
  const updateFieldValue = (val: string) => {
    setAttributes({ playerEmbed: val });
  };
  const updateHeightValue = (val: string) => {
    setAttributes({ height: val });
  };
  const updateWidthValue = (val: string) => {
    setAttributes({ width: val });
  };
  const updateFontFamily = (val: string) => {
    setAttributes({ fontFamily: val });
  };
  const updateResponsive = (val: boolean) => {
    setAttributes({ responsive: val });
  }
  const blockProps = useBlockProps();
  return (
    <div {...blockProps}>
      <TextareaControl
        label="Embed UVic Player"
        value={attributes.playerEmbed}
        rows={20}
        onChange={updateFieldValue}
      />
      <NumberControl
        label="Set Width (px)"
        value={attributes.width || ""}
        onChange={updateWidthValue}
      />
      <NumberControl
        label="Set Height (px)"
        value={attributes.height || ""}
        onChange={updateHeightValue}
      />
      <TextControl
        label="Set Font Family"
        value={attributes.fontFamily || ""}
        onChange={updateFontFamily}
      />
      <CheckboxControl
        label="Responsive Layout"
        isChecked={attributes.responsive}
        onChange={updateResponsive}
      />
      <App loadHypothesis={false} {...attributes} />
    </div>
  );
}

function onSaveBlock(props: BlockSaveProps<IUvicPlayerBlockProps>) {
  const { playerEmbed, ...rest } = props.attributes;
  const serialized = JSON.stringify(rest);
  return (
    <div
      id={DYNAMIC_PLAYER_EMBED_ID}
      data-player-props={serialized}
      data-player-embed={playerEmbed}
    ></div>
  );
}
