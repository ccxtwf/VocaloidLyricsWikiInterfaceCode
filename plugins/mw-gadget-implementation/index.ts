import { createRolledUpGadgetImplementation } from "./utils.ts";
import type { TsdownPlugin } from "tsdown";
import { resolveDistGadgetsPath } from "../../dev-utils/lib-utils.ts";
import type { GadgetDefinition } from "../../dev-utils/models/index.ts";
import type { AppBuildConfig } from "../config.d.ts";

/**
 * A Rolldown plugin that creates the gadget implementation code (i.e. scripts
 * and stylesheets wrapped in mw.loader.impl) for each gadget that has been compiled,
 * built, and placed in the `dist/` directory.
 *
 * @returns
 * @deprecated
 */
export default function createMwGadgetImplementation(
  gadgetsToBuild: GadgetDefinition[],
): TsdownPlugin {
  let isEnabled: boolean = false;
  let minify: boolean = false;
  return {
    name: "create-mw-gadget-implementation",

    tsdownConfigResolved(resolvedConfig: AppBuildConfig) {
      if (resolvedConfig.minify) {
        minify = minify !== false ? true : false;
      }
      if (resolvedConfig.rollup) {
        isEnabled = true;
      }
    },

    async generateBundle(_, bundle) {
      if (!isEnabled) {
        return;
      }
      for (const gadget of gadgetsToBuild) {
        const gadgetImplementationFilePath = resolveDistGadgetsPath(gadget.name, "gadget-impl.js");
        this.emitFile({
          code: await createRolledUpGadgetImplementation(
            gadgetImplementationFilePath,
            bundle,
            gadget,
            minify,
          ),
          fileName: `gadgets/${gadget.name}/gadget-impl.js`,
          type: "prebuilt-chunk",
        });
      }
    },
  };
}