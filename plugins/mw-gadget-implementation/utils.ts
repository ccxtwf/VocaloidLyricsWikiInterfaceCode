import { transform } from "oxc-transform";
import type { OutputBundle } from "rolldown";

import { GadgetDefinition } from "../../dev-utils/models/index.ts";
import { checkGadgetExists } from "../../dev-utils/build-orchestration.ts";
import { resolveFileExtension } from "../../dev-utils/lib-utils.ts";
import {
  generateGadgetImplementationLoadConditionsWrapperCode,
  createGadgetResourceLoaderId,
} from "../../dev-utils/serve-utils.ts";

/**
 * Creates an `mw.loader.impl` implementation with direct execution of each script and stylesheet.
 *
 * @param gadgetImplementationFilePath
 * @param writeBundle
 * @param gadget
 * @param minify
 * @returns
 */
export async function createRolledUpGadgetImplementation(
  gadgetImplementationFilePath: string,
  writeBundle: OutputBundle,
  gadget: GadgetDefinition,
  minify: boolean,
): Promise<string> {
  const { section, name } = gadget;

  if (!checkGadgetExists(section, name)) {
    throw new Error(`Cannot resolve gadget ${section}/${name}`);
  }

  const [rsCondHead, rsCondTail] = generateGadgetImplementationLoadConditionsWrapperCode(gadget);

  const body = [
    `mw.loader.impl(function () {`,
    `return [`,
    `"${createGadgetResourceLoaderId(name)}",`,
    `function ($, jQuery, require, module) {`,
  ];

  const scripts = gadget.getScripts();
  const styles = gadget.getStylesheets();

  if (scripts.length > 0) {
    scripts.forEach((script) => {
      const moduleInfo = writeBundle[`gadgets/${name}/${resolveFileExtension(script)}`];
      if (moduleInfo.type === "chunk") body.push(moduleInfo.code);
    });
  }

  body.push(`}, {"css": [`);

  if (styles.length > 0) {
    styles.forEach((style) => {
      const assetInfo = writeBundle[`gadgets/${name}/${resolveFileExtension(style)}`];
      if (assetInfo.type === "asset") {
        body.push(minify ? `"` : `\``);
        (() => {
          let src = assetInfo.source;
          if (src instanceof Uint8Array) {
            src = new TextDecoder().decode(src);
          }
          src = src.trim().replaceAll(minify ? /(")/g : /(`)/g, "\\$1");
          body.push(src);
        })();
        body.push(minify ? `"` : `\``);
        body.push(", ");
      }
    });
  }

  // body.push(`]}, {}, {}, null];`);
  body.push(`});`);

  return (
    await transform(
      [`(function (mw) {`, ...rsCondHead, ...body, ...rsCondTail, `})(mediaWiki);`].join(""),
      gadgetImplementationFilePath,
    )
  ).code;
}