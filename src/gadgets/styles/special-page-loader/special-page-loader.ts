$(function () {
  // On pages like Special:ExpandTemplates
  if (mw.config.get("cmRLModules")) {
    mw.loader.load("ext.gadget.dark-mode-other-skins-editing");
  }

  // When firing DiscussionTools
  mw.hook("ve.newTarget").add((target) => {
    if (target.constructor.static.name === "discussionTools") {
      mw.loader.load("ext.gadget.dark-mode-other-skins-editing");
    }
  });
});