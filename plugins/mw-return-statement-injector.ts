import { PluginOption } from 'vite';
import type { RollupReplaceOptions } from '@rollup/plugin-replace';
import type { Plugin } from 'rollup';

/**
 * A Vite plugin that substitutes the function call `exitMediaWiki()` with `return`.
 * 
 * This plugin processes the bundle in two phases:
 * 
 * In the first phase, the plugin will replace the function call `exitMediaWiki()` with 
 * an intermediary string, to bypass any imports of the `exitMediaWiki` function as well
 * as to bypass the "no `return` statements outside a function declaration" lint check 
 * during the bundle generation stage (i.e. between the `renderStart` and `renderChunk` 
 * hooks of Rollup 
 * (https://rollupjs.org/plugin-development/#output-generation-hooks)).
 * 
 * In the second phase, the plugin will replace the intermediary string added in the 
 * first phase with a simple `return` statement. This is done after the bundle has been 
 * built but before it is written to `dist/`. 
 * 
 * @param rollupReplace The plugin `@rollup/plugin-replace`, resolved at runtime during 
 *                      configuration of the Vite server.
 * @returns
 */
export default function mwReturnStatementInjector(rollupReplace: (options?: RollupReplaceOptions) => Plugin, minify: boolean): [PluginOption, PluginOption] {
  
  /**
   * Look for this string in the generated bundle code
   */
  const exitFunctionCall = 'devspace.exitMediaWiki()';

  /**
   * The criteria of the intermediary string is as follows:
   * 1) The intermediary string should resolve identically as it passes through the 
   *    `renderStart` and `renderChunk` hooks of Rollup
   * 2) The intermediary string should not be an expression that calls upon other 
   *    imports/dependencies.
   * 3) if `minify` is set, then the intermediary string should be a multi-line 
   *    expression to prevent cases where 
   *    `if (some conditional expression) { exitMediaWiki(); }` is minified to 
   *    `(some conditional expression)&&return;`
   * 4) The intermediary string should be unique, or be an expression that is not going to be 
   *    generally used in a MediaWiki userscript. 
   */
  const intermediary = minify ? 
    `/*!\n*\n*/process.exitMW("m3SZ10")` :
    `process.exitMW("m3SZ10")`;

  return [
    { 
      ...rollupReplace({
        [exitFunctionCall]: intermediary,
        preventAssignment: true,
      }),
      name: 'mw-return-statement-injector-pre',
      enforce: 'pre',
    },
    {
      name: 'mw-return-statement-injector-post',
      enforce: 'post',

      generateBundle(_, bundle) {
        Object.keys(bundle).forEach((id) => {
          if (bundle[id].type !== 'chunk') return;
          bundle[id].code = bundle[id].code.replaceAll(intermediary, 'return');
        });
      }
    }
  ];
}