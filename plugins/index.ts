import loadEnvironmentPlugin from "./load-env/index.ts";
import bannerPlugin from "./banner/index.ts";
import serveAndLoadGadgetsPlugin from "./serve-and-load/index.ts";
import mwGadgetImplementationPlugin from "./mw-gadget-implementation/index.ts";
import gadgetsDefinitionPlugin from "./gadgets-definition/index.ts";
import vueTransformer from "./vue-transformer/index.ts";
import restrictedNames from "./restricted_names/index.ts";
import duplicatePerEntryPlugin from "./duplicate-per-entry/index.ts";

export {
  loadEnvironmentPlugin,
  bannerPlugin,
  serveAndLoadGadgetsPlugin,
  mwGadgetImplementationPlugin,
  gadgetsDefinitionPlugin,
  vueTransformer,
  restrictedNames,
  duplicatePerEntryPlugin,
};