import { zaloIsPlaceholder } from './config/brand.js'
import { mount } from './Site.jsx'

if (import.meta.env.DEV && zaloIsPlaceholder) {
  console.info('[MelBee] Link Zalo đang là placeholder — thay trong src/config/brand.js')
}

// Mọi trang (index.html ở /, /san-pham/, /hop-qua/…) đều vào đây; Site.jsx chọn trang theo đường dẫn.
// Tiêu đề tab ngắn đặt trong lib/router.js; <title> + og:title trong từng index.html giữ câu đầy đủ cho Google, mạng xã hội.
mount()
