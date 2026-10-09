import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import assetManifest from './plugins/assetManifest.js'

const page = (p) => fileURLToPath(new URL(p, import.meta.url))

// base './' → chạy được ở mọi nơi deploy (GitHub Pages /melbee/, tên miền riêng, Vercel, Netlify…)
export default defineConfig({
  base: './',
  plugins: [react(), assetManifest()],
  build: {
    // three.js (~150KB gzip) nằm ở chunk riêng, tải lazy sau khi trang hiện xong
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: {
        main: page('./index.html'),
        // /san-pham/ — đích của mã QR in trên hộp quà, KHÔNG đổi đường dẫn này
        sanPham: page('./san-pham/index.html'),
      },
    },
  },
})
