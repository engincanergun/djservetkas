import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cmsPersistPlugin } from './vite.cms.js'

function spaFallback() {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const index = path.resolve('dist/index.html')
      if (fs.existsSync(index)) fs.copyFileSync(index, path.resolve('dist/404.html'))
    },
  }
}

export default defineConfig({
  plugins: [cmsPersistPlugin(), react(), tailwindcss(), spaFallback()],
})
