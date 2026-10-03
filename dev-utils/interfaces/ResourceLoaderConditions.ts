/**
 * Refer to https://www.mediawiki.org/wiki/Extension:Gadgets#Options
 * for more information on what these parameters mean
 */
export interface ResourceLoaderConditions {
  default?: boolean;
  hidden?: boolean;

  dependencies?: string | string[] | null;
  rights?: string | string[] | null;
  skins?: string | string[] | null;
  actions?: string | string[] | null;
  categories?: string | string[] | null;
  namespaces?: string | string[] | null;
  contentModels?: string | string[] | null;

  type?: "styles" | "general" | null;
  supportsUrlLoad?: string;
}