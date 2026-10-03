import type { TsdownPlugin } from "tsdown";
import { getFileType } from "../../dev-utils/lib-utils.ts";
import { generateScriptBanner, generateStylesheetBanner } from "./utils.ts";
import type { GadgetsDefinition } from "../../dev-utils/models/index.ts";

/**
 * A Rolldown plugin that automatically adds a custom banner to each file.
 *
 * @param gadgetsDefinition
 * @returns
 */
export default function banner(gadgetsDefinition: GadgetsDefinition): TsdownPlugin {
  return {
    name: "banner",

    tsdownConfig() {
      return {
        banner: generateScriptBanner(gadgetsDefinition),
      };
    },
    transform(src: string, id: string) {
      if (getFileType(id) === "style") {
        return generateStylesheetBanner(src, id, gadgetsDefinition);
      }
      return src;
    },
  };
}