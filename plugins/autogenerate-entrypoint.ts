import { serveGadgets } from '../dev-utils/build-orchestration.js';
import { PluginOption } from 'vite';
import type { GadgetDefinition } from '../dev-utils/types.js';

/**
 * A Vite plugin that automatically generates the entrypoint (dist/load.js) 
 * to be loaded on the MediaWiki client.
 * 
 * @param gadgetsToBuildAtIntialState 
 * @param mediawikiInterfaceCodeToBuildAtInitialState 
 * @returns 
 */
export default function autogenerateEntrypoint(gadgetsToBuildAtIntialState: GadgetDefinition[], mediawikiInterfaceCodeToBuildAtInitialState: GadgetDefinition[]): PluginOption {
  
  return {
    name: 'autogenerate-entrypoint',
    enforce: 'post', // Enforce after Vite build plugins

    // Build Mode
    buildEnd() {
      console.log('\nBuilding dist/load.js...\n');
      serveGadgets(gadgetsToBuildAtIntialState, mediawikiInterfaceCodeToBuildAtInitialState);
    },
  }
}