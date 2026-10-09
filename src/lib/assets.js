import manifest from 'virtual:asset-manifest'
import { SITE_ROOT } from './site.js'

const files = new Set(manifest)
const isExternal = (p) => /^(https?:|data:|blob:)/i.test(p)
const normalize = (p) => p.replace(/^\.?\//, '')

/** Đổi đường dẫn tính từ public/ thành URL dùng được ở mọi trang, mọi nơi deploy. */
export function asset(path) {
  if (!path) return path
  if (isExternal(path)) return path
  return SITE_ROOT + normalize(path)
}

/** File có thật trong public/ không? (link ngoài luôn coi là có) */
export function hasAsset(path) {
  if (!path) return false
  if (isExternal(path)) return true
  return files.has(normalize(path))
}
