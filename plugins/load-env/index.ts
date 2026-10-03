import { setOrigin, setGadgetNamespace } from "../../dev-utils/serve-utils.ts";
import { setGhEntrypoint } from "../banner/utils.ts";
import type { TsdownPlugin, ResolvedConfig } from "tsdown";

/**
 * A Rolldown plugin that handles passing & resolution of additional configuration variables.
 *
 * @returns
 */
export default function loadEnv(): TsdownPlugin {
  return {
    name: "load-environment",
    tsdownConfig() {
      const envProfile = process.env.NODE_PROJECT_PROFILE;
      console.log(`Loading profile: '${envProfile || "default"}'`);
      return {
        envFile: envProfile ? `.env.${envProfile}` : ".env",
        envPrefix: "TSDOWN_", // only inject variables prefixed with this string
      };
    },
    tsdownConfigResolved({ env }: ResolvedConfig) {
      const {
        TSDOWN_GADGET_NAMESPACE: gadgetNamespace = "ext.gadget",
        TSDOWN_GIT_REPOSITORY_URL: ghUrl = "",
        TSDOWN_GIT_REPOSITORY_BRANCH: ghBranch = "development",
        TSDOWN_ORIGIN: origin = "http://localhost:4173/",
      } = env;

      setGadgetNamespace(gadgetNamespace);
      setOrigin(origin);
      setGhEntrypoint(ghUrl, ghBranch);
    },
  };
}