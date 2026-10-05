import {
  DataTexture,
  DirectionalLight,
  HemisphereLight,
  LinearFilter,
  PerspectiveCamera,
  RGBAFormat,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { SCENES, THREE_CONFIG } from '../config.js'
import { ScrollTracker } from './ScrollTracker.js'
import { publishAtmosphere } from '../../lib/atmosphere.js'
import { clamp, damp, noise1 } from '../utils/noise.js'
import { FpsMonitor, isSoftwareRenderer, lowerQuality, pixelRatioFor } from '../utils/performance.js'

const FOV = 35
const BG_ROWS = 64 // số dải ngang mô tả nền sáng/tối dưới canvas
const MOOD_KEYS = ['pollen', 'dust', 'wind']

/**
 * MỘT renderer, MỘT scene, MỘT camera cho cả trang.
 * Canvas cố định phủ màn hình, trong suốt, không nhận chuột; các hiệu ứng tự bám theo
 * vị trí section/phần tử DOM của chúng nên không cần canvas riêng cho từng section.
 */
export class Engine {
  constructor(canvas, { quality, mobile, reducedMotion }) {
    this.canvas = canvas
    this.mobile = mobile
    this.reduced = reducedMotion
    this.quality = quality

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: quality === 'high' && !mobile,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x000000, 0)
    if (isSoftwareRenderer(this.renderer.getContext())) this.quality = 'low'

    this.scene = new Scene()
    this.camera = new PerspectiveCamera(FOV, 1, 1, 10000)
    this.scroll = new ScrollTracker()
    this.effects = []
    this.mood = { pollen: 0, dust: 0, wind: 0 }
    this.wind = { x: 1, y: 0, strength: 0.2, offsetX: 0, offsetY: 0 }
    this.pointer = { x: -9999, y: -9999, nx: 0, ny: 0, inside: false }
    this.parallax = new Vector2()
    this.time = 0
    this.running = false
    this.raf = 0
    this.fps = new FpsMonitor()
    this.listeners = []

    this.bgData = new Uint8Array(BG_ROWS * 4)
    const bg = new DataTexture(this.bgData, 1, BG_ROWS, RGBAFormat)
    bg.magFilter = LinearFilter
    bg.minFilter = LinearFilter
    bg.needsUpdate = true

    // uniform dùng chung — hiệu ứng trải ({ ...engine.uniforms }) nên mọi shader cùng nhận giá trị mới
    this.uniforms = {
      uTime: { value: 0 },
      uViewport: { value: new Vector2(1, 1) }, // px CSS
      uResolution: { value: new Vector2(1, 1) }, // px thiết bị
      uPixelRatio: { value: 1 },
      uD: { value: 1 }, // khoảng cách camera → mặt phẳng z = 0
      uWind: { value: new Vector3(1, 0, 0.2) }, // hướng x, y + độ mạnh
      uWindOffset: { value: new Vector2() }, // quãng gió đã thổi (px)
      uScrollY: { value: 0 },
      uMouse: { value: new Vector3(-9999, -9999, 0) }, // px CSS + 1 nếu chuột đang trong trang
      uBg: { value: bg, shared: true },
    }

    this.resize()
    this.on(window, 'resize', () => this.resize())
    this.on(document, 'visibilitychange', () => (document.hidden ? this.stop() : this.start()))
    if (!mobile) {
      this.on(window, 'pointermove', (e) => this.onPointer(e), { passive: true })
      this.on(document.documentElement, 'pointerleave', () => (this.pointer.inside = false))
    }
  }

  on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts)
    this.listeners.push(() => target.removeEventListener(type, fn, opts))
  }

  /** Có tương tác chuột không (máy có chuột, không bật giảm chuyển động). */
  get interactive() {
    return !this.mobile && !this.reduced
  }

  onPointer(e) {
    if (e.pointerType !== 'mouse') return
    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
    this.pointer.nx = (e.clientX / this.W) * 2 - 1
    this.pointer.ny = (e.clientY / this.H) * 2 - 1
    this.pointer.inside = true
  }

  add(effect) {
    this.effects.push(effect)
    effect.setQuality(this.quality, this)
    effect.resize(this)
    return effect
  }

  /** Đèn cho vật liệu chuẩn (chỉ cần khi tắt honeyShader); shader tự viết không dùng đèn. */
  ensureLights() {
    if (this.lights) return
    const key = new DirectionalLight(0xfff1d6, 2.2)
    key.position.set(-0.5, 0.8, 0.6)
    this.lights = [new HemisphereLight(0xffe6b0, 0x3a291d, 1.1), key]
    this.scene.add(...this.lights)
  }

  /** Điểm màn hình (px CSS, gốc trên-trái) ở độ sâu z → toạ độ thế giới. */
  toWorld(sx, sy, z = 0, out = new Vector3()) {
    const k = (this.D - z) / this.D
    return out.set((sx - this.W / 2) * k, (this.H / 2 - sy) * k, z)
  }

  /** Kích thước thế giới của 1 px màn hình ở độ sâu z. */
  scaleAt(z) {
    return (this.D - z) / this.D
  }

  /** Nền tại toạ độ y màn hình có tối không. */
  isDarkAt(sy) {
    const i = clamp(Math.floor((sy / this.H) * BG_ROWS), 0, BG_ROWS - 1)
    return this.bgData[i * 4] > 127
  }

  resize() {
    const W = window.innerWidth
    const H = this.canvas.clientHeight || window.innerHeight
    this.W = W
    this.H = H
    const pr = pixelRatioFor(this.quality, this.mobile)
    this.pixelRatio = pr
    this.renderer.setPixelRatio(pr)
    this.renderer.setSize(W, H, false)
    this.D = H / 2 / Math.tan((FOV * Math.PI) / 360)
    this.camera.aspect = W / H
    this.camera.near = 1
    this.camera.far = this.D * 4
    this.camera.position.set(0, 0, this.D)
    this.camera.lookAt(0, 0, 0)
    this.camera.updateProjectionMatrix()
    const u = this.uniforms
    u.uViewport.value.set(W, H)
    u.uResolution.value.set(W * pr, H * pr)
    u.uPixelRatio.value = pr
    u.uD.value = this.D
    for (const e of this.effects) e.resize(this)
  }

  setQuality(q) {
    if (q === this.quality) return
    this.quality = q
    for (const e of this.effects) e.setQuality(q, this)
    this.resize()
  }

  setReducedMotion(on) {
    this.reduced = on
    for (const e of this.effects) e.setQuality(this.quality, this)
  }

  start() {
    if (this.running || document.hidden) return
    this.running = true
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
    // tab ẩn / mất WebGL: nhường việc theo dõi section cho IntersectionObserver của âm thanh
    publishAtmosphere({ source: null })
  }

  frame = (now) => {
    if (!this.running) return
    this.raf = requestAnimationFrame(this.frame)
    const dt = Math.min((now - this.last) / 1000, 1 / 20)
    this.last = now
    if (dt <= 0) return
    const step = dt * (this.reduced ? 0.35 : 1)
    this.time += step

    this.scroll.update(dt, this.H)
    this.updateMood(dt)
    this.updateWind(dt)
    this.publish(dt)
    this.updateBackground()
    this.updateCamera(dt)

    const u = this.uniforms
    u.uTime.value = this.time
    u.uScrollY.value = this.scroll.y
    u.uMouse.value.set(this.pointer.x, this.pointer.y, this.interactive && this.pointer.inside ? 1 : 0)

    for (const e of this.effects) e.update(step, this)
    this.renderer.render(this.scene, this.camera)

    if (this.fps.sample(dt) && THREE_CONFIG.autoQuality && this.quality !== 'low') {
      this.setQuality(lowerQuality(this.quality))
    }
  }

  /** Trộn "tâm trạng" các section theo phần màn hình mỗi section chiếm. */
  updateMood(dt) {
    let total = 0
    const target = { pollen: 0, dust: 0, wind: 0 }
    for (const s of this.scroll.sections) {
      if (!s.visibility) continue
      const scene = SCENES[s.name] || {}
      total += s.visibility
      for (const k of MOOD_KEYS) target[k] += (scene[k] || 0) * s.visibility
    }
    for (const k of MOOD_KEYS) this.mood[k] = damp(this.mood[k], total ? target[k] / total : 0, 1.6, dt)
  }

  /** Gió = gió nền theo section + gió giật + vận tốc cuộn. */
  updateWind(dt) {
    const w = this.wind
    const v = this.reduced ? 0 : Math.min(Math.abs(this.scroll.velocity) / 1500, 1.5)
    const gust = noise1(this.time * 0.15) * 0.5 + 0.5
    const base = THREE_CONFIG.wind ? (0.1 + 0.4 * this.mood.wind) * (0.6 + 0.8 * gust) : 0.04
    const strength = base + v * THREE_CONFIG.windScrollFactor
    w.strength = damp(w.strength, strength, strength > w.strength ? 4 : 1.2, dt)
    const angle = noise1(this.time * 0.07 + 40) * 0.25
    w.x = Math.cos(angle)
    w.y = Math.sin(angle)
    const speed = w.strength * 110 * (this.reduced ? 0.3 : 1)
    w.offsetX += w.x * speed * dt
    w.offsetY += w.y * speed * dt
    this.uniforms.uWind.value.set(w.x, w.y, w.strength)
    this.uniforms.uWindOffset.value.set(w.offsetX, w.offsetY)
  }

  /** Báo section + gió cho phần còn lại của trang (âm thanh nền nghe theo) — không cần listener cuộn riêng. */
  publish(dt) {
    this.publishAcc = (this.publishAcc || 0) + dt
    const scene = this.scroll.active
    if (scene !== this.publishedScene || this.publishAcc > 0.1) {
      this.publishAcc = 0
      this.publishedScene = scene
      publishAtmosphere({ scene, wind: this.wind.strength, source: 'three' })
    }
  }

  /** Ghi dải sáng/tối dưới canvas — shader dùng để chọn màu hạt hợp với nền. */
  updateBackground() {
    let changed = false
    for (let i = 0; i < BG_ROWS; i++) {
      const y = ((i + 0.5) / BG_ROWS) * this.H
      let dark = 0
      for (const s of this.scroll.sections) {
        if (y >= s.top && y < s.bottom) {
          dark = s.dark ? 255 : 0
          break
        }
      }
      if (this.bgData[i * 4] !== dark) {
        this.bgData[i * 4] = dark
        changed = true
      }
    }
    if (changed) this.uniforms.uBg.value.needsUpdate = true
  }

  /** Chuột → camera nghiêng rất nhẹ (tối đa ~0.03 rad), chỉ trên máy có chuột. */
  updateCamera(dt) {
    const on = THREE_CONFIG.mouseParallax && this.interactive && this.pointer.inside
    this.parallax.x = damp(this.parallax.x, on ? this.pointer.nx : 0, 2, dt)
    this.parallax.y = damp(this.parallax.y, on ? this.pointer.ny : 0, 2, dt)
    const reach = this.D * Math.tan(THREE_CONFIG.maxParallaxRotation)
    this.camera.position.set(this.parallax.x * reach, -this.parallax.y * reach * 0.6, this.D)
    this.camera.lookAt(0, 0, 0)
  }

  stats() {
    const info = this.renderer.info
    return {
      fps: Math.round(this.fps.fps),
      quality: this.quality,
      pixelRatio: this.pixelRatio,
      reducedMotion: this.reduced,
      mobile: this.mobile,
      section: this.scroll.active,
      progress: this.scroll.progress,
      scrollVelocity: Math.round(this.scroll.velocity),
      wind: this.wind.strength,
      mood: { ...this.mood },
      effects: this.effects.map((e) => ({ name: e.name, active: e.active, count: e.count, intensity: e.intensity })),
      renderer: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        points: info.render.points,
        lines: info.render.lines,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs?.length ?? 0,
      },
    }
  }

  dispose() {
    this.stop()
    publishAtmosphere({ source: null })
    for (const off of this.listeners) off()
    this.listeners = []
    for (const e of this.effects) e.dispose()
    this.effects = []
    this.uniforms.uBg.value.dispose()
    this.renderer.dispose()
  }
}
