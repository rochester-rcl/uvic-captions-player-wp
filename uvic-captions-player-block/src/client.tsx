import { render } from "@wordpress/element";
import App, { DYNAMIC_PLAYER_EMBED_ID } from "./App";
import "simplebar/dist/simplebar.min.css";

/**
 * Mounts the dynamic App component to the div created by
 * the block's onSaveBlock callback. Since all components
 * rendered by onSaveBlock are only rendered on the server side,
 * this is a hack to mount a dynamic React component on
 * the client side.
 *
 * All necessary props are serialized and stored as data
 * attributes on the corresponding div with id set in the 
 * DYNAMIC_PLAYER_EMBED_ID constant.
 */
window.addEventListener("DOMContentLoaded", evt => {
  const wrapper = document.getElementById(DYNAMIC_PLAYER_EMBED_ID);
  if (wrapper) {
    const { playerEmbed, playerProps } = wrapper.dataset;
    const props = playerProps ? JSON.parse(playerProps) : {};
    render(
      <App loadHypothesis={true} playerEmbed={playerEmbed} {...props} />,
      wrapper
    );
  }
});
