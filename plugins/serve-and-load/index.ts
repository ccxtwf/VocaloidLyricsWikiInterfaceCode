import { serveGadgets } from "./utils.ts";
import type { TsdownPlugin } from "tsdown";
import type { PluginContext } from "rolldown";
import type { GadgetDefinition } from "../../dev-utils/models/index.ts";
import type { AppBuildConfig } from "../config.d.ts";

/**
 * A Rolldown plugin that automatically generates the entrypoint (dist/load.js)
 * to be loaded on the MediaWiki client.
 *
 * @param gadgetsToBuildAtIntialState
 * @param mediawikiInterfaceCodeToBuildAtInitialState
 * @param useRolledUpImplementation
 * @returns
 * @deprecated
 */
export default function serveAndLoadGadgetsPlugin(
  gadgetsToBuildAtIntialState: GadgetDefinition[],
  mediawikiInterfaceCodeToBuildAtInitialState: GadgetDefinition[],
): TsdownPlugin {
  let isEnabled: boolean = false;
  let useRolledUpImplementation: boolean = false;

  return {
    name: "serve-and-load",

    tsdownConfigResolved(resolvedConfig: AppBuildConfig) {
      if (resolvedConfig.serve) {
        isEnabled = true;
      }
      if (resolvedConfig.rollup) {
        useRolledUpImplementation = true;
      }
    },

    buildEnd(this: PluginContext) {
      if (!isEnabled) {
        return;
      }
      const startTime = Date.now();
      this.info("Creating dist/load.js...");
      serveGadgets(
        this,
        gadgetsToBuildAtIntialState,
        mediawikiInterfaceCodeToBuildAtInitialState,
        useRolledUpImplementation,
      ).then(() => this.info(`Created dist/load.js in ${(Date.now() - startTime) / 1000} s`));
    },
  };
}