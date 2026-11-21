import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Where `npm run dev` sends /api, /uploads and /sitemap.xml requests.
// Defaults to the local backend; `npm run dev:prod-data` points it at the live API
// so the local frontend can be previewed with real production data.
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:3000'
const proxy = { target: apiTarget, changeOrigin: true, secure: true }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': proxy,
      '/uploads': proxy,
      '/sitemap.xml': {
        ...proxy,
        rewrite: () => '/api/v1/seo/sitemap.xml',
      },
    },
  },
})
