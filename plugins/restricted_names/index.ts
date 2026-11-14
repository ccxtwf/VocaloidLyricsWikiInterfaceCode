import type { TsdownPlugin } from "tsdown";
import { setDictionaryOfRestrictedNames, transformRestrictedNames } from "./utils.ts";

/**
 * A plugin that subtitutes placeholders for certain restricted names (e.g. mw_require -> require)
 *
 * @returns
 */
export default function restrictedNames(dict: Record<string, string>): TsdownPlugin {
  setDictionaryOfRestrictedNames(dict);
  return {
    name: "restrictedNames",
    renderChunk(_code, _chunk, _outputOptions, meta) {
      const { magicString } = meta;
      if (!magicString) {
        this.error("MagicString is not enabled!");
      }
      return transformRestrictedNames(magicString!);
    },
  };
}