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

    platform: "node",
    format: "commonjs",
    cjsDefault: true,
    outExtensions: () => ({ js: "", dts: ".d.ts" }),
    target: "es2022",
    minify: false,

    plugins: [
      loadEnvironmentPlugin(),
      bannerPlugin(gadgetsDefinition),
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