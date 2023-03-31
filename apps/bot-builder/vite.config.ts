import { fileURLToPath, URL } from 'url'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import plainText from 'vite-plugin-plain-text';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8586,
  },
  plugins: [
    react(),
    plainText([/\/LICENSE$/, '**/*.text', /\.glsl$/]),
  ],
  define: {
    'setImmediate': 'setTimeout.bind(null)',
  },
  optimizeDeps: {
    include: ["@mikugg/core", "@mikugg/extensions"],
  },
  build: {
    commonjsOptions: {
      include: [/core/, /extensions/, /node_modules/],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      util: 'rollup-plugin-node-polyfills/polyfills/util'
    }
  }
});
