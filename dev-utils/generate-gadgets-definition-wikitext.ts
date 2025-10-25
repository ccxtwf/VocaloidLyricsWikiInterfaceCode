import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { normalizePath } from 'vite';
import { resolve } from 'path';
import type { GadgetDefinition, GadgetsDefinition, ResourceLoaderConditions } from './types.js';

function resolveGadgetsDefinitionWikitextFile() {
  const distFolder = resolve(__dirname, '../dist');
  if (!existsSync(distFolder)) { mkdirSync(distFolder); }
  const gadgetsFolder = resolve(distFolder, 'gadgets');
  if (!existsSync(gadgetsFolder)) { mkdirSync(gadgetsFolder); }
  return normalizePath(resolve(gadgetsFolder, 'gadgets-definition.wikitext'));
}

export function writeWikitextFile(gadgetsDefinition: GadgetsDefinition): void {
  try {
    const gadgetsDefinitionWikitextFile = resolveGadgetsDefinitionWikitextFile();

    const { 'enable_all': enableAll = true, enable = [], disable = [] } = gadgetsDefinition.workspace;
    const hmGadgetNames = new Set(enableAll ? disable : enable);

    let s: string[] = [];
    for (const [gadgetSectionName, gadgets] of Object.entries(gadgetsDefinition.gadgets)) {
      s.push(`== ${gadgetSectionName} ==`);
      for (const [gadgetName, gadgetDefinition] of Object.entries(gadgets)) {
        if ((enableAll && hmGadgetNames.has(gadgetName)) || (!enableAll && !hmGadgetNames.has(gadgetName))) continue;
        const wikitext = createSingleGadgetDefinitionWikitext(gadgetName, gadgetDefinition);
        if (wikitext !== null) {
          s.push(wikitext);
        }
      }
      s.push('');
    }

    writeFileSync(gadgetsDefinitionWikitextFile, s.join('\n'), { flag: "w+", encoding: "utf8" });
  } catch (err) {
    console.error('Unable to create the contents of gadgets-definition.wikitext');
    console.error(err);
  }
}

function createSingleGadgetDefinitionWikitext(gadgetName: string, gadgetDefinition: GadgetDefinition): string | null {
  if (gadgetDefinition.disabled) return null;
  let { code: gadgetCodeFiles = [], resourceLoader = {} } = gadgetDefinition;
  
  gadgetCodeFiles = gadgetCodeFiles
    .map((filename) => filename.replace(/\.ts$/, '.js').replace(/\.less$/, '.css'));
  
  let resourceLoaderConditions = compileResourceLoaderConditions(resourceLoader);
  if (resourceLoaderConditions !== null) {
    resourceLoaderConditions = "|" + resourceLoaderConditions;
  }

  return `* ${gadgetName}[ResourceLoader${resourceLoaderConditions}]|${gadgetCodeFiles.join('|')}`;
}

function compileResourceLoaderConditions(resourceLoader: ResourceLoaderConditions): string | null {
  const conditions = [];
  
  const normalizeVariable = (variable: string | string[]) => {
    if (typeof variable === 'string') {
      return variable.split(/\s*,\s*/);
    }
    return variable;
  }
  const variablesToNormalize = {
    dependencies: resourceLoader.dependencies,
    actions: resourceLoader.actions,
    categories: resourceLoader.categories,
    contentModels: resourceLoader.contentModels,
    skins: resourceLoader.skins,
    namespaces: resourceLoader.namespaces,
    rights: resourceLoader.rights
  }
  
  if (resourceLoader.default === true) conditions.push('default');
  if (resourceLoader.hidden === true) conditions.push('hidden');
  if (!!resourceLoader.type) conditions.push(`type=${resourceLoader.type}`);
  if (!!resourceLoader.supportsUrlLoad) conditions.push(`supportsUrlLoad=${resourceLoader.supportsUrlLoad}`);

  Object.entries(variablesToNormalize).forEach(([key, variables]) => {
    if (!!variables) {
      conditions.push(`${key}=${normalizeVariable(variables)}`);
    }
  });

  return conditions.length > 0 ? conditions.join('|') : null;
}