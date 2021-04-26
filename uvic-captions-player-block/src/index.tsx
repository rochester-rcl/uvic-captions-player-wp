import {
  BlockEditProps,
  BlockSaveProps,
  registerBlockType
} from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";

import { TextareaControl } from "@wordpress/components";
import App, { DYNAMIC_PLAYER_EMBED_ID } from "./App";

registerBlockType<IUvicPlayerBlockProps>("uvic-captions-player/embed-player", {
  title: "UVic Captions Player",
  icon: "video-alt",
  category: "media",
  attributes: {
    playerEmbed: {
      type: "string"
    }
  },
  edit: onEditBlock,
  save: onSaveBlock
});

interface IUvicPlayerBlockProps {
  playerEmbed: string;
}

function onEditBlock(props: BlockEditProps<IUvicPlayerBlockProps>) {
  const { attributes, setAttributes } = props;
  const updateFieldValue = (val: string) => {
    setAttributes({ playerEmbed: val });
  };
  const blockProps = useBlockProps();
  return (
    <div {...blockProps}>
      <TextareaControl
        label="Embed UVic Player"
        value={attributes.playerEmbed}
        onChange={updateFieldValue}
      />
      <App loadHypothesis={false} playerEmbed={attributes.playerEmbed} />
    </div>
  );
}

function onSaveBlock(props: BlockSaveProps<IUvicPlayerBlockProps>) {
  const { playerEmbed } = props.attributes;
  return (
    <div
      id={DYNAMIC_PLAYER_EMBED_ID}
      data-player-embed={playerEmbed}
    ></div>
  );
}
