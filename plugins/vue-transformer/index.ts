import type { TsdownPlugin } from "tsdown";
import type { PluginContext } from "rolldown";
import { compileVueComponent } from "./utils.ts";
import normalizePath from "normalize-path";

const filterIdForVueFiles = {
  id: /\.vue$/,
};

/**
 * This is a plugin that pre-processes .vue components
 * @returns
 */
export default function vueTransformer(): TsdownPlugin {
  const _map: Record<string, string> = {};
  return {
    name: "vue-transformer",
    tsdownConfigResolved(resolvedConfig) {
      // Set up a map of source filepath -> bundle filepath for .vue files
      for (const [id, entry] of Object.entries(resolvedConfig.entry)) {
        if (filterIdForVueFiles.id.test(id)) {
          _map[entry] = id;
        }
      }
    },
    transform: {
      filter: filterIdForVueFiles,
      async handler(this: PluginContext, src: string, id: string) {
        const res = await compileVueComponent(this, src, id);
        // Force emit as "asset" so Rolldown doesn't re-process as JS or CSS
        this.emitFile({
          type: "asset",
          fileName: _map[normalizePath(id)],
          source: res,
        });
        // Overwrite own file
        return {
          code: "",
          map: null,
          moduleType: "empty",
        };
      },
    },
  };
}