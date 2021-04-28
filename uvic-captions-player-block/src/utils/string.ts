/**
 * Checks whether or not a script is empty or undefined
 * @param str - the string to check
 * @returns 
 */
export function isEmptyOrUndefined(str: string | undefined): boolean {
  if (!str) return true;
  if (str === "") return true;
  return false;
}
