/**
 * Written by Claude under the following prompts:
 *   - i have the following files:
 *     ```
 *      └── src/
 *          ├── index1.ts
 *          ├── index2.ts
 *          └── utils/
 *              └── util.ts
 *     ```
 *     index1.ts` and `index2.ts` both reference the same functions from `util.ts`.
 *     How do I get Vite 8 to include the contents of `util.ts` into their individual
 *     chunks without splitting those contents into a shared module?
 *   - can I create a plugin that duplicates these functions instead?
 */
import fs from "node:fs";
import { resolve, relative } from "node:path";
import normalizePath from "normalize-path";
import type { TsdownPlugin } from "tsdown";

const MARKER = "?dup=";

/**
 * A Rolldown plugin that duplicates modules shared across various bundle entrypoints.
 */
export default function duplicatePerEntry(modules: string[]): TsdownPlugin {
  const targets = new Set(modules.map((m) => normalizePath(resolve(m))));

  return {
    name: "duplicate-per-entry",

    async resolveId(source, importer, options) {
      const cleanImporter = importer?.split(MARKER)[0];
      const resolved = await this.resolve(source, cleanImporter ?? importer, {
        ...options,
        skipSelf: true,
      });
      if (!resolved || resolved.external) return resolved;

      if (targets.has(resolved.id)) {
        // Tag with the importer so each entry gets its own copy of the module
        const key = normalizePath(relative(process.cwd(), importer ?? process.cwd()));
        return `${resolved.id}${MARKER}${encodeURIComponent(key)}`;
      }
      return resolved.id;
    },

    load(id) {
      if (!id.includes(MARKER)) {
        return null;
      }
      const [realId] = id.split(MARKER);
      return fs.readFileSync(realId, "utf-8");
    },
  };
}