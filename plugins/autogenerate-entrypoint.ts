import { 
  readGadgetsDefinition, 
  getGadgetsToBuild,
  getMediaWikiInterfaceCodeToBuild,
  serveGadgets, 
  resolveCodeDirectory 
} from '../dev-utils/build-orchestration.js';
import { dirname, relative } from 'path';
import { PluginOption, HotUpdateOptions } from 'vite';
import type { GadgetDefinition } from '../dev-utils/types.js';

enum ViteServerChangeMode {
  Unchanged,
  GadgetsDefinitionIsUpdated,
  SrcFileIsUpdated,
  SrcFileIsAdded,
  SrcFileIsDeleted
}

/**
 * When a hot rebuild is triggered on Vite Serve, check if the changed file
 * necessitates a full or partial rebuild of the gadgets directory.
 * 
 * @param type string
 * @param filepath string
 */
function checkChangedFile(type: "create" | "update" | "delete", filepath: string): ViteServerChangeMode {
  const { gadgetsDir, mediawikiInterfaceDir } = resolveCodeDirectory();

  // Only subscribe to changes in the gadgets or mediawiki directory
  if (dirname(filepath) !== gadgetsDir && dirname(filepath) !== mediawikiInterfaceDir) {
    return ViteServerChangeMode.Unchanged;
  }
  // File gadgets-definition.yaml is changed
  const relativeFilePath = relative(gadgetsDir, filepath);
  if (relativeFilePath === 'gadgets-definition.yaml') {
    switch (type) {
      case "create":
      case "update":
        return ViteServerChangeMode.GadgetsDefinitionIsUpdated;
      case "delete":
      default:
        // Do not rebuild when gadgets-definition.yaml is deleted
        return ViteServerChangeMode.Unchanged;
    }
  }
  switch (type) {
    case "create":
      return ViteServerChangeMode.SrcFileIsAdded;
    case "delete":
      return ViteServerChangeMode.SrcFileIsDeleted;
    case "update":
      return ViteServerChangeMode.SrcFileIsUpdated;
  }
  return ViteServerChangeMode.Unchanged;
}

/**
 * A Vite plugin that automatically generates the entrypoint (dist/load.js) 
 * to be loaded on the MediaWiki client.
 * Subscribes to changes made on the gadgets project subdirectory (NOT dist/).
 * 
 * @returns PluginOption
 */
export default function autogenerateEntrypoint(gadgetsToBuildAtIntialState: GadgetDefinition[], mediawikiInterfaceCodeToBuildAtInitialState: GadgetDefinition[]): PluginOption {
  
  return {
    name: 'autogenerateEntrypoint',
    enforce: 'post', // Enforce after Vite build plugins

    // Build Mode
    buildEnd() {
      console.log('\nBuilding dist/load.js...\n');
      serveGadgets(gadgetsToBuildAtIntialState, mediawikiInterfaceCodeToBuildAtInitialState, false);
    },

    // Serve/Dev Mode
    configureServer() {
      console.log('\nBuilding load.js for Dev Mode...\n');
      serveGadgets(gadgetsToBuildAtIntialState, mediawikiInterfaceCodeToBuildAtInitialState, true);
    },
    hotUpdate({ type, file, modules,  }: HotUpdateOptions) {
      const refreshMode = checkChangedFile(type, file);
      if (refreshMode === ViteServerChangeMode.Unchanged) { return modules; }
      // Possible to do a partial rebuild based on the value of ViteServerChangeMode
      // Rn compiling load.js isn't a bottleneck, so optimizing this is unnecessary
      (async () => {
        const gadgetsDefinition = await readGadgetsDefinition();
        const gadgetsToBuild = getGadgetsToBuild(gadgetsDefinition);
        const mwInterfaceCodeToBuild = await getMediaWikiInterfaceCodeToBuild();
        console.log(`Registered change for file ${file} (${type})`);
        console.log('Rebuilding load.js for Dev Mode...');
        await serveGadgets(gadgetsToBuild, mwInterfaceCodeToBuild, true);
      })();
      return modules;
    }
  }
}