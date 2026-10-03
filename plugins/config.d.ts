import type { ResolvedConfig } from "tsdown";

interface AppBuildConfig extends ResolvedConfig {
  serve?: boolean;
  rollup?: boolean;
}