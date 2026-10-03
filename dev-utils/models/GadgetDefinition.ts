import type { GadgetDefinition as IGadgetDefinition } from "../interfaces/GadgetDefinition.ts";
import type { ResourceLoaderConditions } from "../interfaces/ResourceLoaderConditions.ts";
import { getFileType } from "../lib-utils.ts";

export default class GadgetDefinition implements IGadgetDefinition {
  description?: string;
  authors?: string[];
  links?: string[];
  version?: string;
  requires?: string[];
  code?: string[];
  i18n?: string[];
  section: string;
  name: string;
  disabled?: boolean;
  resourceLoader?: ResourceLoaderConditions;

  constructor(
    defs: Omit<IGadgetDefinition, "section" | "name">,
    gadgetSection: string,
    gadgetName: string,
  ) {
    this.section = gadgetSection;
    this.name = gadgetName;
    Object.assign(this, defs);
  }

  /**
   * Get gadget ID
   */
  getGadgetId() {
    return `${this.section}/${this.name}`;
  }

  /**
   * Get the JS scripts to load for each gadget
   */
  getScripts() {
    return this.code?.filter((code) => getFileType(code) === "script") || [];
  }

  /**
   * Get the CSS stylesheets to load for each gadget
   */
  getStylesheets() {
    return this.code?.filter((code) => getFileType(code) === "style") || [];
  }
}