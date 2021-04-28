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
import styled from "styled-components";
import Palette from "./styles/palette";

registerBlockType<IUvicPlayerBlockProps>("uvic-captions-player/embed-player", {
  title: "UVic Captions Player",
  icon: "format-video",
  category: "embed",
  attributes: {
    playerEmbed: {
      type: "string"
    },
    width: {
      type: "string"
    },
    height: {
      type: "string",
      default: "500"
    },
    fontFamily: {
      type: "string"
    },
    responsive: {
      type: "boolean",
      default: true
    }
  },
  edit: onEditBlock,
  save: onSaveBlock
});

/**
 * Available serializable attributes fir the UvicPlayerBlock
 */
interface IUvicPlayerBlockProps {
  playerEmbed: string;
  width?: string;
  height?: string;
  fontFamily?: string;
  responsive: boolean;
}

const BlockEditContainer = styled.div`
  background: ${Palette.White};
  padding: 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`;

/**
 * Callback for rendering the block in edit mode
 *
 * @param props - see IUvicPlayerBlockProps interface
 * @returns
 */
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
  };
  const blockProps = useBlockProps();
  const wizardUrl =
    "https://www.uvic.ca/systems/support/avmultimedia/webcasting/wizard.php";
  return (
    <div {...blockProps}>
      <BlockEditContainer>
        <h4>UVic Captions Player Block</h4>
        <TextareaControl
          label="Embed UVic Player"
          help={`Paste the output from the UVic Video Player setup wizard: ${wizardUrl}`}
          value={attributes.playerEmbed}
          rows={20}
          onChange={updateFieldValue}
        />
        <NumberControl
          label="Set Width (px)"
          help="Sets the width of the UVic Captions Player"
          value={attributes.width || ""}
          onChange={updateWidthValue}
        />
        <NumberControl
          label="Set Height (px)"
          help="Sets the height of the UVic Captions Player"
          value={attributes.height || ""}
          onChange={updateHeightValue}
        />
        <TextControl
          label="Set Font Family"
          help="Sets the font family for the UVic Captions Player, e.g. 'Roboto', Helvetica, sans-serif'"
          value={attributes.fontFamily || ""}
          onChange={updateFontFamily}
        />
        <CheckboxControl
          label="Responsive Layout"
          help="Allows the player layout to adjust to portrait / landscape based on device resolution"
          checked={attributes.responsive}
          onChange={updateResponsive}
        />
      </BlockEditContainer>
      <h4>Preview:</h4>
      <App loadHypothesis={false} {...attributes} />
    </div>
  );
}

/**
 * Renders a container to mount the dynamic App component to on
 * the client side, and stores all relevant props as
 * serialized data attributes.
 * See client.tsx for more details.
 *
 * @param props - see IUvicPlayerBlockProps interfac
 * @returns
 */
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
