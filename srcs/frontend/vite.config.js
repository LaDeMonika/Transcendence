import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import {BootstrapVueNextResolver} from 'bootstrap-vue-next/resolvers'
import IconsResolve from 'unplugin-icons/resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolve()],
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
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
    
    hmr: true,
  },

  cacheDir: '.vite',  // Use .vite in the project root for caching
})
