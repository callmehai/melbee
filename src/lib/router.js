import { honeys } from '../data/catalog.js'
import { SITE_ROOT } from './site.js'

/**
 * Bản đồ đường dẫn → trang. Mỗi trang vẫn có file index.html riêng (vào thẳng link, mã QR, Google),
 * nhưng bấm link trong web thì đổi trang ngay tại chỗ (src/Site.jsx) — nhạc nền phát liền mạch.
 *
 *   ''                    trang chủ
 *   'san-pham/'           danh sách mật (đích mã QR in trên hộp)
 *   'san-pham/<loại>/'    chi tiết một loại mật
 *   'hop-qua/' · 'cau-chuyen/' · 'lien-he/'
 */
const PAGES = { 'san-pham/': 'products', 'hop-qua/': 'gift', 'cau-chuyen/': 'story', 'lien-he/': 'contact' }

const TITLES = {
  home: 'MelBee · Mật ong Tây Bắc',
  products: 'Sản phẩm · MelBee Mật ong Tây Bắc',
  gift: 'Hộp quà · MelBee Mật ong Tây Bắc',
  story: 'Câu chuyện · MelBee Mật ong Tây Bắc',
  contact: 'Liên hệ · MelBee Mật ong Tây Bắc',
}

/** URL → { page, honey? } — không phải trang của web (ảnh, file, trang ngoài) → null. */
export function routeFor(href) {
  const url = new URL(href, window.location.href)
  const root = new URL(SITE_ROOT)
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) return null
  let path = url.pathname.slice(root.pathname.length).replace(/index\.html$/, '')
  if (path && !path.endsWith('/')) path += '/'
  if (path === '') return { page: 'home' }
  if (PAGES[path]) return { page: PAGES[path] }
  const m = path.match(/^san-pham\/([^/]+)\/$/)
  if (m && honeys.some((h) => h.id === m[1])) return { page: 'honey', honey: m[1] }
  return null
}

export function titleFor(route) {
  if (route.page === 'honey') return `${honeys.find((h) => h.id === route.honey)?.name || 'Mật ong'} · MelBee`
  return TITLES[route.page] || TITLES.home
}
