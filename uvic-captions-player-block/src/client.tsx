import { render } from "@wordpress/element";
import App, { DYNAMIC_PLAYER_EMBED_ID } from "./App";
import "simplebar/dist/simplebar.min.css";

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
