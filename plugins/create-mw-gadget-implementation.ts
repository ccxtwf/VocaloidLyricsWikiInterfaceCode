import { writeFile } from 'fs/promises';
import { createGadgetImplementation } from '../dev-utils/build-orchestration.js';
import { PluginOption } from 'vite';
import { resolveDistGadgetsPath, resolveDistMediawikiCodePath } from '../dev-utils/utils.js';
import type { GadgetDefinition } from '../dev-utils/types.js';

/**
 * A Vite plugin that creates the gadget implementation code (i.e. scripts
 * and stylesheets wrapped in mw.loader.impl) for each gadget that has been compiled, 
 * built, and placed in the dist/ directory. 
 * 
 * @returns
 */
export default function createMwGadgetImplementation(gadgetsToBuild: GadgetDefinition[], mediawikiInterfaceCode: GadgetDefinition[]): PluginOption {
  
  return {
    name: 'create-mw-gadget-implementation',
    enforce: 'post',
    apply: 'build',

    async writeBundle() {
      const mediaWikiInterfaceGadgetImplementationFilePath = resolveDistMediawikiCodePath('gadget-impl.js');
      // Create new file
      await writeFile(mediaWikiInterfaceGadgetImplementationFilePath, '', { encoding: 'utf8', flag: 'w'});

      for (const code of mediawikiInterfaceCode) {
        const gadgetImplementation = await createGadgetImplementation(code, true);
        await writeFile(mediaWikiInterfaceGadgetImplementationFilePath, gadgetImplementation, { encoding: 'utf8', flag: 'a'});
        this.info(`✓ Created the MediaWiki gadget implementation ${mediaWikiInterfaceGadgetImplementationFilePath}`);
      }

      for (const gadget of gadgetsToBuild) {
        const gadgetImplementation = await createGadgetImplementation(gadget, true);
        const gadgetImplementationFilePath = resolveDistGadgetsPath(gadget.section, gadget.name, 'gadget-impl.js');
        await writeFile(gadgetImplementationFilePath, gadgetImplementation, { encoding: 'utf8', flag: 'w'});
        this.info(`✓ Created the MediaWiki gadget implementation ${[gadget.section, gadget.name, 'gadget-impl.js'].join('/')}`);
      }
    },
  }
}