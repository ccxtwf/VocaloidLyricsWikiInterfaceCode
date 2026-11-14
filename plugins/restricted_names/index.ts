import type { TsdownPlugin } from "tsdown";

/**
 * A plugin that subtitutes placeholders for certain restricted names (e.g. mw_require -> require)
 *
 * @returns
 */
export default function restrictedNames(dict: Record<string, string>): TsdownPlugin {
  return {
    name: "restrictedNames",
    renderChunk(_code, _chunk, _outputOptions, meta) {
      const { magicString } = meta;
      if (!magicString) {
        this.error("MagicString is not enabled!");
      }
      for (const [from, to] of Object.entries(dict)) {
        magicString!.replaceAll(from, to);
      }
      return magicString;
    },
  };
}