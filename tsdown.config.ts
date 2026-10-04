import {
  loadEnvironmentPlugin,
  bannerPlugin,
  gadgetsDefinitionPlugin,
  serveAndLoadGadgetsPlugin,
  mwGadgetImplementationPlugin,
} from "./plugins/index.ts";

import {
  readGadgetsDefinition,
  getGadgetsToBuild,
  getMediaWikiInterfaceCodeToBuild,
  mapWikicodeSourceFiles,
} from "./dev-utils/build-orchestration.ts";
import { defineConfig, type UserConfig } from "tsdown";

export default defineConfig(async (): Promise<UserConfig> => {
  const gadgetsDefinition = await readGadgetsDefinition();
  const gadgetsToBuild = getGadgetsToBuild(gadgetsDefinition);
  const mwInterfaceCodeToBuild = getMediaWikiInterfaceCodeToBuild();
  const bundleEntry = mapWikicodeSourceFiles(gadgetsToBuild, mwInterfaceCodeToBuild);

  return {
    entry: bundleEntry,

    platform: "browser",
    format: "commonjs",
    cjsDefault: true,
    outExtensions: () => ({ js: "", dts: ".d.ts" }),
    target: "es2019",
    minify: false,

    define: {
      DEBUG: "false",
    },
    plugins: [
      loadEnvironmentPlugin(),
      bannerPlugin(bundleEntry, gadgetsDefinition),
      gadgetsDefinitionPlugin(gadgetsDefinition),
      mwGadgetImplementationPlugin(gadgetsToBuild),
      serveAndLoadGadgetsPlugin(gadgetsToBuild, mwInterfaceCodeToBuild),
    ],

    css: {
      splitting: true,
      preprocessorOptions: {
        less: {/* LESS-specific options here */},
      },
    },

    /* Assets */
    copy: ({ outDir }) => ({
      from: ["src/**/*.json"],
      to: outDir,
    }),

    /* tsconfig */
    tsconfig: "./tsconfig.build.json",
  };
});