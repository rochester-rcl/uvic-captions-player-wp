import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { TextAreaControl } from "@wordpress/components";

registerBlockType("uvic-captions-player/embed-player", {
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

function onEditBlock(props) {
  const { attributes, setAttributes } = props;
  const updateFieldValue = val => {
    setAttributes({ playerEmbed: val });
  };
  return (
    <TextAreaControl
      label="Embed UVic Player"
      value={attributes.playerEmbed}
      onChange={updateFieldValue}
    />
  );
}

function onSaveBlock(props) {
  const { attributes } = props;
  const blockProps = useBlockProps.save();
  return (
    <div {...blockProps} data-player-embed={attributes.playerEmbed}>
      {attributes.playerEmbed}
    </div>
  );
}
