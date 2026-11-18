import { ResourceLoaderConditions } from "./ResourceLoaderConditions.ts";

/**
 * Basic schema for one gadget
 */
export interface GadgetDefinition {
  /**
   * Purely informational metadata
   */
  description?: string;
  /**
   * Purely informational metadata
   */
  authors?: string[];
  /**
   * Purely informational metadata
   */
  links?: string[];
  /**
   * Purely informational metadata
   */
  version?: string;

  /**
   * Specify this parameter if the module needs other modules on this project to be registered first.
   * The required module just needs to have `state=registered` on `mw.loader`, not `state=ready`
   * @deprecated
   */
  requires?: string[];

  /**
   * List of scripts and stylesheets.
   */
  code?: string[];

  /**
   * The gadget section name is automatically set during the build process
   */
  section: string;

  /**
   * The gadget name is automatically set during the build process
   */
  name: string;

  /**
   * If set to true on the gadgets definition, then tsdown will include this file,
   * regardless of workspace settings
   */
  enabled?: boolean;

  /**
   * If set to true on the gadgets definition, then tsdown will exclude this file
   * from the list of gadgets that will be served/distributed
   */
  disabled?: boolean;

  /**
   * Specify specific loading conditions. Used to emulate MediaWiki's ResourceLoader.
   */
  resourceLoader?: ResourceLoaderConditions;
}