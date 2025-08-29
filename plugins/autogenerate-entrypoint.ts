import { 
  readGadgetsDefinition, 
  serveGadgetsForDevMode, 
  resolveGadgetsDirectory 
} from '../dev-utils/build-orchestration.js';
import { dirname, relative } from 'path';
import { PluginOption, HotUpdateOptions } from 'vite';

enum ViteServerChangeMode {
  Unchanged,
  GadgetsDefinitionIsUpdated,
  SrcFileIsUpdated,
  SrcFileIsAdded,
  SrcFileIsDeleted
}

/**
 * When a hot rebuild is triggered on Vite Serve, check if the changed file
 * necessitates a full or partial rebuild of the gadgets directory
 * 
 * Only applicable when running the Vite Server in Dev Mode
 */
function checkChangedFile(type: "create" | "update" | "delete", filepath: string): ViteServerChangeMode {
  const gadgetsDir = resolveGadgetsDirectory();
  // Only subscribe to changes in the gadgets directory
  if (dirname(filepath) !== gadgetsDir) {
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

async function rebuildGadgetsEntrypoint() {
  const gadgetsDefinition = await readGadgetsDefinition();
  await serveGadgetsForDevMode(gadgetsDefinition);
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
    hotUpdate({ type, file, modules }: HotUpdateOptions) {
      const refreshMode = checkChangedFile(type, file);
      if (refreshMode === ViteServerChangeMode.Unchanged) { return modules; }
      rebuildGadgetsEntrypoint();
      return modules;
    }
  }
}