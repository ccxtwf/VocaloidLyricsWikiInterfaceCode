import { writeWikitextFile } from "./utils.ts";
import type { TsdownPlugin } from "tsdown";
import type { GadgetsDefinition } from "../../dev-utils/models/index.ts";

/**
 * A Rolldown plugin that automatically generates the contents of `MediaWiki:Gadgets-definition`.
 * The contents are saved onto `dist/gadgets/gadgets-definition.wikitext`.
 *
 * @param gadgetsDefinition
 * @returns
 */
export default function generateGadgetsDefinitionWikitext(
  gadgetsDefinition: GadgetsDefinition,
): TsdownPlugin {
  return {
    name: "generate-gadgets-definition-wikitext",

    async closeBundle() {
      await writeWikitextFile(this, gadgetsDefinition);
    },
  };
}