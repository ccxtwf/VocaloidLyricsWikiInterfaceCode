import { relative } from 'path';
import { normalizePath } from 'vite';

export function determineFileType(id: string): "script" | "style" | "other" {
  let extension: RegExpMatchArray | null | string = id.match(/\.[a-zA-Z0-9]+$/);
  if (extension !== null) {
    extension = extension[0].toLowerCase();
    switch (extension) {
      case '.js':
      case '.ts':
        return "script";
      case '.css':
      case '.less':
        return "style";
    }
  }
  return "other";
}

export function createBanner(ghUrl: string, ghBranch: string, id: string): string {
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
  
  return `/*!\n ${'*'.padEnd(80, '*')}\n *\n * This file has been synced with the shared repository on GitHub.\n * Please do not edit this page directly.\n * \n * Source code:\n * ${ghUrl}/blob/${ghBranch}/${normalizePath(relative(process.cwd(), id))}\n *\n * ${tag}\n ${'*'.padEnd(78, '*')}*/\n\n`;
}