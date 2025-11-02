import { relative } from 'path';
import { normalizePath } from 'vite';
import wrap from 'word-wrap'; 
import { GadgetDefinition } from './types.js';
import { determineFileType } from './utils.js';

export function createBanner(ghUrl: string, ghBranch: string, id: string, gadgetDefinition?: GadgetDefinition): string {
  const fileType = determineFileType(id);
  let tag = '';
  switch (fileType) {
    case 'script':
      tag = '[[Category:Scripts]]';
      break;
    case 'style':
      tag = '[[Category:Stylesheets]]';
      break;
  }

  const url = `${ghUrl}/blob/${ghBranch}/${normalizePath(relative(process.cwd(), id))}`;

  const { description = '', authors = [], links = [] } = gadgetDefinition || { description: '', authors: [], links: [] };
  
  return (
`
/*!
 ${'*'.padEnd(80, '*')}
 *\n${wrap(description, { width: 78, indent: ' * ' })}${authors.length > 0 ? `\n * Authors: \n${authors.map(s => ` * - ${s}`).join('\n')}` : ''}${links.length > 0 ? `\n * Links:\n${links.map(s => ` * - ${s}`).join('\n')}` : ''}
 * 
 * This file has been synced with the shared repository on GitHub.
 * Code Repository on GitHub: ${ghUrl}
 * Please do not edit this page directly.
 * 
 * Source code:
 * ${url}
 * 
 * ${tag}
 * 
 * ${'*'.padEnd(78, '*')}*/`
  ).trim() + '\n\n';
}