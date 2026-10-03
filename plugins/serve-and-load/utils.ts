import { GadgetDefinition } from "../../dev-utils/models/index.ts";
import { resolveEntrypointFilepath } from "../../dev-utils/lib-utils.ts";
import {
  generateGadgetImplementationLoadConditionsWrapperCode,
  createGadgetResourceLoaderId,
  getStaticUrlToFile,
} from "../../dev-utils/serve-utils.ts";
import { checkGadgetExists } from "../../dev-utils/build-orchestration.ts";
import type { PluginContext } from "rolldown";
import { transform } from "oxc-transform";

/**
 * Generates an `mw.loader.impl` implementation that executes code and applies stylesheets
 * by lazy loading.
 *
 * @param gadget
 * @deprecated
 */
async function createRolledUpGadgetImplementationByLazyLoading(
  gadget: GadgetDefinition,
): Promise<string[]> {
  const { section, name } = gadget;

  const isMwInterfaceCode = section === "mediawiki";
  if (!isMwInterfaceCode && !checkGadgetExists(section, name)) {
    throw new Error(`Cannot resolve gadget ${section}/${name}`);
  }

  const scriptsToLoad =
    gadget.getScripts().map((script) => {
      const scriptUrl = getStaticUrlToFile(script, {
        gadgetSubdir: name,
        isMediawikiInterfaceCode: isMwInterfaceCode,
      }).replaceAll(/"/g, '\\"');
      return `loadLazily("${scriptUrl}");`;
    }) || [];

  const stylesToLoad =
    gadget.getStylesheets().map((style) => {
      const styleUrl = getStaticUrlToFile(style, {
        gadgetSubdir: name,
        isMediawikiInterfaceCode: isMwInterfaceCode,
      }).replaceAll(/"/g, '\\"');
      return `"${styleUrl}"`;
    }) || [];

  const codeBlock = [
    `mw.loader.impl(function () {`,
    `return [`,
    `"${createGadgetResourceLoaderId(name)}",`,
    `function() {`,
    ...scriptsToLoad,
    `}, `,
    `{"url": {"all": [${stylesToLoad.join(",")}] }},`,
    // `{}, {}, null`,
    `];`,
    `});`,
  ];

  const [rsCondHead, rsCondTail] = generateGadgetImplementationLoadConditionsWrapperCode(gadget);
  return [`(function (mw) {`, ...rsCondHead, ...codeBlock, ...rsCondTail, `})(mediaWiki);`];
}

/**
 * Builds the entrypoint file (`load.js`) to be served by the Vite server and to be
 * loaded on the MediaWiki client.
 *
 * @param gadgetsToBuild
 * @param mediawikiInterfaceCodeToBuild
 * @param useRolledUpImplementation     If set to true, then `load.js` will load the gadget-impl.js files.
 *                                      Otherwise, it will lazily load and execute the individual scripts and stylesheets.
 * @returns
 * @deprecated
 */
export async function serveGadgets(
  context: PluginContext,
  gadgetsToBuild: GadgetDefinition[],
  mediawikiInterfaceCodeToBuild: GadgetDefinition[],
  useRolledUpImplementation: boolean,
): Promise<void> {
  const entrypointFile = resolveEntrypointFilepath();
  let sb: string[] = [];
  if (useRolledUpImplementation) {
    const writeScriptLoadingStatement = (gadget: GadgetDefinition) => {
      sb.push(
        `mw.loader.load("${getStaticUrlToFile("gadget-impl.js", {
          gadgetSubdir: gadget.name,
          isMediawikiInterfaceCode: gadget.section === "mediawiki",
        })}");`,
      );
    };
    if (mediawikiInterfaceCodeToBuild.length > 0) {
      writeScriptLoadingStatement(mediawikiInterfaceCodeToBuild[0]);
    }
    gadgetsToBuild.forEach(writeScriptLoadingStatement);
  } else {
    // Async generator implementation
    async function* createGadgetImplementations() {
      for (const mwInterfaceCode of mediawikiInterfaceCodeToBuild) {
        yield await createRolledUpGadgetImplementationByLazyLoading(mwInterfaceCode);
      }
      for (const gadget of gadgetsToBuild) {
        yield await createRolledUpGadgetImplementationByLazyLoading(gadget);
      }
    }
    // should be ES5-compliant
    sb.push(
      `{\n\nfunction loadLazily (scriptUrl) {\n\tfetch(scriptUrl)\n\t\t.then(function (res) { return res.text(); })\n\t\t.then(function (contents) { $.globalEval("(function () {" + contents + "})()"); })\n\t\t.catch(console.error);\n}\n\n`,
    );
    for await (const gadgetImplementation of createGadgetImplementations()) {
      sb.push(...gadgetImplementation);
    }
    sb.push(`}`);
  }
  const transformResults = await transform(entrypointFile, sb.join("\n"), { lang: "js" });
  context.fs.writeFile(entrypointFile, transformResults.code, { encoding: "utf8", flag: "w" });
}