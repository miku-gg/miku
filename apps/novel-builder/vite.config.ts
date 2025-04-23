import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import plainText from 'vite-plugin-plain-text';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8586,
  },
  plugins: [react(), plainText([/\/LICENSE$/, '**/*.text', /\.glsl$/])],
  optimizeDeps: {
    include: ['@mikugg/bot-utils', '@mikugg/ui-kit', '@mikugg/guidance'],
  },
  build: {
    commonjsOptions: {
      include: [/core/, /extensions/, /ui-kit/, /bot-utils/, /guidance/, /node_modules/],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      util: 'rollup-plugin-node-polyfills/polyfills/util',
    },
  },
});
