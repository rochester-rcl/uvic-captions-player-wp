export function isEmptyOrUndefined(str: string | undefined): boolean {
  if (!str) return true;
  if (str === "") return true;
  return false;
}
