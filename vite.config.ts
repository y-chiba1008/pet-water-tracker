import { readFileSync } from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const { version: appVersion } = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, 'package.json'), 'utf-8'),
) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
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
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/features/**/domain/**',
        'src/features/**/lib/**',
        'src/shared/lib/**',
      ],
      exclude: [
        'src/shared/lib/supabaseClient.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
      reporter: ['text', 'text-summary'],
      thresholds: {
        // 計測対象（domain / lib）の lines 100%。branches / functions は必須としない
        lines: 100,
      },
    },
  },
})
