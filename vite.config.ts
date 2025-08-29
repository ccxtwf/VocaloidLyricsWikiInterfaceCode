import autogenerateEntrypoint from './plugins/autogenerate-entrypoint.js';
import createMwGadgetImplementation from './plugins/create-mw-gadget-implementation.js';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { 
  readGadgetsDefinition, 
  getGadgetsToBuild,
  mapGadgetSourceFiles, 
  setViteServerOrigin, 
  setDistEntrypoint 
} from './dev-utils/build-orchestration.js';
import { 
  ConfigEnv, 
  defineConfig, 
  UserConfig, 
  loadEnv
} from 'vite';

export default defineConfig(async ({ mode }: ConfigEnv): Promise<UserConfig> => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  if (isDev) { 
    setViteServerOrigin(env.VITE_SERVER_DEV_ORIGIN || 'http://localhost:5173'); 
  } else {
    setDistEntrypoint(env.DIST_PROD_ENTRYPOINT || 'https://localhost:5173');
  }

  const gadgetsDefinition = await readGadgetsDefinition();
  const gadgetsToBuild = getGadgetsToBuild(gadgetsDefinition);
  const [bundleInputs, bundleAssets] = mapGadgetSourceFiles(gadgetsToBuild);

  return {
    plugins: [
      autogenerateEntrypoint(gadgetsToBuild),
      viteStaticCopy({
        targets: bundleAssets,
        structured: false,
      }),
      createMwGadgetImplementation(gadgetsToBuild),
    ],
    build: {
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
          }
        }
      },
      outDir: 'dist',
      emptyOutDir: true
    },
    css: {
      preprocessorOptions: {
        less: {
          // Add any Less-specific options here
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".yaml": "text",
          ".yml": "text"
        }
      }
    }
  }
});