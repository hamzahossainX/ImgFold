import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      /**
       * Use the self-contained UMD bundle of pdf-lib.
       * The ESM build (default) has a broken "./form" import that Rollup cannot resolve.
       */
      'pdf-lib': path.resolve(__dirname, 'node_modules/pdf-lib/dist/pdf-lib.js'),
    },
  },

  optimizeDeps: {
    include: ['pdf-lib'],
  },

  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom'],
          'motion-vendor': ['framer-motion'],
          'dnd-vendor':    ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'pdflib-vendor': ['pdf-lib'],
        },
      },
    },
  },
});
