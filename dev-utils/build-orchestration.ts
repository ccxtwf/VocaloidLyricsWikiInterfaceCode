import { existsSync, readdirSync } from "fs";
import { readFile } from "fs/promises";
import { parse } from "yaml";
import { GadgetDefinition, GadgetsDefinition } from "./models/index.ts";
import {
  removeFileExtension,
  resolveFileExtension,
  resolveSrcGadgetsPath,
  resolveSrcMediawikiCodePath,
  resolveGadgetsDefinitionManifestPath,
} from "./lib-utils.ts";

/**
 * Reads and parses the contents of /src/gadgets/gadgets-definition.yaml
 *
 * @returns
 */
export async function readGadgetsDefinition(): Promise<GadgetsDefinition> {
  const contents = await readFile(resolveGadgetsDefinitionManifestPath(), { encoding: "utf8" });
  const gadgetsDefinition = new GadgetsDefinition(parse(contents));
  return gadgetsDefinition;
}

interface GadgetPremCheck {
  name: string;
  gadget: GadgetDefinition;
  missing?: string[];
}

/**
 * Check if a gadget sub-directory or a gadget code file exists
 *
 * @param gadgetSection
 * @param gadgetName
 * @param codeFile
 * @returns
 */
export function checkGadgetExists(
  gadgetSection: string,
  gadgetName: string,
  codeFile?: string,
): boolean {
  const path = resolveSrcGadgetsPath(gadgetSection, gadgetName, codeFile);
  return existsSync(path);
}

/**
 * Processes the parsed gadgets definition and does the following:
 *  1) It selects which gadgets to include/exclude when serving/building, based
 *     on the "workspace.enable_all", "workspace.enable", and/or "workspace.disable" properties, or
 *     on the "gadgets.<GADGET-NAME>.disabled" property of each gadget
 *  2) It excludes the gadgets with unresolved directories
 *  3) It sets the gadget build order so gadgets with no required dependencies are loaded first
 *  4) It excludes gadgets with unknown dependencies
 *
 *  @param gadgetsDefinition
 *  @returns
 */
export function getGadgetsToBuild(gadgetsDefinition: GadgetsDefinition): GadgetDefinition[] {
  // Determine which gadgets to include/exclude
  let gadgetsToBuild: GadgetDefinition[] = [];
  for (const [
    _sectionName,
    _gadgetName,
    gadgetDefinition,
    _isEnabled,
  ] of gadgetsDefinition.getGadgets({ enabledOnly: true })) {
    gadgetsToBuild.push(gadgetDefinition);
  }

  // Check if the gadget exists
  const nonexistentGadgets: GadgetPremCheck[] = [];
  gadgetsToBuild = gadgetsToBuild.filter((gadget) => {
    const subdirExists = checkGadgetExists(gadget.section, gadget.name);
    if (!subdirExists) {
      nonexistentGadgets.push({ name: gadget.name, gadget });
    }
    return subdirExists;
  });
  if (nonexistentGadgets.length > 0) {
    console.log("Skipped loading the following gadgets:");
    console.error(
      nonexistentGadgets
        .map(({ gadget }) => {
          return ` - ${gadget.getGadgetId()}\tDirectory not found: ${resolveSrcGadgetsPath(gadget.section, gadget.name)}`;
        })
        .join("\n"),
    );
  }

  // Check for any missing files
  const gadgetsWithMissingFiles: GadgetPremCheck[] = [];
  gadgetsToBuild = gadgetsToBuild.filter((gadget) => {
    const missingCodeFiles =
      gadget.code?.filter((file) => !checkGadgetExists(gadget.section, gadget.name, file)) || [];
    if (missingCodeFiles.length > 0) {
      gadgetsWithMissingFiles.push({
        name: gadget.name,
        gadget,
        missing: missingCodeFiles,
      });
      return false;
    }
    return true;
  });
  if (gadgetsWithMissingFiles.length > 0) {
    console.error("Found gadgets with missing files. The following gadgets will not be loaded:");
    console.error(
      gadgetsWithMissingFiles
        .map(({ gadget, missing = [] }) => `${gadget.getGadgetId()}: MISSING ${missing.join(", ")}`)
        .join("\n"),
    );
  }

  // Determine gadget load order
  let gadgetsToBuildInOrder: GadgetDefinition[] = [];
  const loadedDeps: Set<string> = new Set();
  const getGadgetsWithNoMoreRequiredDependencies = (
    gadgetsToBuild: GadgetDefinition[],
    loadedDeps: Set<string>,
  ): [GadgetDefinition[], string[]] => {
    const res: GadgetDefinition[] = [];
    const depsToLoad: string[] = [];
    for (const gadgetDefinition of gadgetsToBuild) {
      if (loadedDeps.size === 0) {
        if ((gadgetDefinition?.requires || []).length === 0) {
          res.push(gadgetDefinition);
          depsToLoad.push(gadgetDefinition.getGadgetId());
        }
        continue;
      }
      const allDepsLoaded = (gadgetDefinition?.requires || []).every((required) =>
        loadedDeps.has(required),
      );
      if (allDepsLoaded) {
        res.push(gadgetDefinition);
        depsToLoad.push(gadgetDefinition.getGadgetId());
      }
    }
    return [res, depsToLoad];
  };
  while (gadgetsToBuild.length > 0) {
    const [gadgetsToLoad, depsToLoad] = getGadgetsWithNoMoreRequiredDependencies(
      gadgetsToBuild,
      loadedDeps,
    );
    if (depsToLoad.length === 0) {
      console.error(
        "Found gadgets with unrecognized dependencies in gadgets-definition.yaml. The following gadgets will not be loaded:",
      );
      console.error(
        gadgetsToBuild
          .map((gadget) => {
            const deps = (gadget.requires ?? []).filter((dep) => !loadedDeps.has(dep));
            return ` - ${gadget.getGadgetId()}\tRequires: ${deps.join(", ")}`;
          })
          .join("\n"),
      );
      break;
    }
    depsToLoad.forEach((dep) => loadedDeps.add(dep));
    gadgetsToBuild = gadgetsToBuild.filter((gadget) => !loadedDeps.has(gadget.getGadgetId()));
    gadgetsToBuildInOrder.push(...gadgetsToLoad);
  }

  return gadgetsToBuildInOrder;
}

/**
 * Trawls through `/src/mediawiki` to determine the code files to build & compile as the wiki's global
 * interface code
 *
 *  @returns
 */
export function getMediaWikiInterfaceCodeToBuild(): GadgetDefinition[] {
  try {
    const definitions: GadgetDefinition[] = [];
    const files = readdirSync(resolveSrcMediawikiCodePath());
    const kvPairs: { [k: string]: string[] } = {};
    files.forEach((filename) => {
      const k = removeFileExtension(filename).toLowerCase();
      if (!(k in kvPairs)) kvPairs[k] = [];
      kvPairs[k]!.push(filename);
    });
    Object.entries(kvPairs).forEach(([k, files]) => {
      definitions.push(
        new GadgetDefinition(
          {
            code: files,
            resourceLoader: k === "common" ? undefined : { skins: k },
          },
          "mediawiki",
          k,
        ),
      );
    });
    return definitions;
  } catch (err) {
    console.error("Unable to fetch the wiki's global interface code to build & compile.");
    console.error(err);
    return [];
  }
}

/**
 * Pass this function to "`build.rollupOptions.input`" in Vite's config.
 *
 * @param gadgetsToBuild
 * @param mwInterfaceCodeToBuild
 * @returns
 */
export function mapWikicodeSourceFiles(
  gadgetsToBuild: GadgetDefinition[],
  mwInterfaceCodeToBuild: GadgetDefinition[],
): Record<string, string> {
  const entries: Record<string, string> = {};

  mwInterfaceCodeToBuild.forEach((definition) => {
    const loadFile = (filepath: string) => {
      const key = `mediawiki/${resolveFileExtension(filepath)}`;
      entries[key] = resolveSrcMediawikiCodePath(filepath);
    };
    definition.getScripts().forEach(loadFile);
    definition.getStylesheets().forEach(loadFile);
  });

  gadgetsToBuild.forEach((definition) => {
    const { section, name } = definition;
    const loadFile = (filepath: string) => {
      const key = `gadgets/${name}/${resolveFileExtension(filepath)}`;
      entries[key] = resolveSrcGadgetsPath(section, name, filepath);
    };
    definition.getScripts().forEach(loadFile);
    definition.getStylesheets().forEach(loadFile);
  });

  return entries;
}