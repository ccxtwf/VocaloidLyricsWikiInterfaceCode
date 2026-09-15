import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: './src/handsontable/index.ts',
        formats: ['iife'],
        name: 'Handsontable',
        fileName: () => 'handsontable.js',
      },
      rolldownOptions: {
        input: {
          "handsontable": "src/handsontable/index"
        },
        output: {
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name + ".js";
          },
          assetFileNames: (assetInfo) => {
            // Handle CSS files
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return assetInfo.name;
            }
            return "assets/[name][extname]";
          },
        }
      }
    }
  };
});