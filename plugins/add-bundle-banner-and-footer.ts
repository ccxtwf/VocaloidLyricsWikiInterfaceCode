import { relative } from 'path';
import { PluginOption, normalizePath } from 'vite';

export default function addBundleBannerAndFooter(ghUrl: string, ghBranch: string): PluginOption {
  const createBanner = (id: string): string => {
    return `/*!\n * Source code: ${ghUrl}/blob/${ghBranch}/${normalizePath(relative(process.cwd(), id))}\n */`;
  }

  const createFooter = (id: string): string => {
    const extension = id.match(/\.[a-zA-Z0-9]+$/);
    if (extension === null) return '';
    switch (extension[0]) {
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
    // enforce: 'post',
    apply: 'build',
    
    transform(src, id) {
      return {
        code: `${createBanner(id)}\n\n${src}\n${createFooter(id)}`
      }
    },
  }
}