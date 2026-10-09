import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import assetManifest from './plugins/assetManifest.js'

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

/**
 * Script trang chặn hiển thị cho tới khi chạy xong (blocking="render"): trang được dựng đồng bộ (flushSync)
 * nên khung hình đầu tiên đã đủ nội dung → chuyển trang bằng View Transitions không chớp trắng.
 * Vite viết lại thẻ script lúc build và bỏ thuộc tính này, nên gắn lại ở đây.
 */
const renderBlocking = () => ({
  name: 'render-blocking-entry',
  enforce: 'post',
  transformIndexHtml: (html) => html.replace(/<script type="module" (?!blocking)/g, '<script type="module" blocking="render" '),
})

// base './' → chạy được ở mọi nơi deploy (GitHub Pages /melbee/, tên miền riêng, Vercel, Netlify…)
export default defineConfig({
  base: './',
  plugins: [react(), assetManifest(), renderBlocking()],
  build: {
    // three.js (~150KB gzip) nằm ở chunk riêng, tải lazy sau khi trang hiện xong
    chunkSizeWarningLimit: 700,
    // ⚠️ /san-pham/ là đích của mã QR in trên hộp quà — không đổi tên thư mục san-pham/
    rollupOptions: { input: Object.fromEntries(pages()) },
  },
})
