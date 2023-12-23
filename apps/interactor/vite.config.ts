import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mikugg/bot-utils', '@mikugg/guidance'],
  },
  build: {
    commonjsOptions: {
      include: [/core/, /extensions/, /bot-utils/, /guidance/, /node_modules/],
    },
  },
})
