import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import {BootstrapVueNextResolver} from 'bootstrap-vue-next/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [BootstrapVueNextResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  
  server: {
    host: '0.0.0.0',  // Listen on all interfaces (for Docker)
    port: 5173,
    strictPort: true,  // Fail if port is already in use
    
    // HMR configuration
    hmr: {
      host: 'localhost',
      protocol: 'wss',  // Secure WebSocket (since we use HTTPS)
      port: 443,
    },
    
    // No proxy needed - Nginx handles it
  }
  
  
})
