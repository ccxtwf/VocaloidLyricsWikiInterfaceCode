import * as crypto from "crypto";
import { resolveFileExtension } from "./lib-utils.ts";
import { GadgetDefinition } from "./models/index.ts";

// Defines the origin from which the scripts will be loaded (if serving from `dist/load.js`)
let origin: string;

// Defines the prefix of the name of the gadget/script when registered onto MW via mw.loader.impl
// e.g. When this variable is set as "ext.gadget", a gadget named "hello-world" will
//      be registered under the name "ext.gadget.hello-world"
let namespace = "ext.gadget";

export function setOrigin(_origin: string): void {
  origin = _origin.replace(/\/$/, "");
}

export function setGadgetNamespace(_gadgetNamespace: string): void {
  namespace = _gadgetNamespace;
}

export function getOrigin(): string {
  return origin;
}

export function getGadgetNamespace(): string {
  return namespace;
}

/**
 * Create a random 8-character length, alphanumeric hash string
 *
 * @returns
 */
export function createGadgetResourceLoaderHash(): string {
  return crypto.randomBytes(4).toString("hex");
}

/**
 * Create gadget ID to be passed to `mw.loader.impl`
 *
 * @param gadgetName
 * @param hashed
 * @returns
 */
export function createGadgetResourceLoaderId(gadgetName: string, hashed: boolean = true) {
  const hash = hashed ? "@" + createGadgetResourceLoaderHash() : "";
  return `${getGadgetNamespace()}.${gadgetName}${hash}`;
}

/**
 * Resolve the static URL to the file in the specified gadget directory.
 * This is passed in the entrypoint file (`load.js`) to `mw.loader.impl`,
 * and is used by the MediaWiki client to load and execute/apply the JS/CSS files.
 *
 * @param filename
 * @param gadgetSubdir
 * @param isMediawikiInterfaceCode
 * @returns
 */
export function getStaticUrlToFile(
  filename: string,
  {
    gadgetSubdir = "",
    isMediawikiInterfaceCode = false,
    doResolveFileExtension = true,
  }: { gadgetSubdir: string; isMediawikiInterfaceCode: boolean; doResolveFileExtension?: boolean },
): string {
  filename = doResolveFileExtension ? resolveFileExtension(filename) : filename;
  if (isMediawikiInterfaceCode) {
    return encodeURI(`${origin!}/mediawiki/${filename}`);
  } else {
    return encodeURI(`${origin!}/gadgets/${gadgetSubdir}/${filename}`);
  }
}

/**
 * Used to simulate ResourceLoader's conditional loading
 *
 * @param resourceLoader        conditions to load
 * @deprecated
 * @returns `[head, tail]`
 */
export function generateGadgetImplementationLoadConditionsWrapperCode({
  resourceLoader: {
    dependencies = null,
    rights = null,
    skins = null,
    actions = null,
    categories = null,
    namespaces = null,
    contentModels = null,
  } = {},
}: GadgetDefinition): [string[], string[]] {
  if (
    [dependencies, rights, skins, actions, categories, namespaces, contentModels].every(
      (v) => v === null,
    )
  ) {
    return [[], []];
  }
  const conditions: string[] = [];
  const normalizeVariable = (variable: string | string[]) => {
    if (typeof variable === "string") {
      return variable.split(/\s*,\s*/);
    }
    return variable;
  };
  const generateCodeConditionForComparingValues = (
    rsValues: string[],
    configKey: string,
    valueIsNumeric: boolean = false,
  ): string => {
    const arr = `[${rsValues.map((el) => (valueIsNumeric ? el : `"${el}"`)).join(",")}]`;
    // should be ES5-compliant
    return `${arr}.some(function (a) { return mw.config.get('${configKey}') === a; })`;
  };
  const generateCodeConditionForComparingLists = (
    rsValues: string[],
    configKey: string,
    valueIsNumeric: boolean = false,
  ): string => {
    const arr = `[${rsValues.map((el) => (valueIsNumeric ? el : `"${el}"`)).join(",")}]`;
    // should be ES5-compliant
    return `${arr}.some(function (a) { return (mw.config.get('${configKey}') || []).indexOf(a) > -1; })`;
  };

  const checkForConditions = [
    { v: rights, configIsListOfValues: true, configKey: "wgUserRights", valueIsNumeric: false },
    { v: skins, configIsListOfValues: false, configKey: "skin", valueIsNumeric: false },
    { v: actions, configIsListOfValues: false, configKey: "wgAction", valueIsNumeric: false },
    { v: categories, configIsListOfValues: true, configKey: "wgCategories", valueIsNumeric: false },
    {
      v: namespaces,
      configIsListOfValues: false,
      configKey: "wgNamespaceNumber",
      valueIsNumeric: true,
    },
    {
      v: contentModels,
      configIsListOfValues: false,
      configKey: "wgPageContentModel",
      valueIsNumeric: false,
    },
  ];
  checkForConditions.forEach(({ v, configIsListOfValues, configKey, valueIsNumeric }) => {
    if (v) {
      v = normalizeVariable(v);
      const fn = configIsListOfValues
        ? generateCodeConditionForComparingLists
        : generateCodeConditionForComparingValues;
      conditions.push(fn(v, configKey, valueIsNumeric));
    }
  });

  let head: string[] = [];
  let tail: string[] = [];

  if (conditions.length === 1) {
    head.push(`if (${conditions[0]}) {`);
    tail.unshift(`}`);
  } else if (conditions.length > 0) {
    head.push(`if ( ([ ${conditions.join(", ")} ]).every(Boolean) ) {`);
    tail.unshift(`}`);
  }

  if (dependencies) {
    dependencies = normalizeVariable(dependencies);
    head.push(
      `mw.loader.using([ ${dependencies.map((el) => `"${el}"`).join(`, `)} ], function (require) {`,
    );
    tail.unshift(`});`);
  }

  return [head, tail];
}