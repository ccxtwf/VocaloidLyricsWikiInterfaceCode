import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile, readdir } from 'fs/promises';
import { resolve, join } from 'path';
import { parse } from 'yaml';
import * as crypto from 'crypto';
import { normalizePath } from 'vite';
import { Target } from 'vite-plugin-static-copy';
import type { GadgetDefinition, GadgetsDefinition } from './types.js';

let gadgetsDir: string;
let mediawikiInterfaceDir: string;
resolveCodeDirectory();

let viteServerOrigin: string;

// Defines the prefix of the name of the gadget/script when registered onto MW via mw.loader.impl 
// e.g. When this variable is set as "ext.gadget", a gadget named "hello-world" will
//      be registered under the name "ext.gadget.hello-world" 
const namespace = 'ext.gadget';

/** 
 * Resolve the path to the directory of gadgets and MediaWiki interface code (Common.css/Common.js) 
 * in the Vite project.
 * 
 * @returns { gadgetsDir: string, mediawikiInterfaceDir: string }
 */
export function resolveCodeDirectory(): { gadgetsDir: string, mediawikiInterfaceDir: string } {
  const srcDirPath = normalizePath(resolve(__dirname, '../src'));
  if (!existsSync(srcDirPath)) { mkdirSync(srcDirPath); }
  if (!gadgetsDir) {
    gadgetsDir = normalizePath(join(srcDirPath, 'gadgets'));
    if (!existsSync(gadgetsDir)) { mkdirSync(gadgetsDir); }
  }
  if (!mediawikiInterfaceDir) {
    mediawikiInterfaceDir = normalizePath(join(srcDirPath, 'mediawiki'));
    if (!existsSync(mediawikiInterfaceDir)) { mkdirSync(mediawikiInterfaceDir); }
  }
  return { gadgetsDir, mediawikiInterfaceDir };
}

/**
 * Resolve the path to the specific sub-directory and/or file belonging
 * to the gadget in the Vite project.
 * 
 * @param gadgetName string
 * @param relativeFilepath string | undefined
 * @returns string
 */
export function resolveGadgetPath(gadgetName: string, relativeFilepath?: string): string {
  const gadgetSubdir = join(gadgetsDir, gadgetName);
  if (relativeFilepath === undefined) { return normalizePath(gadgetSubdir); }
  return normalizePath(resolve(gadgetSubdir, relativeFilepath));
}

/**
 * Resolve the path to the specific MediaWiki global wiki interface code (i.e. Common.css/Commoh.js) 
 * in the Vite project.
 * 
 * @param filename string
 * @returns string
 */
export function resolveMediaWikiInterfaceCodePath(filename: string): string {
  return normalizePath(join(mediawikiInterfaceDir, filename));
}

/** 
 * Resolve the path to the load.js file to be loaded on the MediaWiki instance.
 * This load.js file contains the definitions of the gadgets that it tells
 * MediaWiki to load and register as modules (using mw.loader.impl).
 * 
 * @param devMode boolean
 * @returns string
 */
function resolveEntrypoint(devMode: boolean): string {
  const distFolder = resolve(__dirname, devMode ? '../' : '../dist');
  if (!existsSync(distFolder)) { mkdirSync(distFolder); }
  return normalizePath(resolve(distFolder, 'load.js'));
}

/** 
 * Checks if the file exists in the specified gadget sub-directory in the Vite Project.
 * 
 * @param relativeFilepath string
 * @returns boolean
 */
function fileExistsInGadgetDirectory(gadgetName: string, relativeFilepath: string): boolean {
  return existsSync(resolveGadgetPath(gadgetName, relativeFilepath));
}

/**
 * Get the JS scripts to load for each gadget
 * 
 * @param gadgetDefinition GadgetDefinition
 * @returns Array<string> 
 */
function getScriptsToLoadFromGadgetDefinition(gadgetDefinition: GadgetDefinition): string[] {
  return gadgetDefinition.code?.filter(code => code.match(/\.(?:js|ts)$/)) || [];
}

/**
 * Get the CSS stylesheets to load for each gadget
 * 
 * @param gadgetDefinition GadgetDefinition
 * @returns Array<string> 
 */
function getStylesheetsToLoadFromGadgetDefinition(gadgetDefinition: GadgetDefinition): string[] {
  return gadgetDefinition.code?.filter(code => code.match(/\.(?:css|less)$/)) || [];
}

/**
 * Resolve the static URL to the file in the specified gadget directory.
 * This is passed in the entrypoint file (load.js) to mw.loader.impl, 
 * and is used by the MediaWiki client to load and execute/apply the JS/CSS files.
 * 
 * @param filepath string
 * @param gadgetSubdir string
 * @param isMediawikiInterfaceCode boolean
 * @returns string 
 */
function getStaticUrlToFile(filepath: string, { gadgetSubdir = '', isMediawikiInterfaceCode = false }: { gadgetSubdir: string, isMediawikiInterfaceCode: boolean }): string {
  // Resolve TS files
  filepath = filepath.replace(/\.ts$/, '.js');
  // Resolve LESS files
  filepath = filepath.replace(/\.less$/, '.css');
  if (isMediawikiInterfaceCode) {
    return `${viteServerOrigin!}/mediawiki/${filepath}`;
  } else {
    return encodeURI(`${viteServerOrigin!}/gadgets/${gadgetSubdir}/${filepath}`);
  }
}

/** 
 * @param _origin string
 * @returns void
 */
export function setViteServerOrigin(_origin: string): void {
  viteServerOrigin = _origin;
}

/**
 * Reads and parses the contents of /src/gadgets/gadgets-definition.yaml
 * 
 * @returns Promise<GadgetsDefinition>
 */
export async function readGadgetsDefinition(): Promise<GadgetsDefinition> {
  const contents = await readFile(resolve(gadgetsDir, 'gadgets-definition.yaml'), { encoding: 'utf8' });
  const gadgetsDefinition = parse(contents);
  return gadgetsDefinition;
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
 *  @param gadgetsDefinition GadgetsDefinition
 *  @returns Array<GadgetDefinition>
 */
export function getGadgetsToBuild(gadgetsDefinition: GadgetsDefinition): GadgetDefinition[] {
  const { 'enable_all': enableAll = false, enable: arrEnabledGs = [], disable: arDisabledGs = [] } = gadgetsDefinition?.workspace || {};
  const enabledGadgets = new Set(arrEnabledGs);
  const disabledGadgets = new Set(arDisabledGs);
  
  // Determine which gadgets to include/exclude
  let gadgetsToBuild: GadgetDefinition[] = [];
  for (const [gadgetSectionName, gadgetSectionDefinition] of Object.entries(gadgetsDefinition?.gadgets || {})) {
    for (const [gadgetName, gadgetDefinition] of Object.entries(gadgetSectionDefinition || {})) {
      // Always return early (i.e. do not build the gadget) if 
      // "gadgets.<GADGET-NAME>.disabled" is set on the gadget definition 
      if (gadgetDefinition?.disabled === true) { continue; } 
      // Otherwise defer to "workspace.enable_all", "workspace.enable", "workspace.disable" 
      if (enableAll ? !disabledGadgets.has(gadgetName) : enabledGadgets.has(gadgetName)) {
        gadgetsToBuild.push({
          ...gadgetDefinition,
          subdir: `${gadgetSectionName}/${gadgetName}`
        });
      }
    }
  }

  // Check if the gadget exists
  const nonexistentGadgets: string[] = [];
  gadgetsToBuild = gadgetsToBuild.filter(({ subdir }) => {
    const subdirExists = existsSync(resolveGadgetPath(subdir!));
    if (!subdirExists) { nonexistentGadgets.push(subdir!); }
    return subdirExists;
  });
  if (nonexistentGadgets.length > 0) {
    console.log("Skipping loading the following gadgets:");
    console.error(
      nonexistentGadgets
        .map((subdir) => {
          return ` - ${subdir}\tDirectory not found: ${resolveGadgetPath(subdir)}`
        })
        .join('\n')
    );
  }

  // Check for any missing files
  const gadgetsWithMissingFiles: { subdir: string, missingFiles: string[] }[] = [];
  gadgetsToBuild = gadgetsToBuild.filter(({ code, subdir }) => {
    const missingCodeFiles = code?.filter((file) => !fileExistsInGadgetDirectory(subdir!, file)) || [];
    if (missingCodeFiles.length > 0) {
      gadgetsWithMissingFiles.push({ subdir: subdir!, missingFiles: missingCodeFiles });
      return false;
    }
    return true;
  });
  if (gadgetsWithMissingFiles.length > 0) {
    console.error('Found gadgets with missing files. The following gadgets will not be loaded:');
    console.error(
      gadgetsWithMissingFiles
        .map(({ subdir, missingFiles }) => `${subdir}: MISSING ${missingFiles.join(', ')}`)
        .join('\n')
    );
  }
  
  // Determine gadget load order
  let gadgetsToBuildInOrder: GadgetDefinition[] = [];
  const loadedDeps: Set<string> = new Set();
  const getGadgetsWithNoMoreRequiredDependencies = (gadgetsToBuild: GadgetDefinition[], loadedDeps: Set<string>): [GadgetDefinition[], string[]] => {
    const res: GadgetDefinition[] = [];
    const depsToLoad: string[] = [];
    for (const gadgetDefinition of gadgetsToBuild) {
      if (loadedDeps.size === 0) {
        if ((gadgetDefinition?.requires || []).length === 0) {
          res.push(gadgetDefinition);
          depsToLoad.push(gadgetDefinition.subdir!);
        }
        continue;
      }
      const allDepsLoaded = (gadgetDefinition?.requires || []).every((required) => loadedDeps.has(required));
      if (allDepsLoaded) {
        res.push(gadgetDefinition);
        depsToLoad.push(gadgetDefinition.subdir!);
      }
    }
    return [res, depsToLoad];
  };
  while (gadgetsToBuild.length > 0) {
    const [gadgetsToLoad, depsToLoad] = getGadgetsWithNoMoreRequiredDependencies(gadgetsToBuild, loadedDeps);
    if (depsToLoad.length === 0) {
      console.error('Found gadgets with unrecognized dependencies in gadgets-definition.yaml. The following gadgets will not be loaded:');
      console.error(
        gadgetsToBuild
          .map((gadgetDefinition) => {
            const deps = (gadgetDefinition?.requires || []).filter(dep => !loadedDeps.has(dep));
            return ` - ${gadgetDefinition.subdir!}\tRequires: ${deps.join(', ')}`
          })
          .join('\n')
      );
      break;
    }
    depsToLoad.forEach(dep => loadedDeps.add(dep));
    gadgetsToBuild = gadgetsToBuild.filter(({ subdir }) => !loadedDeps.has(subdir!));
    gadgetsToBuildInOrder.push(...gadgetsToLoad);
  }

  return gadgetsToBuildInOrder;
}

/**
 * Trawls through /src/mediawiki to determine the code files to build & compile as the wiki's global 
 * interface code
 * 
 *  @returns Array<GadgetDefinition>
 */
export async function getMediaWikiInterfaceCodeToBuild(): Promise<GadgetDefinition[]> {
  try {
    const definitions: GadgetDefinition[] = [];
    const files = await readdir(mediawikiInterfaceDir);
    const kvPairs: { [k: string]: string[] } = {};
    files.forEach((filename) => {
      const k = filename.replace(/\.[a-zA-Z0-9]+$/, '').toLowerCase();
      if (!(k in kvPairs)) kvPairs[k] = [];
      kvPairs[k]!.push(filename);
    });
    if ('common' in kvPairs) {
      definitions.push({
        subdir: 'mediawiki',
        code: kvPairs.common
      });
      delete kvPairs.common;
    }
    Object.entries(kvPairs).forEach(([k, files]) => {
      definitions.push({
        subdir: `mediawiki-${k}`,
        code: files,
        resourceLoader: { skins: k }
      })
    });
    return definitions;
  } catch (err) {
    console.error('Unable to fetch the wiki\'s global interface code to build & compile.');
    console.error(err);
    return [];
  }
}

/**
 * Build the entrypoint file (load.js) to be served by the Vite server and to be 
 * loaded on the MediaWiki client.
 * Each module is loaded in the MediaWiki client using mw.loader.impl.  
 * You can check on the status of each module using mw.loader.getState(moduleName).
 * You can call on each module using mw.loader.load() or mw.loader.using().
 * 
 * @param gadgetsToBuild Array<GadgetDefinition>
 * @param mediawikiInterfaceCodeToBuild Array<GadgetDefinition>
 * @param devMode boolean
 * @returns Promise<void>
 */
export async function serveGadgets(
  gadgetsToBuild: GadgetDefinition[], 
  mediawikiInterfaceCodeToBuild: GadgetDefinition[], 
  devMode: boolean
): Promise<void> {
  const entrypointFile = resolveEntrypoint(devMode);
  // Clear entrypoint file
  await writeFile(entrypointFile, '', { flag: "w+", encoding: "utf8"});

  // Async generator implementation
  function* awaitTheseTasks() {
    for (const gadget of mediawikiInterfaceCodeToBuild) {
      yield createGadgetImplementation(gadget);
    }
    for (const gadget of gadgetsToBuild) {
      yield createGadgetImplementation(gadget);
    }
  }
  for await (const gadgetImplementation of awaitTheseTasks()) {
    await writeFile(entrypointFile, gadgetImplementation + '\n\n', { flag: "a+", encoding: "utf8" });
  }
}

/**
 * Wraps the mw.loader.impl implementation in conditional expressions
 * to simulate ResourceLoader's conditional loading
 * 
 * @param gadgetImplementation string - mw.loader.impl implementation
 * @param resourceLoader ResourceLoader
 * @param devMode boolean
 * @returns Promise<string>
 */
function addGadgetImplementationLoadConditions(gadgetImplementation: string, 
  { resourceLoader: { 
    dependencies = null, rights = null, skins = null, 
    actions = null, categories = null, namespaces = null, 
    contentModels = null 
  } = {} }: GadgetDefinition,
  devMode: boolean
) {
  if ([dependencies, rights, skins, actions, categories, namespaces, contentModels].every((v) => v === null)) {
    return gadgetImplementation;
  }
  const conditions = [];
  const normalizeVariable = (variable: string | string[]) => {
    if (typeof variable === 'string') {
      return variable.split(/\s*,\s*/);
    }
    return variable;
  }
  const generateCodeConditionForComparingValues = (rsValues: string[], configKey: string, valueIsNumeric: boolean = false) => (
    `[${rsValues.map(el => valueIsNumeric ? el : `"${el}"`).join(',')}].some(function(a){return mw.config.get('${configKey}') === a;})`
  );
  const generateCodeConditionForComparingLists = (rsValues: string[], configKey: string, valueIsNumeric: boolean = false) => (
    `[${rsValues.map(el => valueIsNumeric ? el : `"${el}"`).join(',')}].some(function(a){return (mw.config.get('${configKey}') || []).indexOf(a) > -1;})`
  );
  
  if (!!rights) {
    rights = normalizeVariable(rights);
    conditions.push(generateCodeConditionForComparingLists(rights, 'wgUserRights'));
  }
  if (!!skins) {
    skins = normalizeVariable(skins);
    conditions.push(generateCodeConditionForComparingValues(skins, 'skin'));
  }
  if (!!actions) {
    actions = normalizeVariable(actions);
    conditions.push(generateCodeConditionForComparingValues(actions, 'wgAction'));
  }
  if (!!categories) {
    categories = normalizeVariable(categories);
    conditions.push(generateCodeConditionForComparingLists(categories, 'wgCategories'));
  }
  if (!!namespaces) {
    namespaces = normalizeVariable(namespaces);
    conditions.push(generateCodeConditionForComparingValues(namespaces, 'wgNamespaceNumber', true));
  }
  if (!!contentModels) {
    contentModels = normalizeVariable(contentModels);
    conditions.push(generateCodeConditionForComparingValues(contentModels, 'wgPageContentModel'));
  }

  let wrapped = gadgetImplementation;

  if (!!dependencies) {
    dependencies = normalizeVariable(dependencies);
    wrapped = `mw.loader.using([${dependencies.map(el => `"${el}"`).join(',')}],function(require){${devMode ? '\n' : ''}${wrapped}${devMode ? '\n' : ''}});`
  }
  if (conditions.length === 1) {
    wrapped = `if (${conditions[0]}){${devMode ? '\n' : ''}${wrapped}${devMode ? '\n  ' : ''}}`;
  } else if (conditions.length > 0) {
    wrapped = `if ([${conditions.join(',')}].every(function(el){ return el; })){${devMode ? '\n' : ''}${wrapped}${devMode ? '\n  ' : ''}}`;
  }

  return wrapped;
}

/**
 * Defines the implementation of each gadget.
 * Each gadget is registered on MediaWiki using mw.loader.impl.
 * The responsibility of loading the scripts & stylesheets served statically from
 * the Vite server (when on Dev Mode) lies on the MediaWiki instance 
 * (through mw.loader.impl).
 * 
 * @param gadget GadgetDefinition - The gadget definition
 * @returns Promise<string>
 */
export async function createGadgetImplementation(gadget: GadgetDefinition): Promise<string> {
  try {
    const subdir = gadget.subdir || '';
    if (subdir === '') throw new Error(`Cannot resolve gadget ${subdir}`);
    const isMediawikiInterfaceCode = subdir.startsWith('mediawiki');
    if (!isMediawikiInterfaceCode && !existsSync(resolveGadgetPath(subdir))) {
      throw new Error(`Cannot resolve gadget ${subdir}`);
    }

    const name = subdir!.replaceAll(/\s+/g, '-').replaceAll(/["']/g, '');
    const hash = crypto.randomBytes(4).toString('hex');

    const scriptsToLoad = getScriptsToLoadFromGadgetDefinition(gadget)
      .map((script) => {
        const scriptUrl = getStaticUrlToFile(script.replaceAll('"', '\\"'), { 
          gadgetSubdir: subdir!, isMediawikiInterfaceCode
        });
        return `"${scriptUrl}"`;
      });
    
    const stylesToLoad = getStylesheetsToLoadFromGadgetDefinition(gadget)
      .map((style) => {
        const styleUrl = getStaticUrlToFile(style.replaceAll('"', '\\"'), { 
          gadgetSubdir: subdir!, isMediawikiInterfaceCode
        });
        return `"${styleUrl}"`;
      });

    let snippet = `  mw.loader.impl(function (){
      return [
        "${namespace}.${name}@${hash}",
        [${scriptsToLoad.join(',')}],
        {"url":{"all":[${stylesToLoad.join(',')}]}},
        {}, {}, null
      ];
    });`;
    snippet = addGadgetImplementationLoadConditions(snippet, { resourceLoader: gadget.resourceLoader }, true);
    snippet = `(function (mw) {\n  ${snippet}\n})(mediaWiki);`

    return snippet;

  } catch (err) {
    console.error(err);
    return '';
  }
}

/**
 * Pass this function to "build.rollupOptions.input" in Vite's config.
 *
 * @param gadgetsToBuild Array<GadgetDefinition>
 * @param mediawikiInterfaceCodeToBuild Array<GadgetDefinition>
 * @returns [Map<string, string>, Array<string>]
 */
export function mapWikicodeSourceFiles(gadgetsToBuild: GadgetDefinition[], mediawikiInterfaceCodeToBuild: GadgetDefinition[]): [{ [Key: string]: string }, Target[]] {
  const entries: { [Key: string]: string } = {};
  const assets: Target[] = [];

  const normalizeBuildOutputFileExtension = (filepath: string) => {
    return filepath
      .replace(/\.(?:less)$/, '.css')
      .replace(/\.(?:ts|js)$/, '');
  }

  mediawikiInterfaceCodeToBuild.forEach((definition) => {
    const loadFile = (filepath: string) => {
      const key = `mediawiki/${normalizeBuildOutputFileExtension(filepath)}`;
      entries[key] = resolveMediaWikiInterfaceCodePath(filepath);
    }
    getStylesheetsToLoadFromGadgetDefinition(definition).forEach(loadFile);
    getScriptsToLoadFromGadgetDefinition(definition).forEach(loadFile);
  });

  gadgetsToBuild.forEach((definition) => {
    const subdir = definition.subdir!;
    const loadFile = (filepath: string) => {
      const key = `gadgets/${subdir}/${normalizeBuildOutputFileExtension(filepath)}`;
      entries[key] = resolveGadgetPath(subdir, filepath);
    }
    getStylesheetsToLoadFromGadgetDefinition(definition).forEach(loadFile);
    getScriptsToLoadFromGadgetDefinition(definition).forEach(loadFile);
    (definition.i18n || []).forEach((i18nFile) => {
      assets.push({ src: resolveGadgetPath(subdir, i18nFile), dest: subdir, overwrite: true });
    });
  });

  return [entries, assets];
}