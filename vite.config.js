import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cmsPersistPlugin } from './vite.cms.js'
import { writeSeoFiles } from './scripts/seo-files.js'

function seoPagesPlugin() {
  return {
    name: 'seo-pages',
    closeBundle() {
      writeSeoFiles(path.resolve('dist'))
    },
  }
}

export default defineConfig({
  plugins: [cmsPersistPlugin(), react(), tailwindcss(), seoPagesPlugin()],
})
