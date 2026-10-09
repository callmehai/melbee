/**
 * Service worker MelBee — giữ lại file đã tải để lần sau không phải hỏi máy chủ (GitHub Pages chỉ cho
 * trình duyệt nhớ 10 phút, mạng Việt Nam → Singapore mỗi lần hỏi mất 0,3–2 giây).
 *
 * - JS / CSS / font có mã băm trong tên (main-CXXEH3G6.js…): không bao giờ đổi → lấy từ bộ nhớ, không hỏi lại.
 * - Ảnh, âm thanh, icon: hiện bản đã lưu ngay, đồng thời tải bản mới ở nền cho lần sau (ảnh thật thay ảnh cũ
 *   cùng tên thì lần xem kế tiếp sẽ thấy).
 * - Trang HTML: luôn hỏi máy chủ (bỏ qua bộ nhớ 10 phút) để thấy bản mới nhất; mất mạng thì dùng bản đã lưu.
 * - Nhạc phát dạng stream (yêu cầu Range) để trình duyệt tự lo.
 */
const VERSION = 'v2'
const STATIC = `melbee-static-${VERSION}`
const MEDIA = `melbee-media-${VERSION}`
const PAGES = `melbee-pages-${VERSION}`
const KEEP = new Set([STATIC, MEDIA, PAGES])

const HASHED = /\/assets\/[^/]+-[\w-]{8}\.(?:js|css|woff2?)$/
const MEDIA_FILE = /\.(?:jpe?g|png|webp|avif|svg|gif|mp3|ogg|m4a|ico)$/

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k.startsWith('melbee-') && !KEEP.has(k)) await caches.delete(k)
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || req.headers.has('range')) return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  if (HASHED.test(url.pathname)) e.respondWith(cacheFirst(req))
  else if (MEDIA_FILE.test(url.pathname)) e.respondWith(staleWhileRevalidate(req, e))
  else if (req.mode === 'navigate') e.respondWith(networkFirst(req))
})

async function cacheFirst(req) {
  const cache = await caches.open(STATIC)
  const hit = await cache.match(req)
  if (hit) return hit
  const res = await fetch(req)
  if (res.ok) {
    await cache.put(req, res.clone())
    trim(cache, 200)
  }
  return res
}

async function staleWhileRevalidate(req, e) {
  const cache = await caches.open(MEDIA)
  const hit = await cache.match(req)
  const fresh = fetch(req)
    .then((res) => {
      if (res.ok && res.status === 200) return cache.put(req, res.clone()).then(() => res)
      return res
    })
    .catch(() => hit)
  if (hit) {
    e.waitUntil(fresh)
    return hit
  }
  return fresh
}

async function networkFirst(req) {
  const cache = await caches.open(PAGES)
  try {
    // no-cache: luôn hỏi lại máy chủ (304 nếu chưa đổi) — HTML cũ trỏ tới JS của lần deploy trước, mà
    // GitHub Pages đã xoá các file đó → trang trắng
    const res = await fetch(req, { cache: 'no-cache' })
    if (res.ok) cache.put(req, res.clone())
    return res
  } catch (err) {
    const hit = await cache.match(req)
    if (hit) return hit
    throw err
  }
}

/** Bỏ bớt bản cũ (mỗi lần deploy JS/CSS đổi tên) — giữ tối đa `max` file. */
async function trim(cache, max) {
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i])
}
