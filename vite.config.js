import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import assetManifest from './plugins/assetManifest.js'
import speed from './plugins/speed.js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const SKIP = new Set(['node_modules', 'dist', 'public', 'src', 'plugins', '.git', '.github'])

/** Mọi index.html trong dự án = một trang: /, /san-pham/, /san-pham/hoa-ban/, /hop-qua/… */
function pages(dir = ROOT) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return SKIP.has(e.name) || e.name.startsWith('.') ? [] : pages(path.join(dir, e.name))
    if (e.name !== 'index.html') return []
    const rel = path.relative(ROOT, dir) || 'main'
    return [[rel.split(path.sep).join('-'), path.join(dir, e.name)]]
  })
}

// base './' → chạy được ở mọi nơi deploy (GitHub Pages /melbee/, tên miền riêng, Vercel, Netlify…)
export default defineConfig({
  base: './',
  plugins: [react(), assetManifest(), speed()],
  build: {
    // three.js (~150KB gzip) nằm ở chunk riêng, tải lazy sau khi trang hiện xong
    chunkSizeWarningLimit: 700,
    // ⚠️ /san-pham/ là đích của mã QR in trên hộp quà — không đổi tên thư mục san-pham/
    rollupOptions: { input: Object.fromEntries(pages()) },
  },
})
