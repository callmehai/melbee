import { asset } from '../lib/assets.js'
import { getAtmosphere, subscribeAtmosphere } from '../lib/atmosphere.js'
import { AUDIO_CONFIG, AUDIO_LAYERS, AUDIO_SCENES } from './config.js'

const LAYERS = Object.keys(AUDIO_LAYERS)
const clamp01 = (v) => Math.min(1, Math.max(0, v))

// nhớ lựa chọn tắt tiếng trong phiên xem (tải lại trang vẫn tắt); lần sau vào trang thì nhạc lại bật
const PREF_KEY = 'melbee:sound'
const readPref = () => {
  try {
    return sessionStorage.getItem(PREF_KEY)
  } catch {
    return null
  }
}
const writePref = (v) => {
  try {
    sessionStorage.setItem(PREF_KEY, v)
  } catch {
    // trình duyệt chặn lưu trữ — bỏ qua
  }
}

// chỗ đang phát của từng lớp stream — chuyển sang trang khác trong web thì nhạc phát tiếp, không về đầu bài
const posKey = (name) => `melbee:pos:${name}`
const readPos = (name) => {
  try {
    return Number(sessionStorage.getItem(posKey(name))) || 0
  } catch {
    return 0
  }
}
const writePos = (name, t) => {
  try {
    sessionStorage.setItem(posKey(name), String(t))
  } catch {
    // trình duyệt chặn lưu trữ — bỏ qua
  }
}

/**
 * Trình duyệt có cho phát tiếng ngay khi vào trang không (khách quen của trang, hoặc người xem đã cho
 * phép âm thanh với trang này). Firefox có API hỏi thẳng; Chrome/Edge: ngữ cảnh âm thanh tạo ra mà chạy
 * luôn ("running") là được phép.
 */
function canAutoplay() {
  try {
    if (navigator.getAutoplayPolicy) return navigator.getAutoplayPolicy('audiocontext') === 'allowed'
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return false
    const probe = new Ctx()
    const ok = probe.state === 'running'
    probe.close()
    return ok
  } catch {
    return false
  }
}
// các thao tác trình duyệt tính là "người xem đã tương tác" (cuộn trang thì không)
const GESTURES = ['pointerup', 'touchend', 'click', 'keydown']

/**
 * Quản lý toàn bộ âm thanh nền (các lớp khai báo ở config.js) trong MỘT AudioContext.
 *
 * - Không phát gì cho tới khi người xem bấm nút (chính sách autoplay của trình duyệt).
 * - Tải file ở lần bật đầu tiên; lớp nào tải lỗi thì im lặng, không làm hỏng trang.
 * - Lớp stream (bài nhạc dài): phát từ thẻ <audio> qua MediaElementSource — không giải mã cả bài vào RAM.
 *   Lớp thường (đoạn tiếng thiên nhiên ngắn): AudioBufferSourceNode, lặp liền mạch tuyệt đối.
 * - Đổi section → crossfade; gió mạnh (cuộn nhanh, theo lớp Three.js) → lớp "wind" to lên nhẹ.
 * - Tắt tiếng → giảm dần về 0 rồi tạm dừng (không huỷ); tab ẩn → tạm dừng, quay lại → phát tiếp.
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
    // chỉ có tiếng thiên nhiên → tần số lấy mẫu thấp cho bộ nhớ giải mã nhỏ; có nhạc → giữ chất lượng gốc
    const hasMusic = LAYERS.some((n) => AUDIO_LAYERS[n].stream)
    try {
      this.ctx = hasMusic ? new Ctx() : new Ctx({ sampleRate: this.mobile ? 22050 : 32000 })
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
    if (AUDIO_LAYERS[name].stream) return this.loadStream(name)
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
      if (import.meta.env.DEV) console.warn(`[MelBee] Âm thanh "${name}" không tải được — bỏ qua lớp này.`, err)
      return false
    }
  }

  /**
   * Lớp phát trực tiếp từ file. play() được gọi ngay trong cú bấm (init chạy đồng bộ trong click)
   * để Safari/iOS không chặn.
   */
  loadStream(name) {
    const el = new Audio()
    el.src = asset(AUDIO_LAYERS[name].file)
    el.loop = true
    el.preload = 'auto'
    el.currentTime = readPos(name) // đặt trước khi tải: trình duyệt bắt đầu phát từ đây
    const savePos = () => writePos(name, el.currentTime)
    // lưu liên tục (không chỉ lúc rời trang): trang kế được tải sẵn ở nền có thể đọc trước khi trang này đóng
    el.addEventListener('timeupdate', savePos)
    window.addEventListener('pagehide', savePos)
    this.cleanups.push(() => window.removeEventListener('pagehide', savePos))
    const layer = this.layers[name]
    layer.media = el
    try {
      this.ctx.createMediaElementSource(el).connect(layer.gain)
    } catch (err) {
      if (import.meta.env.DEV) console.warn(`[MelBee] Không nối được "${name}" vào Web Audio.`, err)
      return Promise.resolve(false)
    }
    const playing = el.play()
    return new Promise((resolve) => {
      let failed = false
      const fail = (err) => {
        if (failed) return
        failed = true
        if (import.meta.env.DEV) console.warn(`[MelBee] Âm thanh "${name}" không tải được — bỏ qua lớp này.`, err)
        layer.ok = false
        resolve(false)
      }
      el.addEventListener('error', () => fail(el.error), { once: true })
      Promise.resolve(playing)
        .then(() => {
          layer.ok = true
          if (this.muted) el.pause()
          this.mix(true)
          resolve(true)
        })
        .catch(fail)
    })
  }

  /** Phát / dừng các lớp stream theo trạng thái bật tắt. */
  playMedia(on) {
    for (const l of Object.values(this.layers)) {
      if (!l.media || !l.ok) continue
      if (on) l.media.play().catch(() => {})
      else l.media.pause()
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
      this.playMedia(!document.hidden)
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
    if (!name || name === this.scene) return // section không có trong bảng → dùng volume mặc định
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
        this.playMedia(true)
        const now = this.ctx.currentTime
        this.master.gain.cancelScheduledValues(now)
        this.master.gain.setTargetAtTime(1, now, AUDIO_CONFIG.fadeIn / 3)
        this.setStatus('on')
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[MelBee] Không bật được âm thanh:', err)
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
    this.suspendTimer = setTimeout(() => {
      if (!this.muted) return
      this.playMedia(false)
      this.ctx?.suspend()
    }, AUDIO_CONFIG.fadeOut * 1000 + 300)
  }

  /**
   * Mặc định bật khi vào trang: trình duyệt cho phát ngay thì phát luôn; không thì nút hiện sẵn "Bật"
   * (trạng thái pending) và nhạc chạy ở lần bấm / chạm / gõ phím đầu tiên trên trang (trình duyệt không
   * tính cuộn trang là tương tác). Người xem tắt → giữ tắt tới hết phiên xem.
   */
  autoStart() {
    // trang đang được tải sẵn ở nền (rê chuột vào link) → chỉ phát khi người xem thật sự mở trang
    if (document.prerendering) {
      document.addEventListener('prerenderingchange', () => this.autoStart(), { once: true })
      return
    }
    if (!AUDIO_CONFIG.autoplay || readPref() === 'off' || this.status !== 'off') return
    this.setStatus('pending')
    const start = (e) => {
      // bấm vào chính nút âm thanh → để toggle() xử lý (người xem đang muốn tắt)
      if (e.target instanceof Element && e.target.closest('.sound-toggle')) return
      if (e.type === 'keydown' && e.key === 'Escape') return
      this.cancelPending()
      if (this.status === 'pending') this.setMuted(false)
    }
    for (const t of GESTURES) window.addEventListener(t, start, { capture: true })
    this.cancelPending = () => {
      for (const t of GESTURES) window.removeEventListener(t, start, { capture: true })
      this.cancelPending = () => {}
    }
    if (canAutoplay()) {
      this.cancelPending()
      this.setMuted(false)
    }
  }

  cancelPending() {}

  toggle() {
    if (this.status === 'pending') {
      this.cancelPending()
      writePref('off')
      this.setStatus('off')
      return Promise.resolve()
    }
    writePref(this.muted ? 'on' : 'off')
    return this.setMuted(!this.muted)
  }

  dispose() {
    clearTimeout(this.suspendTimer)
    this.cancelPending()
    for (const off of this.cleanups) off()
    this.cleanups = []
    for (const l of Object.values(this.layers)) {
      try {
        l.source?.stop()
      } catch {
        // đã dừng
      }
      l.source?.disconnect()
      if (l.media) {
        l.media.pause()
        l.media.removeAttribute('src')
        l.media.load()
      }
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
