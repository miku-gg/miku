import { fileURLToPath, URL } from 'url'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import plainText from 'vite-plugin-plain-text';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8587,
  },
  plugins: [
    react(),
    plainText([/\/LICENSE$/, '**/*.text', /\.glsl$/]),
  ],
  define: {
    'setImmediate': 'setTimeout.bind(null)',
  },
  optimizeDeps: {
    include: ["@mikugg/core", "@mikugg/extensions", "@mikugg/bot-utils"],
  },
  build: {
    commonjsOptions: {
      include: [/core/, /extensions/, /bot-utils/, /node_modules/],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      util: 'rollup-plugin-node-polyfills/polyfills/util'
    }
  }
});
