import { JWPlayerStatic } from "../types/jwplayer";

/**
 * Loads a JWPlayer script from an external source
 * 
 * @param ctx - the DOM context to add the script element to
 * @param scriptUrl - the URL of the script
 * @param scriptId - a unique id for the src element
 * @param playerKey - the JWPlayer license key
 * @returns 
 */
export function loadJWPlayerScript(
  ctx: HTMLDocument,
  scriptUrl: string,
  scriptId: string,
  playerKey: string
): Promise<JWPlayerStatic> {
  return new Promise((resolve, reject) => {
    const elem = ctx.createElement("script");
    elem.id = scriptId;
    elem.src = scriptUrl;
    elem.async = true;
    elem.onload = () => {
      if (window.jwplayer) {
        window.jwplayer.key = playerKey;
        return resolve(window.jwplayer);
      } else {
        return reject(`Unable to load JWPlayer script at ${scriptUrl}`);
      }
    };
    ctx.head.appendChild(elem);
    elem.onerror = err => reject(err);
  });
}

/**
 * Loads a Hypothesis script from an external source
 * 
 * @param ctx - the DOM context to add the script element to
 * @returns 
 */
export function loadHypothesisScript(ctx: HTMLDocument): Promise<void> {
  return new Promise((resolve, reject) => {
    const elem = ctx.createElement("script");
    elem.id = "hypothesis-embed";
    elem.src = "https://hypothes.is/embed.js";
    elem.async = true;
    elem.onload = () => resolve();
    elem.onerror = err => reject(err);
    ctx.head.appendChild(elem);
  });
}
