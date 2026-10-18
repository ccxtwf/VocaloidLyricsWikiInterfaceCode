$(function () {
  // On pages like Special:ExpandTemplates
  if (mw.config.get("cmRLModules")) {
    mw.loader.load("ext.gadget.dark-mode-other-skins-editing");
  }
});