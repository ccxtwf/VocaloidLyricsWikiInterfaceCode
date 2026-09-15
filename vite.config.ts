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
        cssFileName: 'handsontable',
      },
      rolldownOptions: {
        output: {
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