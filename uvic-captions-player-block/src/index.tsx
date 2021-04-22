// @ts-nocheck
import {
  BlockEditProps,
  BlockSaveProps,
  registerBlockType
} from "@wordpress/blocks";
import { TextareaControl } from "@wordpress/components";
import App from "./App";

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
  return (
    <TextareaControl
      label="Embed UVic Player"
      value={attributes.playerEmbed}
      onChange={updateFieldValue}
    />
  );
}

function onSaveBlock(props: BlockSaveProps<IUvicPlayerBlockProps>) {
  const { playerEmbed } = props.attributes;
  return <App playerEmbed={playerEmbed} />;
}
