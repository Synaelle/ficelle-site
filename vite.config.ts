// SPDX-License-Identifier: AGPL-3.0-or-later

import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [svelte()],
  // nginx serves the page at / and everything it loads under /site/, the
  // rest of the address belongs to the sync server
  base: '/site/',
  server: { port: 1430, strictPort: true },
  build: { target: 'es2022' },
  test: { include: ['src/**/*.test.ts'] },
})
