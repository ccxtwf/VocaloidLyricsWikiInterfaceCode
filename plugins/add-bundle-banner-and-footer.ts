import { relative } from 'path';
import { PluginOption, normalizePath } from 'vite';

/**
 * A Vite plugin that automatically adds the shared banners & footers to each built JS/CSS bundle 
 * 
 * @returns PluginOption
 */
export default function addBundleBannerAndFooter(ghUrl: string, ghBranch: string): PluginOption {
  const createBanner = (id: string): string => {
    return `/*!\n ${'*'.padEnd(80, '*')}\n *\n * This file has been synced with the shared repository on GitHub.\n * Please do not edit this page directly.\n * \n * Source code:\n * ${ghUrl}/blob/${ghBranch}/${normalizePath(relative(process.cwd(), id))}\n *\n ${'*'.padEnd(78, '*')}*/\n\n`;
  }

  const createFooter = (id: string): string => {
    const extension = id.match(/\.[a-zA-Z0-9]+$/);
    if (extension === null) return '';
    switch (extension[0].toLowerCase()) {
      case '.js':
      case '.ts':
        return '/*! [[Category:Scripts]] */';
      case '.css':
      case '.less':
        return '/*! [[Category:Stylesheets]] */';
      default:
        return '';
    }
  }

  return {
    name: 'add-bundle-banner-and-footer',
    apply: 'build',
    enforce: 'pre',
    
    transform(src: string, id: string) {
      return {
        code: `${createBanner(id)}\n\n${src}\n${createFooter(id)}`,
        map: null
      }
    },
  }
}