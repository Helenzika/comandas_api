import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'https://localhost:8443',
          changeOrigin: true,
          secure: env.VITE_PROXY_SECURE === 'true',
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})