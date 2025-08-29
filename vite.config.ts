import autogenerateEntrypoint from './plugins/autogenerate-entrypoint.js';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { 
  readGadgetsDefinition, 
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
  if (mode === 'development') { 
    setViteServerOrigin(env.VITE_SERVER_DEV_ORIGIN || 'http://localhost:5173'); 
  } else {
    setDistEntrypoint(env.DIST_PROD_ENTRYPOINT || 'https://localhost:5173');
  }

  const gadgetsDefinition = await readGadgetsDefinition();
  const [bundleInputs, bundleAssets] = mapGadgetSourceFiles(gadgetsDefinition);

  return {
    plugins: [
      autogenerateEntrypoint(mode, env),
      viteStaticCopy({
        targets: bundleAssets,
        structured: false,
      }),
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