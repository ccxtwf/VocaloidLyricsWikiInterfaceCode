declare namespace devspace {
  /**
   * A placeholder function that does nothing.
   * 
   * This is used in place of a `return` statement in the development stage of your userscripts.
   * This is done because traditional Javascript files disallow `return` from being used outside
   * of a function declaration, but we might want to use such a `return` statement in our 
   * MediaWiki userscripts to give our scripts an early exit instead of having to wrap the entire
   * logic inside a function (whether named or anonymous).
   * 
   * MediaWiki userscripts loaded using `mw.loader.impl()` are inherently run inside an IIFE that 
   * restrict the variable and function declarations to the internal workings of each module, 
   * so using a `return` statement outside a function declaration is generally permissible.
   */
  export function exitMediaWiki(): void
}