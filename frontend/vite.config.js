import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/ws': {
          target: env.backend_url,
          ws: true,
        },
        '/api': {
          target: env.backend_url,
          changeOrigin: true,
        }
      }
    },
    resolve: {
      alias: {
        'monaco-editor/esm/vs/editor/editor.api.js': 'monaco-editor'
      }
    },
    optimizeDeps: {
      include: ['y-monaco', 'monaco-editor', 'yjs']
    }
  }
})
