import { resolve, join } from 'path';
import { writeFile } from 'fs/promises';
import { createGadgetImplementationForDist } from '../dev-utils/build-orchestration.js';
import { PluginOption } from 'vite';

/**
 * A Vite plugin that creates the gadget implementation code (i.e. scripts
 * and stylesheets wrapped in mw.loader.impl) for each gadget that has been compiled, 
 * built, and placed in the dist/ directory. 
 * 
 * @returns PluginOption
 */
export default function createMwGadgetImplementation(gadgetsToBuild: GadgetDefinition[]): PluginOption {
  
  return {
    name: 'createMwGadgetImplementation',
    enforce: 'post', // Enforce after Vite build plugins
    apply: 'build', // Only on Dev Mode

    async writeBundle() {
      for (const gadget of gadgetsToBuild) {
        const gadgetImplementation = await createGadgetImplementationForDist(gadget);
        const relFilepath = join(gadget.subdir!, 'gadget-impl.js');
        const filepath = resolve(join(__dirname, '../dist', relFilepath));
        await writeFile(filepath, gadgetImplementation, { encoding: 'utf8', flag: 'w'});
        console.log(`✓ Created the MediaWiki gadget implementation ${relFilepath}`)
      }
    },
  }
}