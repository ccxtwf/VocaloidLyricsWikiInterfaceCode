import { 
  readGadgetsDefinition, 
  serveGadgetsForDevMode, 
  resolveGadgetsDirectory 
} from '../dev-utils/build-orchestration.js';
import { 
  existsInBuildCache, 
  addFileToBuildCache, 
  removeFileFromBuildCache 
} from '../dev-utils/gadget-build-cache.js';
import { dirname, relative } from 'path';
import { PluginOption } from 'vite';

enum ViteServerChangeMode {
  Unchanged = -1,
  GadgetsDefinitionIsChanged = 0,
  SrcFileIsAdded = 1,
  SrcFileIsRemoved = 2,
  SrcFileIsChanged = 3,
}

/**
 * When a hot rebuild is triggered on Vite Serve, check if the changed file
 * necessitates a full or partial rebuild of the gadgets directory
 * 
 * Only applicable when running the Vite Server in Dev Mode
 */
function checkChangedFile(filepath: string): ViteServerChangeMode {
  const gadgetsDir = resolveGadgetsDirectory();
  // Only subscribe to changes in the gadgets directory
  if (dirname(filepath) !== gadgetsDir) {
    return ViteServerChangeMode.Unchanged;
  }
  // File gadgets-definition.yaml is changed
  const relativeFilePath = relative(gadgetsDir, filepath);
  if (relativeFilePath === 'gadgets-definition.yaml') {
    return ViteServerChangeMode.GadgetsDefinitionIsChanged;
  }
  /*
  // File is not in gadget subfolder, ignore
  if (dirname(relativeFilePath) === '/') {
    return ViteServerChangeMode.Unchanged;
  }
  // A new file is added
  if (!existsInBuildCache(relativeFilePath)) {
    return ViteServerChangeMode.SrcFileIsAdded;
  }*/
  return ViteServerChangeMode.SrcFileIsChanged;
}

async function rebuildGadgetsEntrypoint(buildAll = true) {
  if (buildAll) {
    const gadgetsDefinition = await readGadgetsDefinition();
    await serveGadgetsForDevMode(gadgetsDefinition, { buildAll: true });
  }
}

/**
 * A Vite plugin that automatically generates the entrypoint to be loaded on the
 * MediaWiki client
 * Watches changes made on the gadgets subfolder.
 * 
 * @param mode string
 * @returns PluginOption
 */
export default function autogenerateEntrypoint(mode: string): PluginOption {
  const devMode = mode === 'development';
  
  return {
    name: 'autogenerateEntrypoint',
    enforce: 'post', // Enforce after Vite build plugins

    configureServer() {
      if (devMode) { rebuildGadgetsEntrypoint(); }
    },
    handleHotUpdate({ file, read, modules }: { file: string, read: () => string | Promise<string>, modules: any[] }) {
      const refreshMode = checkChangedFile(file);
      if (refreshMode === ViteServerChangeMode.Unchanged) { return modules; }
      rebuildGadgetsEntrypoint();
      return modules;
    }
  }
}