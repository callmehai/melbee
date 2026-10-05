import { THREE_CONFIG } from '../config.js'

export const QUALITY_LEVELS = ['low', 'medium', 'high']

export const lowerQuality = (q) => QUALITY_LEVELS[Math.max(0, QUALITY_LEVELS.indexOf(q) - 1)]

/** Trình duyệt có WebGL không — không có thì lớp Three.js tự ẩn, trang vẫn chạy như cũ. */
export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

/** Đoán sức máy: số nhân CPU, RAM, cỡ màn hình, kiểu con trỏ. */
export function detectDevice() {
  const mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760
  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory || 8
  const dpr = window.devicePixelRatio || 1

  let quality = 'high'
  if (mobile) quality = cores >= 6 && memory >= 4 ? 'medium' : 'low'
  else if (cores <= 4 || memory <= 4) quality = 'medium'
  if (cores <= 2 || memory <= 2) quality = 'low'
  if (dpr > 2.5 && cores <= 4) quality = lowerQuality(quality)

  const forced = new URLSearchParams(window.location.search).get('quality')
  if (QUALITY_LEVELS.includes(forced)) quality = forced

  return { quality, mobile, forcedQuality: QUALITY_LEVELS.includes(forced) }
}

/** Không bao giờ render với devicePixelRatio > 2 (điện thoại > 1.5). */
export function pixelRatioFor(quality, mobile) {
  const cap = THREE_CONFIG.maxPixelRatio[quality]
  return Math.min(window.devicePixelRatio || 1, mobile ? Math.min(cap, 1.5) : cap)
}

/** GPU giả lập bằng phần mềm (máy ảo, driver lỗi) → dùng cấp thấp nhất. */
export function isSoftwareRenderer(gl) {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    return /swiftshader|llvmpipe|software|basic render/i.test(name)
  } catch {
    return false
  }
}

/** Đo FPS trung bình mỗi giây; sample() trả về true khi FPS thấp kéo dài → nên hạ cấp. */
export class FpsMonitor {
  constructor({ threshold = 40, seconds = 3, warmup = 4 } = {}) {
    this.threshold = threshold
    this.seconds = seconds
    this.warmup = warmup
    this.fps = 60
    this.reset()
  }

  reset() {
    this.frames = 0
    this.acc = 0
    this.elapsed = 0
    this.low = 0
  }

  sample(dt) {
    this.frames++
    this.acc += dt
    this.elapsed += dt
    if (this.acc < 1) return false
    this.fps = this.frames / this.acc
    this.frames = 0
    this.acc = 0
    if (this.elapsed < this.warmup) return false
    this.low = this.fps < this.threshold ? this.low + 1 : 0
    if (this.low < this.seconds) return false
    this.reset()
    return true
  }
}
