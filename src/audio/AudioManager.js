import { asset } from '../lib/assets.js'
import { getAtmosphere, subscribeAtmosphere } from '../lib/atmosphere.js'
import { AUDIO_CONFIG, AUDIO_LAYERS, AUDIO_SCENES } from './config.js'

const LAYERS = Object.keys(AUDIO_LAYERS)
const clamp01 = (v) => Math.min(1, Math.max(0, v))

/**
 * Quản lý toàn bộ âm thanh nền: 3 lớp (rừng, gió, suối) trong MỘT AudioContext.
 *
 * - Không phát gì cho tới khi người xem bấm nút (chính sách autoplay của trình duyệt).
 * - Tải file ở lần bật đầu tiên; lớp nào tải lỗi thì im lặng, không làm hỏng trang.
 * - Lặp liền mạch bằng AudioBufferSourceNode (thẻ <audio> loop MP3 hay bị hở một nhịp ở chỗ nối).
 * - Đổi section → crossfade; gió mạnh (cuộn nhanh, theo lớp Three.js) → lớp gió to lên nhẹ.
 * - Tắt tiếng → giảm dần về 0 rồi tạm dừng ngữ cảnh (không huỷ); tab ẩn → tạm dừng.
 */
class AudioManager {
  constructor() {
    this.ctx = null
    this.master = null
    this.layers = {}
    this.muted = true
    this.scene = 'hero'
    this.wind = 0
    this.loading = null
    this.cleanups = []
    this.listeners = new Set()
    this.status = 'off' // off | loading | on | error
  }

  get mobile() {
    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760
  }

  get reduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /** Cho nút bật/tắt theo dõi trạng thái. */
  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  setStatus(s) {
    this.status = s
    for (const l of this.listeners) l(s)
  }

  /** Tạo ngữ cảnh + tải các lớp (chỉ chạy một lần, trong cú bấm của người xem). */
  init() {
    if (this.ctx) return this.loading
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx || !AUDIO_CONFIG.enabled) return Promise.reject(new Error('Web Audio không khả dụng'))
    // tần số lấy mẫu thấp vừa đủ cho tiếng thiên nhiên → bộ nhớ giải mã nhỏ
    try {
      this.ctx = new Ctx({ sampleRate: this.mobile ? 22050 : 32000 })
    } catch {
      this.ctx = new Ctx()
    }
    this.master = this.ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(this.ctx.destination)
    for (const name of LAYERS) {
      const gain = this.ctx.createGain()
      gain.gain.value = 0
      gain.connect(this.master)
      this.layers[name] = { gain, source: null, ok: false }
    }
    this.listen()
    this.loading = Promise.all(LAYERS.map((name) => this.loadLayer(name))).then((ok) => {
      if (!ok.some(Boolean)) throw new Error('Không tải được file âm thanh nào')
    })
    return this.loading
  }

  async loadLayer(name) {
    try {
      const res = await fetch(asset(AUDIO_LAYERS[name].file))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buffer = await this.ctx.decodeAudioData(await res.arrayBuffer())
      const src = this.ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true
      // bỏ khoảng lặng đệm của bộ mã hoá MP3 (nếu trình duyệt còn giữ) để vòng lặp không hở
      const [start, end] = trimSilence(buffer)
      src.loopStart = start
      src.loopEnd = end
      src.connect(this.layers[name].gain)
      src.start(0, start)
      this.layers[name].source = src
      this.layers[name].ok = true
      this.mix(true)
      return true
    } catch (err) {
      if (import.meta.env.DEV) console.warn(`[Melbee] Âm thanh "${name}" không tải được — bỏ qua lớp này.`, err)
      return false
    }
  }

  /** Nghe section + gió từ lớp Three.js; không có Three.js thì tự theo dõi section bằng IntersectionObserver. */
  listen() {
    const a = getAtmosphere()
    if (a.scene) this.scene = a.scene
    this.cleanups.push(
      subscribeAtmosphere((s) => {
        if (s.scene && s.scene !== this.scene) this.setScene(s.scene)
        if (s.wind !== this.wind) this.setWindIntensity(s.wind)
      })
    )

    const visible = new Map()
    const io = new IntersectionObserver(
      (entries) => {
        if (getAtmosphere().source === 'three') return // lớp Three.js đang báo section rồi
        for (const e of entries) visible.set(e.target.dataset.scene, e.intersectionRatio * e.boundingClientRect.height)
        let best = null
        let max = 0
        for (const [name, v] of visible) if (v > max) [best, max] = [name, v]
        if (best) this.setScene(best)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    document.querySelectorAll('[data-scene]').forEach((el) => io.observe(el))
    this.cleanups.push(() => io.disconnect())

    const onVisibility = () => {
      if (!this.ctx || this.muted) return
      if (document.hidden) this.ctx.suspend()
      else this.ctx.resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    this.cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility))
  }

  /** Đặt âm lượng từng lớp theo section + gió hiện tại (mượt, không cắt đột ngột). */
  mix(instant = false) {
    if (!this.ctx) return
    const scene = AUDIO_SCENES[this.scene] || AUDIO_SCENES.hero
    const k = this.mobile ? AUDIO_CONFIG.mobileVolume : 1
    const now = this.ctx.currentTime
    for (const name of LAYERS) {
      const layer = this.layers[name]
      let v = (scene[name] ?? AUDIO_LAYERS[name].volume) * k
      if (name === 'wind' && !this.reduced) v *= 1 + AUDIO_CONFIG.windBoost * this.wind
      const tc = instant ? 0.05 : this.reduced ? AUDIO_CONFIG.crossfade * 2 : AUDIO_CONFIG.crossfade
      layer.gain.gain.cancelScheduledValues(now)
      layer.gain.gain.setTargetAtTime(layer.ok ? v : 0, now, tc)
    }
  }

  setScene(name) {
    if (!AUDIO_SCENES[name] || name === this.scene) return
    this.scene = name
    this.mix()
  }

  /**
   * Độ mạnh gió từ lớp Three.js (gió nền ~0.1–0.5, cuộn nhanh có thể > 1).
   * Chỉ phần vượt mức gió nền mới làm lớp gió to thêm.
   */
  setWindIntensity(strength) {
    const boost = clamp01((strength - 0.35) / 0.8)
    if (Math.abs(boost - this.wind) < 0.03) return
    this.wind = boost
    this.mix()
  }

  async setMuted(muted) {
    this.muted = muted
    if (!muted) {
      this.setStatus('loading')
      try {
        await this.init()
        if (this.muted) return
        await this.ctx.resume()
        const now = this.ctx.currentTime
        this.master.gain.cancelScheduledValues(now)
        this.master.gain.setTargetAtTime(1, now, AUDIO_CONFIG.fadeIn / 3)
        this.setStatus('on')
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[Melbee] Không bật được âm thanh:', err)
        // dọn để lần bấm sau thử tải lại từ đầu
        this.dispose()
        this.setStatus('error')
      }
      return
    }
    this.setStatus('off')
    if (!this.ctx) return
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setTargetAtTime(0, now, AUDIO_CONFIG.fadeOut / 3)
    clearTimeout(this.suspendTimer)
    // giảm hẳn rồi mới tạm dừng ngữ cảnh (tiết kiệm CPU, giữ nguyên vị trí phát)
    this.suspendTimer = setTimeout(() => this.muted && this.ctx?.suspend(), AUDIO_CONFIG.fadeOut * 1000 + 300)
  }

  toggle() {
    return this.setMuted(!this.muted)
  }

  dispose() {
    clearTimeout(this.suspendTimer)
    for (const off of this.cleanups) off()
    this.cleanups = []
    for (const l of Object.values(this.layers)) {
      try {
        l.source?.stop()
      } catch {
        // đã dừng
      }
      l.source?.disconnect()
    }
    this.layers = {}
    this.ctx?.close()
    this.ctx = null
    this.loading = null
    this.muted = true
    this.setStatus('off')
  }
}

/** Vị trí (giây) mẫu đầu và cuối có tiếng — phần ngoài là khoảng lặng đệm của bộ mã hoá. */
function trimSilence(buffer) {
  const data = buffer.getChannelData(0)
  const eps = 1e-4
  let a = 0
  let b = data.length - 1
  while (a < b && Math.abs(data[a]) < eps) a++
  while (b > a && Math.abs(data[b]) < eps) b--
  return [a / buffer.sampleRate, (b + 1) / buffer.sampleRate]
}

export const audioManager = new AudioManager()

// soi trong DevTools khi chạy npm run dev (bản production không có)
if (import.meta.env.DEV) window.__melbeeAudio = audioManager
