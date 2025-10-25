import { PluginOption } from 'vite';
import { determineFileType, createBanner } from '../dev-utils/generate-banner.js';

/**
 * A Vite plugin that automatically adds a custom banner to each LESS/CSS file 
 * 
 * @returns PluginOption
 */
export default function generateCssBanner(ghUrl: string, ghBranch: string): PluginOption {
  
  return {
    name: 'generate-css-banner',
    apply: 'build',
    enforce: 'pre',
    
    transform(src: string, id: string) {
      if (determineFileType(id) === 'style') {
        return `${createBanner(ghUrl, ghBranch, id)}\n${src}`;
      }
      return src;
    },
  }
}