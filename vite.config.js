import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import assetManifest from './plugins/assetManifest.js'

// base './' → chạy được ở mọi nơi deploy (GitHub Pages /melbee/, Vercel, Netlify…)
export default defineConfig({
  base: './',
  plugins: [react(), assetManifest()],
})
