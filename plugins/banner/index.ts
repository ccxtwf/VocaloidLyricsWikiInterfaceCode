import type { TsdownPlugin } from "tsdown";
import { generateScriptBanner, generateStylesheetBanner } from "./utils.ts";
import type GadgetsDefinition from "../../dev-utils/models/GadgetsDefinition.ts";
import { getFileType } from "../../dev-utils/lib-utils.ts";

/**
 * A Rolldown plugin that automatically adds a custom banner to each file.
 *
 * @param gadgetsDefinition
 * @returns
 */
export default function banner(
  bundleEntry: Record<string, string>,
  gadgetsDefinition: GadgetsDefinition,
): TsdownPlugin {
  return {
    name: "banner",

    tsdownConfig() {
      return {
        banner: generateScriptBanner(bundleEntry, gadgetsDefinition),
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