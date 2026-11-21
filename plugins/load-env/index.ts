import dotenv from "dotenv";
import { setOutDir } from "../../dev-utils/lib-utils.ts";
import { setOrigin, setGadgetNamespace } from "../../dev-utils/serve-utils.ts";
import { setGhEntrypoint } from "../banner/utils.ts";
import type { TsdownPlugin } from "tsdown";

/**
 * A Rolldown plugin that handles passing & resolution of additional configuration variables.
 *
 * @returns
 */
export default function loadEnv(): TsdownPlugin {
  return {
    name: "load-environment",
    tsdownConfig() {
      const envVars: Record<string, string> = {};
      const envProfile = process.env.NODE_PROJECT_PROFILE;
      console.log(`Loading profile: '${envProfile || "default"}'`);
      dotenv.config({ path: envProfile ? `./.env.${envProfile}` : "./.env", processEnv: envVars });

      const {
        TSDOWN_GADGET_NAMESPACE: gadgetNamespace = "ext.gadget",
        TSDOWN_GIT_REPOSITORY_URL: ghUrl = "",
        TSDOWN_GIT_REPOSITORY_BRANCH: ghBranch = "development",
        TSDOWN_ORIGIN: origin = "http://localhost:4173/",
        TSDOWN_OUTDIR: outDir = "dist",
      } = envVars;

      setGadgetNamespace(gadgetNamespace);
      setOrigin(origin);
      setGhEntrypoint(ghUrl, ghBranch);
      setOutDir(outDir);

      return {
        outDir,
      };
    },
  };
}