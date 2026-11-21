import type { RolldownMagicString } from "rolldown";

let DICT_RESTRICTED_NAMES: Record<string, string>;

export function setDictionaryOfRestrictedNames(dict: Record<string, string>) {
  DICT_RESTRICTED_NAMES = dict;
}

export function transformRestrictedNames<T extends string | RolldownMagicString>(
  src: T,
  additional?: Record<string, string>,
): T {
  const fn =
    typeof src === "string"
      ? (src: T, from: string, to: string) => {
          return (src as string).replaceAll(from, to) as T;
        }
      : (src: T, from: string, to: string) => {
          (src as RolldownMagicString).replaceAll(from, to);
          return src;
        };
  for (const d of [DICT_RESTRICTED_NAMES, additional ?? {}]) {
    for (const [from, to] of Object.entries(d)) {
      src = fn(src, from, to);
    }
  }
  return src;
}