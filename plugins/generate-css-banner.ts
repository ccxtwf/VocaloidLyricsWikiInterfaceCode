import { PluginOption } from 'vite';
import { relative, resolve } from "path";
import { normalizePath } from "vite";
import { determineFileType, getGadgetKeysFromChunkName } from '../dev-utils/utils.js';
import { createBanner } from '../dev-utils/generate-banner.js';
import { GadgetsDefinition } from '../dev-utils/types.js';

/**
 * A Vite plugin that automatically adds a custom banner to each LESS/CSS file 
 * 
 * @returns PluginOption
 */
export default function generateCssBanner(ghUrl: string, ghBranch: string, gadgetsDefinition: GadgetsDefinition): PluginOption {
  return {
    name: 'generate-css-banner',
    apply: 'build',
    enforce: 'pre',
    
    transform(src: string, id: string) {
      if (determineFileType(id) === 'style') {
        id = normalizePath(relative(resolve(__dirname, "../src/"), id));
        const m = getGadgetKeysFromChunkName(id);
        const gadgetDefinition = (
          m !== null ? gadgetsDefinition.gadgets[m[0]][m[1]] : undefined
        );
        return `${createBanner(ghUrl, ghBranch, id, gadgetDefinition)}\n${src}`;
      }
      return src;
    },
  }
}