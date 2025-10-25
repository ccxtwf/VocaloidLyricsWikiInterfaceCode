import { writeWikitextFile } from '../dev-utils/generate-gadgets-definition-wikitext.js';
import { PluginOption } from 'vite';
import type { GadgetsDefinition } from '../dev-utils/types.js';

/**
 * A Vite plugin that automatically generates the contents of MediaWiki:Gadgets-definition 
 * The contents are saved onto dist/gadgets/gadgets-definition.wikitext
 * 
 * @returns PluginOption
 */
export default function generateGadgetsDefinitionWikitext(
  gadgetsDefinition: GadgetsDefinition
): PluginOption {
  
  return {
    name: 'generate-gadgets-definition-wikitext',
    enforce: 'post', // Enforce after Vite build plugins
    apply: 'build',

    // Build Mode
    closeBundle() {
      console.log('\nCreating dist/gadgets/gadgets-definition.wikitext\n');
      writeWikitextFile(gadgetsDefinition);
    },
  }
}