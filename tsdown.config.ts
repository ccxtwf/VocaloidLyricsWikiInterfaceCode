import { defineConfig, type UserConfig, mergeConfig } from "tsdown";

import tsdownBaseConfig from "./tsdown.base.config.ts";
import entries from "./entries.json" with { type: "json" };

const config: UserConfig[] = entries.reduce((a, { alias, filepath, globalName, deps = {} }) => {
  [false, true].forEach((minify) => {
    a.push(
      mergeConfig(tsdownBaseConfig, {
        entry: { [`${alias}${minify ? ".min" : ""}`]: filepath },
        format: "iife",
        globalName,
        deps: { ...deps, onlyBundle: false, resolveDepSubpath: true },
        minify,
        css: {
          minify,
        },
      }),
    );
  });
  return a;
}, [] as UserConfig[]);

export default defineConfig(config);