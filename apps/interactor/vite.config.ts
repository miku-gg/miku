import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mikugg/bot-utils', '@mikugg/ui-kit'],
  },
  build: {
    commonjsOptions: {
      include: [/bot-utils/, /ui-kit/, /guidance/, /node_modules/],
    },
  },
})
