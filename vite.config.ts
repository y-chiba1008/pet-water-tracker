import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // supabase/config.toml の site_url と揃える（OAuth リダイレクト用）
    port: 3000,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
