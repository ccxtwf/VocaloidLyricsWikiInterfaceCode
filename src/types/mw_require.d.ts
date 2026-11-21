type ModuleMap = {
  vue: Omit<typeof import("vue"), "createApp"> & { createMwApp: typeof import("vue").createApp };
  pinia: typeof import("./pinia.d.ts");
  "@wikimedia/codex": typeof import("@wikimedia/codex/dist/types/lib.d.ts");

  /**
   * When compiling Codex Icons into your gadget using the `codexIcons=` option:
   * You can use `require("./icons.json")` to destructure your compiled icons
   */
  "./icons.json": typeof import("@wikimedia/codex-icons");

  /**
   * Import other local files from your compiled package (when using `|package` in
   * your gadget definition)
   */
  [customModule: string]: any;
};

/**
 * Placeholder name for `mw.loader.require` (separate from CommonJS `require`)
 */
declare function mw_require<K extends keyof ModuleMap>(moduleName: K): ModuleMap[K];