import autogenerateEntrypoint from './plugins/autogenerate-entrypoint.js';
import generateCssBanner from './plugins/generate-css-banner.js';
import generateGadgetsDefinitionWikitext from './plugins/generate-gadgets-definition-wikitext.js';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { 
  readGadgetsDefinition, 
  getGadgetsToBuild,
  getMediaWikiInterfaceCodeToBuild,
  mapWikicodeSourceFiles, 
  setViteServerOrigin
} from './dev-utils/build-orchestration.js';
import { createBanner } from './dev-utils/generate-banner.js';
import { 
  ConfigEnv, 
  defineConfig, 
  UserConfig, 
  loadEnv
} from 'vite';

export default defineConfig(async ({ mode }: ConfigEnv): Promise<UserConfig> => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const isOnBuildWatch = mode === 'watch-build';
  if (isDev) { 
    setViteServerOrigin(env.VITE_SERVER_DEV_ORIGIN || 'http://localhost:5173'); 
  } else {
    setViteServerOrigin(env.VITE_SERVER_PREVIEW_ORIGIN || 'http://localhost:4173');
  }
  const gadgetsDefinition = await readGadgetsDefinition();
  const gadgetsToBuild = getGadgetsToBuild(gadgetsDefinition);
  const mwInterfaceCodeToBuild = await getMediaWikiInterfaceCodeToBuild();
  const [bundleInputs, bundleAssets] = mapWikicodeSourceFiles(gadgetsToBuild, mwInterfaceCodeToBuild);

  return {
    plugins: [
      // On Vite Build, watches changes made to files in gadgets/ subdirectory
      // and generate the load.js entrypoint file 
      autogenerateEntrypoint(gadgetsToBuild, mwInterfaceCodeToBuild),

      // On Vite Build, generate the contents of MediaWiki:Gadgets-definition
      generateGadgetsDefinitionWikitext(gadgetsDefinition),
      
      // On Vite Build, copy the i18n.json files to dist/
      viteStaticCopy({
        targets: bundleAssets,
        structured: false,
      }),

      // On Vite Build, automatically add banner to each CSS file
      generateCssBanner(
        env.VITE_GITHUB_REPOSITORY_URL, 
        env.VITE_GITHUB_REPOSITORY_BRANCH
      )
    ],
    build: {
      target: 'es6',
      minify: false,
      cssMinify: false,
      rollupOptions: {
        input: bundleInputs,
        output: {
          // Preserve the directory structure
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name + '.js';
          },
          assetFileNames: (assetInfo) => {
            // Handle CSS files
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return assetInfo.name;
            }
            return 'assets/[name][extname]';
          },
          banner: (chunk): string => {
            return createBanner(
              env.VITE_GITHUB_REPOSITORY_URL, 
              env.VITE_GITHUB_REPOSITORY_BRANCH,
              chunk.facadeModuleId || chunk.moduleIds[0]!
            )
          }
        },
      },
      outDir: 'dist',
      emptyOutDir: true,
      watch: isOnBuildWatch ? {
        clearScreen: true,
        exclude: [
          'node_modules/**',
          'dist/**',
          'load.js'
        ]
      } : null
    },
    css: {
      preprocessorOptions: {
        less: {
          // Add any Less-specific options here
        }
      },
    },
    esbuild: {
      // Preserve banner & footer
      legalComments: 'inline',
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".yaml": "text",
          ".yml": "text"
        }
      }
    },
    preview: {
      open: '/load.js'
    }
  }
});