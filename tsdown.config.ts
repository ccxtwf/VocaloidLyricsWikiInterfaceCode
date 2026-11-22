import { defineConfig, type UserConfig } from "tsdown";

interface BundleEntry {
  alias: string;
  filepath: string;
  globalName: string;
  deps?: {
    neverBundle?: string[];
    alwaysBundle?: string[];
    onlyBundle?: string[];
    onlyImport?: string[];
  };
}
const bundleEntries: BundleEntry[] = [
  {
    alias: "handsontable",
    filepath: "./src/handsontable/index.ts",
    globalName: "Handsontable",
    deps: {
      alwaysBundle: [
        "handsontable",
        "handsontable/cellTypes",
        "handsontable/plugins",
        "handsontable/renderers",
        "handsontable/themes",
        "handsontable/i18n",
        "handsontable/base",
        "sanitize-html",
      ],
    },
  },
  {
    alias: "lyricsUtils",
    filepath: "./src/lyricsUtils/index.ts",
    globalName: "LyricsEditorUtils",
  },
];

export default defineConfig(
  bundleEntries.map(({ alias, filepath, globalName, deps = {} }) => ({
    entry: { [alias]: filepath },
    format: "iife",
    globalName,
    deps: { ...deps, onlyBundle: false, resolveDepSubpath: true },
    platform: "browser",
    outExtensions: () => ({ js: "", dts: ".d.ts" }),
    outputOptions: {
      entryFileNames: "[name].js",
    },
    target: "es2019",
    minify: true,

    define: {
      DEBUG: "false",
    },

    css: {
      splitting: true,
      preprocessorOptions: {
        less: {/* LESS-specific options here */},
      },
    },

    /* tsconfig */
    tsconfig: "./tsconfig.json",
  })) satisfies UserConfig[],
);