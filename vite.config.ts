import autogenerateEntrypoint from './plugins/autogenerate-entrypoint';
import { readGadgetsDefinition, getGadgetsToBuild, buildGadgets } from './dev-utils/build-orchestration';
import { ConfigEnv, defineConfig, UserConfig, UserConfigFnObject } from 'vite';

// async function listGadgetDirectories({ devMode = true }) {
//   const gadgetsDefinition = await readGadgetsDefinition();
//   const gadgetsToBuild = await getGadgetsToBuild({ devMode });
// }

export default defineConfig(({ mode }: ConfigEnv): UserConfig => ({
  plugins: [
    autogenerateEntrypoint(mode),
  ],
  // build: {
  //   rollupOptions: {
  //     input: getGadgetEntries(),
  //     output: {
  //       // Preserve the directory structure
  //       entryFileNames: (chunkInfo) => {
  //         return chunkInfo.name + '.js'
  //       },
  //       assetFileNames: (assetInfo) => {
  //         // Handle CSS files
  //         if (assetInfo.name && assetInfo.name.endsWith('.css')) {
  //           return assetInfo.name
  //         }
  //         return 'assets/[name][extname]'
  //       }
  //     }
  //   },
  //   outDir: 'dist/gadgets',
  //   emptyOutDir: true
  // },
  // css: {
  //   preprocessorOptions: {
  //     less: {
  //       // Add any Less-specific options here
  //     }
  //   }
  // },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".yaml": "text",
        ".yml": "text"
      }
    }
  }
}));