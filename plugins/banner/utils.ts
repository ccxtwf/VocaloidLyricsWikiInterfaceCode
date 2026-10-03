import { relative, resolve } from "path";
import normalizePath from "normalize-path";
import wrap from "word-wrap";
import type { GadgetDefinition, GadgetsDefinition } from "../../dev-utils/models/index.ts";
import { getFileType } from "../../dev-utils/lib-utils.ts";

let ghUrl: string;
let ghBranch: string;

/**
 * Creates a piece of text to be added to bundled JS & CSS files
 *
 * @param url URL to Git Repository
 * @param branch name of Git branch
 * @returns
 */
export function setGhEntrypoint(url: string, branch: string) {
  ghUrl = url;
  ghBranch = branch;
}

/**
 * Get the root directory of this project
 *
 * @returns
 */
function getProjectRootDirectory(): string {
  return resolve(import.meta.dirname, "../../");
}

/**
 * Creates a piece of text to be added to bundled JS & CSS files
 *
 * @param id id of bundle input
 * @param gadgetDefinition defines gadget metadata
 * @returns
 */
function generateBannerString({
  id,
  gadgetDefinition,
}: {
  id: string;
  gadgetDefinition?: GadgetDefinition | null;
}): string {
  const fileType = getFileType(id);
  let tag = "";
  switch (fileType) {
    case "script":
      tag = "[[Category:Scripts]]";
      break;
    case "style":
      tag = "[[Category:Stylesheets]]";
      break;
  }

  const url = `${ghUrl}/blob/${ghBranch}/${normalizePath(id)}`;

  const {
    description = "",
    authors = [],
    links = [],
  } = gadgetDefinition ?? { description: "", authors: [], links: [] };

  return `
/*${"*".padEnd(80, "*")}
 *\n${wrap(description, { width: 78, indent: " * " })}${authors.length > 0 ? `\n * Authors: \n${authors.map((s) => ` * - ${s}`).join("\n")}` : ""}${links.length > 0 ? `\n * Links:\n${links.map((s) => ` * - ${s}`).join("\n")}` : ""}
 *
 * This file has been synced with the shared repository on GitHub.
 * GitHub Repository: ${ghUrl}
 * Please do not edit this page directly.
 *
 * Source code:
 * ${url}
 *
 * ${tag}
 *
 *${"*".padEnd(78, "*")}*/`.trim();
}

/**
 * Resolve the object keys belonging to the gadget in the shared GadgetsDefinition object
 *
 * @param id id of bundle input/output
 * @param fromBundleInput Set to `true` if the given id is the bundle input
 * @returns
 */
function getGadgetName(id: string, fromBundleInput: boolean): string | null {
  const rx = fromBundleInput
    ? /gadgets\/(?:[^/]+)\/([^/]+)\/([^/]+).*$/
    : /gadgets\/([^/]+)\/([^/]+).*$/;
  const m = id.match(rx);
  if (m === null) {
    return null;
  }
  const [_, gadgetName, _filename] = m;
  return gadgetName;
}

/**
 * Creates a callable that is injected into `build.rollupOptions.output` in vite.config.ts.
 *
 * @param gadgetsDefinition
 * @returns
 */
export function generateScriptBanner(
  bundleEntry: Record<string, string>,
  gadgetsDefinition: GadgetsDefinition,
) {
  return ({ fileName: bundleOutputFilepath }: { fileName: string }): string => {
    if (getFileType(bundleOutputFilepath) !== "script") {
      return "";
    }
    const bundleInputFilepath = bundleEntry[bundleOutputFilepath];
    if (!bundleInputFilepath) {
      throw new Error(`Corresponding input for ${bundleOutputFilepath} not found`);
    }
    const gadgetName = getGadgetName(bundleOutputFilepath, false);
    const gadgetDefinition = gadgetsDefinition.getGadgetByName(gadgetName);
    const id = normalizePath(relative(getProjectRootDirectory(), bundleInputFilepath));
    const bannerString = generateBannerString({ id, gadgetDefinition });
    return bannerString;
  };
}

/**
 * Creates a callable that is injected into a custom Vite plugin that is responsible
 * for adding the auto-generated banners to bundled CSS files.
 *
 * @param src
 * @param id
 * @param gadgetsDefinition
 * @returns
 */
export function generateStylesheetBanner(
  src: string,
  bundleInputId: string,
  gadgetsDefinition: GadgetsDefinition,
) {
  const id = normalizePath(relative(getProjectRootDirectory(), bundleInputId));
  const gadgetName = getGadgetName(id, true);
  const gadgetDefinition = gadgetsDefinition.getGadgetByName(gadgetName);
  return `${generateBannerString({ id, gadgetDefinition })}\n${src}`;
}