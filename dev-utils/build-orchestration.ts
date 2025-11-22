import { readFile, readdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { parse } from 'yaml';
import * as crypto from 'crypto';
import { Target } from 'vite-plugin-static-copy';
import type { GadgetDefinition, GadgetsDefinition } from './types.js';
import { 
  getFileType, 
  removeFileExtension, 
  resolveFileExtension,
  resolveSrcGadgetsPath,
  resolveSrcMediawikiCodePath,
  resolveGadgetsDefinitionManifestPath,
  resolveEntrypointFilepath,
  checkGadgetExists,
  getGadgetId,
  resolveFilepathForBundleInputKey,
  resolveDistGadgetsPath,
  resolveDistMediawikiCodePath,
} from './utils.js';

let viteServerOrigin: string;

// Defines the prefix of the name of the gadget/script when registered onto MW via mw.loader.impl 
// e.g. When this variable is set as "ext.gadget", a gadget named "hello-world" will
//      be registered under the name "ext.gadget.hello-world" 
let namespace = 'ext.gadget';


/** 
 * @param _origin
 * @returns
 */
export function setViteServerOrigin(_origin: string): void {
  viteServerOrigin = _origin;
}

/** 
 * @param _origin
 * @returns
 */
export function setGadgetNamespace(_gadgetNamespace: string): void {
  namespace = _gadgetNamespace;
}

/**
 * Get the JS scripts to load for each gadget
 * 
 * @param gadgetDefinition
 * @returns
 */
function getScriptsToLoadFromGadgetDefinition(gadgetDefinition: GadgetDefinition): string[] {
  return gadgetDefinition.code?.filter(code => getFileType(code) === 'script') || [];
}

/**
 * Get the CSS stylesheets to load for each gadget
 * 
 * @param gadgetDefinition
 * @returns
 */
function getStylesheetsToLoadFromGadgetDefinition(gadgetDefinition: GadgetDefinition): string[] {
  return gadgetDefinition.code?.filter(code => getFileType(code) === 'style') || [];
}

/**
 * Resolve the static URL to the file in the specified gadget directory.
 * This is passed in the entrypoint file (load.js) to mw.loader.impl, 
 * and is used by the MediaWiki client to load and execute/apply the JS/CSS files.
 * 
 * @param filepath
 * @param gadgetSubdir
 * @param isMediawikiInterfaceCode
 * @returns
 */
function getStaticUrlToFile(filepath: string, { gadgetSubdir = '', isMediawikiInterfaceCode = false }: { gadgetSubdir: string, isMediawikiInterfaceCode: boolean }): string {
  filepath = resolveFileExtension(filepath);
  if (isMediawikiInterfaceCode) {
    return encodeURI(`${viteServerOrigin!}/mediawiki/${filepath}`);
  } else {
    return encodeURI(`${viteServerOrigin!}/gadgets/${gadgetSubdir}/${filepath}`);
  }
}

/**
 * Reads and parses the contents of /src/gadgets/gadgets-definition.yaml
 * 
 * @returns
 */
export async function readGadgetsDefinition(): Promise<GadgetsDefinition> {
  const contents = await readFile(resolveGadgetsDefinitionManifestPath(), { encoding: 'utf8' });
  const gadgetsDefinition: GadgetsDefinition = parse(contents);
  return gadgetsDefinition;
}

interface GadgetPremCheck {
  section: string
  name: string
  missing?: string[]
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
  const { 'enable_all': enableAll = false, enable: arrEnabledGs = [], disable: arDisabledGs = [] } = gadgetsDefinition?.workspace || {};
  const enabledGadgets = new Set(arrEnabledGs);
  const disabledGadgets = new Set(arDisabledGs);
  
  // Determine which gadgets to include/exclude
  let gadgetsToBuild: GadgetDefinition[] = [];
  for (const [gadgetSection, gadgetSectionDefinition] of Object.entries(gadgetsDefinition?.gadgets || {})) {
    for (const [gadgetName, gadgetDefinition] of Object.entries(gadgetSectionDefinition || {})) {
      const gadgetId = `${gadgetSection}/${gadgetName}`;
      // Always return early (i.e. do not build the gadget) if 
      // "gadgets.<GADGET-NAME>.disabled" is set on the gadget definition 
      if (gadgetDefinition?.disabled === true) { continue; } 
      // Otherwise defer to "workspace.enable_all", "workspace.enable", "workspace.disable" 
      if (enableAll ? !disabledGadgets.has(gadgetId) : enabledGadgets.has(gadgetId)) {
        gadgetsToBuild.push({
          ...gadgetDefinition,
          section: gadgetSection, 
          name: gadgetName,
        });
      }
    }
  }

  // Check if the gadget exists
  const nonexistentGadgets: GadgetPremCheck[] = [];
  gadgetsToBuild = gadgetsToBuild.filter(({ section, name }) => {
    const subdirExists = checkGadgetExists(section, name);
    if (!subdirExists) {
      nonexistentGadgets.push({ section, name });
    }
    return subdirExists;
  });
  if (nonexistentGadgets.length > 0) {
    console.log("Skipping loading the following gadgets:");
    console.error(
      nonexistentGadgets
        .map(({ section, name }) => {
          return ` - ${getGadgetId(section, name)}\tDirectory not found: ${resolveSrcGadgetsPath(section, name)}`
        })
        .join('\n')
    );
  }

  // Check for any missing files
  const gadgetsWithMissingFiles: GadgetPremCheck[] = [];
  gadgetsToBuild = gadgetsToBuild.filter(({ code, section, name }) => {
    const missingCodeFiles = code?.filter(
      (file) => !checkGadgetExists(section, name, file)
    ) || [];
    if (missingCodeFiles.length > 0) {
      gadgetsWithMissingFiles.push({ 
        section, 
        name,
        missing: missingCodeFiles
      });
      return false;
    }
    return true;
  });
  if (gadgetsWithMissingFiles.length > 0) {
    console.error('Found gadgets with missing files. The following gadgets will not be loaded:');
    console.error(
      gadgetsWithMissingFiles
        .map(({ section, name, missing = [] }) => (
          `${getGadgetId(section, name)}: MISSING ${missing.join(', ')}`)
        )
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
          depsToLoad.push(getGadgetId(gadgetDefinition.section, gadgetDefinition.name));
        }
        continue;
      }
      const allDepsLoaded = (gadgetDefinition?.requires || []).every((required) => loadedDeps.has(required));
      if (allDepsLoaded) {
        res.push(gadgetDefinition);
        depsToLoad.push(getGadgetId(gadgetDefinition.section, gadgetDefinition.name));
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
          .map(({ requires = [], section, name }) => {
            const deps = requires.filter(dep => !loadedDeps.has(dep));
            return ` - ${getGadgetId(section, name)}\tRequires: ${deps.join(', ')}`
          })
          .join('\n')
      );
      break;
    }
    depsToLoad.forEach(dep => loadedDeps.add(dep));
    gadgetsToBuild = gadgetsToBuild.filter(({ section, name }) => !loadedDeps.has(getGadgetId(section, name)));
    gadgetsToBuildInOrder.push(...gadgetsToLoad);
  }

  return gadgetsToBuildInOrder;
}

/**
 * Trawls through /src/mediawiki to determine the code files to build & compile as the wiki's global 
 * interface code
 * 
 *  @returns
 */
export async function getMediaWikiInterfaceCodeToBuild(): Promise<GadgetDefinition[]> {
  try {
    const definitions: GadgetDefinition[] = [];
    const files = await readdir(resolveSrcMediawikiCodePath());
    const kvPairs: { [k: string]: string[] } = {};
    files.forEach((filename) => {
      const k = removeFileExtension(filename).toLowerCase();
      if (!(k in kvPairs)) kvPairs[k] = [];
      kvPairs[k]!.push(filename);
    });
    Object.entries(kvPairs).forEach(([k, files]) => {
      definitions.push({
        section: 'mediawiki',
        name: k,
        code: files,
        resourceLoader: k === 'common' ? undefined : { skins: k }
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
 * Build the entrypoint file (`load.js`) to be served by the Vite server and to be 
 * loaded on the MediaWiki client.
 * 
 * Each module is loaded in the MediaWiki client using `mw.loader.impl`.  
 * 
 * You can check on the status of each module using `mw.loader.getState(moduleName)`.
 * 
 * You can call on each module using `mw.loader.load()` or `mw.loader.using()`.
 * 
 * @param gadgetsToBuild
 * @param mediawikiInterfaceCodeToBuild
 * @param useRolledUpImplementation
 * @returns
 */
export async function serveGadgets(
  gadgetsToBuild: GadgetDefinition[], 
  mediawikiInterfaceCodeToBuild: GadgetDefinition[],
  useRolledUpImplementation: boolean = false
): Promise<void> {
  const entrypointFile = resolveEntrypointFilepath();
  const writeStream = createWriteStream(entrypointFile, { flags: 'w', encoding: 'utf-8'});
  try {
    const createScriptLoadingStatement = (gadget: GadgetDefinition) => {
      return `mw.loader.load("${
        getStaticUrlToFile('gadget-impl.js', { 
          gadgetSubdir: `${gadget.section}/${gadget.name}`, 
          isMediawikiInterfaceCode: gadget.section === 'mediawiki'
        })
      }");`
    }
    // Async generator implementation
    function* awaitTheseTasks() {
      if (useRolledUpImplementation) {
        if (mediawikiInterfaceCodeToBuild.length > 0) {
          yield createScriptLoadingStatement(mediawikiInterfaceCodeToBuild[0]);
        }
      } else {
        for (const gadget of mediawikiInterfaceCodeToBuild) {
          yield createGadgetImplementation(gadget);
        }
      }
      
      for (const gadget of gadgetsToBuild) {
        yield useRolledUpImplementation ? 
          createScriptLoadingStatement(gadget) : 
          createGadgetImplementation(gadget);
      }
    }
    for await (const gadgetImplementation of awaitTheseTasks()) {
      writeStream.write(gadgetImplementation);
      writeStream.write(useRolledUpImplementation ? '\n' : '\n\n');
    }
  } catch (err) {
    console.error(err);
  } finally {
    writeStream.close();
  }
}

/**
 * Wraps the mw.loader.impl implementation in conditional expressions
 * to simulate ResourceLoader's conditional loading
 * 
 * @param gadgetImplementation  mw.loader.impl implementation
 * @param resourceLoader        conditions to load
 * @returns
 */
function addGadgetImplementationLoadConditions(gadgetImplementation: string, 
  { resourceLoader: { 
    dependencies = null, rights = null, skins = null, 
    actions = null, categories = null, namespaces = null, 
    contentModels = null 
  } = {} }: GadgetDefinition,
  { minify = false }: { minify: boolean }
): string {
  if ([dependencies, rights, skins, actions, categories, namespaces, contentModels].every((v) => v === null)) {
    return gadgetImplementation;
  }
  const conditions: string[] = [];
  const normalizeVariable = (variable: string | string[]) => {
    if (typeof variable === 'string') {
      return variable.split(/\s*,\s*/);
    }
    return variable;
  }
  const generateCodeConditionForComparingValues = (rsValues: string[], configKey: string, valueIsNumeric: boolean = false): string => (
    `[${rsValues.map(el => valueIsNumeric ? el : `"${el}"`).join(',')}].some(function(a){return mw.config.get('${configKey}') === a;})`
  );
  const generateCodeConditionForComparingLists = (rsValues: string[], configKey: string, valueIsNumeric: boolean = false): string => (
    `[${rsValues.map(el => valueIsNumeric ? el : `"${el}"`).join(',')}].some(function(a){return (mw.config.get('${configKey}') || []).indexOf(a) > -1;})`
  );

  const checkForConditions = [
    { v: rights, configIsListOfValues: true, configKey: 'wgUserRights', valueIsNumeric: false },
    { v: skins, configIsListOfValues: false, configKey: 'skin', valueIsNumeric: false },
    { v: actions, configIsListOfValues: false, configKey: 'wgAction', valueIsNumeric: false },
    { v: categories, configIsListOfValues: true, configKey: 'wgCategories', valueIsNumeric: false },
    { v: namespaces, configIsListOfValues: false, configKey: 'wgNamespaceNumber', valueIsNumeric: true },
    { v: contentModels, configIsListOfValues: false, configKey: 'wgPageContentModel', valueIsNumeric: false },
  ];
  checkForConditions.forEach(({ v, configIsListOfValues, configKey, valueIsNumeric }) => {
    if (!!v) {
      v = normalizeVariable(v);
      const fn = (
        configIsListOfValues ? 
        generateCodeConditionForComparingLists : 
        generateCodeConditionForComparingValues
      );
      conditions.push(fn(v, configKey, valueIsNumeric));
    }
  });

  let wrapped = gadgetImplementation;

  if (!!dependencies) {
    dependencies = normalizeVariable(dependencies);
    wrapped = `mw.loader.using([${dependencies.map(el => `"${el}"`).join(',')}],function(require){${minify ? '' : '\n  '}${wrapped}${minify ? '' : '\n  '}});`
  }
  if (conditions.length === 1) {
    wrapped = `if (${conditions[0]}){\n  ${wrapped}\n  }`;
  } else if (conditions.length > 0) {
    wrapped = `if ([${conditions.join(',')}].every(function(el){${minify ? '' : ' '}return el;${minify ? '' : ' '}})){${minify ? '' : '\n  '}${wrapped}${minify ? '' : '\n  '}}`;
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
 * @param gadget
 * @param rollup  Set as true to get the gadget to write the rolled up gadget implementation
 * @returns
 */
export async function createGadgetImplementation(gadget: GadgetDefinition, rollup: boolean = false): Promise<string> {
  try {
    const { section, name } = gadget;
    
    const isMwInterfaceCode = (section === 'mediawiki');
    if (!isMwInterfaceCode && !checkGadgetExists(section, name)) {
      throw new Error(`Cannot resolve gadget ${section}/${name}`);
    }

    const hash = crypto.randomBytes(4).toString('hex');

    let snippet: string;

    if (rollup) {

      const scriptContents = await Promise.all(
        getScriptsToLoadFromGadgetDefinition(gadget)
          .map((script) => readFile(
            isMwInterfaceCode ?
              resolveDistMediawikiCodePath(resolveFileExtension(script)) :
              resolveDistGadgetsPath(section, name, resolveFileExtension(script)), 
            { encoding: 'utf-8', flag: 'r' }
          ))
      );

      const styleContents = (await Promise.all(
        getStylesheetsToLoadFromGadgetDefinition(gadget)
          .map((style) => readFile(
            isMwInterfaceCode ?
              resolveDistMediawikiCodePath(resolveFileExtension(style)) :
              resolveDistGadgetsPath(section, name, resolveFileExtension(style)), 
            { encoding: 'utf-8', flag: 'r' }
          ))
      )).map(contents => `"${contents.replaceAll(/"/g, '\\"').trim()}"`);
      
      snippet = `mw.loader.impl(function(){return ["${namespace}.${name}@${hash}",function($,jQuery,require,module){${scriptContents.join('\n')}},{"css":[${styleContents.join(',')}]},{},{},null];});`.trim();

    } else {

      const scriptsToLoad = getScriptsToLoadFromGadgetDefinition(gadget)
        .map((script) => {
          const scriptUrl = getStaticUrlToFile(script.replaceAll('"', '\\"'), { 
            gadgetSubdir: `${section}/${name}`, isMediawikiInterfaceCode: isMwInterfaceCode
          });
          return `${" ".repeat(10)}fetch("${scriptUrl}")\n${" ".repeat(12)}.then(res => res.text())\n${" ".repeat(12)}.then(contents => $.globalEval(\`(() => {\${contents}})()\`))\n${" ".repeat(12)}.catch(console.error);`;
        });

      const stylesToLoad = getStylesheetsToLoadFromGadgetDefinition(gadget)
        .map((style) => {
          const styleUrl = getStaticUrlToFile(style.replaceAll('"', '\\"'), { 
            gadgetSubdir: `${section}/${name}`, isMediawikiInterfaceCode: isMwInterfaceCode
          });
          return `"${styleUrl}"`;
        });

      snippet = `  mw.loader.impl(function (){
      return [
        "${namespace}.${name}@${hash}",
        function($, jQuery, require, module) {${
          scriptsToLoad.length === 0 ? '' :
          `\n` + scriptsToLoad.join('\n') + `\n${" ".repeat(8)}`
        }},
        {"url":{"all":[${stylesToLoad.join(',')}]}},
        {}, {}, null
      ];
    });`;
    }

    snippet = addGadgetImplementationLoadConditions(snippet, gadget, { minify: rollup });
    snippet = `(function (mw) {${rollup ? '': '\n  '}${snippet}${rollup ? '' : '\n'}})(mediaWiki);`

    return snippet;

  } catch (err) {
    console.error(err);
    return '';
  }
}

/**
 * Pass this function to "`build.rollupOptions.input`" in Vite's config.
 *
 * @param gadgetsToBuild
 * @param mwInterfaceCodeToBuild
 * @returns
 */
export function mapWikicodeSourceFiles(gadgetsToBuild: GadgetDefinition[], mwInterfaceCodeToBuild: GadgetDefinition[]): [{ [Key: string]: string }, Target[]] {
  const entries: { [Key: string]: string } = {};
  const assets: Target[] = [];

  mwInterfaceCodeToBuild.forEach((definition) => {
    const loadFile = (filepath: string) => {
      const key = `mediawiki/${resolveFilepathForBundleInputKey(filepath)}`;
      entries[key] = resolveSrcMediawikiCodePath(filepath);
    }
    getStylesheetsToLoadFromGadgetDefinition(definition).forEach(loadFile);
    getScriptsToLoadFromGadgetDefinition(definition).forEach(loadFile);
  });

  gadgetsToBuild.forEach((definition) => {
    const { section, name } = definition;
    const loadFile = (filepath: string) => {
      const key = `gadgets/${section}/${name}/${resolveFilepathForBundleInputKey(filepath)}`;
      entries[key] = resolveSrcGadgetsPath(section, name, filepath);
    }
    getStylesheetsToLoadFromGadgetDefinition(definition).forEach(loadFile);
    getScriptsToLoadFromGadgetDefinition(definition).forEach(loadFile);
    (definition.i18n || []).forEach((i18nFile) => {
      assets.push({ 
        src: resolveSrcGadgetsPath(section, name, i18nFile), 
        dest: `${section}/${name}`, 
        overwrite: true 
      });
    });
  });

  return [entries, assets];
}