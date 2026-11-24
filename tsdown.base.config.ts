import { type UserConfig } from "tsdown";

export default {
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
} satisfies UserConfig;