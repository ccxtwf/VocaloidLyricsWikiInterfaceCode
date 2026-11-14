import type { RolldownMagicString } from "rolldown";

let DICT_RESTRICTED_NAMES: Record<string, string>;

export function setDictionaryOfRestrictedNames(dict: Record<string, string>) {
  DICT_RESTRICTED_NAMES = dict;
}

export function transformRestrictedNames(src: RolldownMagicString): RolldownMagicString {
  for (const [from, to] of Object.entries(DICT_RESTRICTED_NAMES)) {
    src.replaceAll(from, to);
  }
  return src;
}