import { BufferAttribute, BufferGeometry, Points, ShaderMaterial, Vector3 } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { POLLEN_FRAG, SPACE, rawColor } from '../shaders/index.js'
import { createRandom } from '../utils/random.js'
import { CARD_HOVER_EVENT } from '../signals.js'

const VERT = /* glsl */ `
${SPACE}
uniform float uD;
uniform float uPixelRatio;
uniform sampler2D uBg;
attribute vec2 aData; // cỡ (px), độ mờ
varying float vAlpha;
varying float vDark;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aData.x * uPixelRatio * (uD / -mv.z);
  vDark = backgroundDarkness(uBg, gl_Position);
  vAlpha = aData.y;
}
`

/**
 * Hạt vàng ấm có vòng đời (mô phỏng trên CPU, vài trăm hạt):
 * - CTA cuối trang: hạt vàng bay lên + vài đốm sáng lớn mờ (bokeh).
 * - Rê chuột lên thẻ sản phẩm: vài hạt phấn bay lên quanh ảnh — nhỏ, không che sản phẩm.
 * Toạ độ lưu theo trang (không theo màn hình) nên hạt cuộn cùng nội dung.
 */
export class HoneyParticles extends Effect {
  constructor(engine, { section = 'cta' } = {}) {
    super(engine, 'Hạt vàng')
    this.section = section
    this.rnd = createRandom(3)
    this.max = THREE_CONFIG.goldenParticles.high
    this.p = Array.from({ length: this.max }, () => ({ life: 0, age: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, size: 1, alpha: 0, ph: 0 }))
    this.cursor = 0
    this.emitAcc = 0
    this.hover = null
    this.hoverAcc = 0
    this.tmp = new Vector3()

    const geo = new BufferGeometry()
    this.aPos = new BufferAttribute(new Float32Array(this.max * 3), 3)
    this.aData = new BufferAttribute(new Float32Array(this.max * 2), 2)
    geo.setAttribute('position', this.aPos)
    geo.setAttribute('aData', this.aData)
    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: POLLEN_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        ...engine.uniforms,
        uGlow: { value: THREE_CONFIG.bloom ? 1 : 0 },
        uColorLight: { value: rawColor('#c9811c') },
        uColorDark: { value: rawColor('#ffcf6e') },
      },
    })
    this.points = new Points(geo, this.material)
    this.points.frustumCulled = false
    this.points.renderOrder = 11
    this.group.add(this.points)

    this.onHover = (e) => {
      const { el, on } = e.detail || {}
      if (on && el && engine.interactive) {
        this.hover = el
        this.burst(el, 10)
      } else if (this.hover === el) this.hover = null
    }
    window.addEventListener(CARD_HOVER_EVENT, this.onHover)
  }

  setQuality(q) {
    this.count = THREE_CONFIG.effects.goldenParticles ? THREE_CONFIG.goldenParticles[q] : 0
  }

  spawn(o) {
    if (!this.count) return
    const p = this.p[this.cursor]
    this.cursor = (this.cursor + 1) % this.count
    Object.assign(p, { age: 0, ph: this.rnd.range(0, 6.28) }, o)
  }

  /** Hạt phấn quanh nửa dưới ảnh sản phẩm, bay lên rồi tan. */
  burst(el, n) {
    const r = el.getBoundingClientRect()
    const sy = window.scrollY
    const R = this.rnd
    for (let i = 0; i < n; i++) {
      this.spawn({
        x: r.left + R.range(0.08, 0.92) * r.width,
        y: r.top + R.range(0.5, 1) * r.height + sy,
        z: R.range(0, 60),
        vx: R.range(-8, 8),
        vy: -R.range(22, 46),
        size: R.range(2.5, 5),
        alpha: R.range(0.5, 0.85),
        life: R.range(1.4, 2.4),
      })
    }
  }

  update(dt, engine) {
    const R = this.rnd
    const sy = window.scrollY
    const s = engine.scroll.get(this.section)

    // CTA: hạt vàng bay lên từ nửa dưới section
    if (s?.inView && this.count) {
      this.emitAcc += dt * 26 * Math.min(1, s.visibility * 1.5) * (this.count / this.max + 0.3)
      while (this.emitAcc >= 1) {
        this.emitAcc -= 1
        const bokeh = R.next() < 0.1
        this.spawn({
          x: R.range(0, engine.W),
          y: s.top + s.height * R.range(0.55, 1.05) + sy,
          z: bokeh ? R.range(120, 300) : R.range(-200, 150),
          vx: R.range(-6, 6),
          vy: -R.range(14, 40),
          size: bokeh ? R.range(14, 26) : R.range(2.5, 7),
          alpha: bokeh ? R.range(0.08, 0.16) : R.range(0.35, 0.8),
          life: R.range(5, 9),
        })
      }
    }
    // thẻ sản phẩm đang được rê chuột
    if (this.hover) {
      this.hoverAcc += dt * 7
      while (this.hoverAcc >= 1) {
        this.hoverAcc -= 1
        this.burst(this.hover, 1)
      }
    }

    const pos = this.aPos.array
    const data = this.aData.array
    let alive = 0
    for (let i = 0; i < this.max; i++) {
      const p = this.p[i]
      if (p.age >= p.life || i >= this.count) {
        data[i * 2 + 1] = 0
        continue
      }
      alive++
      p.age += dt
      p.x += (p.vx + Math.sin(engine.time * 1.3 + p.ph) * 10) * dt + engine.wind.x * engine.wind.strength * 12 * dt
      p.y += p.vy * dt
      const k = p.age / p.life
      const fade = Math.pow(Math.sin(Math.PI * Math.min(1, k)), 0.8)
      engine.toWorld(p.x, p.y - sy, p.z, this.tmp)
      pos[i * 3] = this.tmp.x
      pos[i * 3 + 1] = this.tmp.y
      pos[i * 3 + 2] = this.tmp.z
      data[i * 2] = p.size
      data[i * 2 + 1] = p.alpha * fade
    }
    this.alive = alive
    this.intensity = alive ? 1 : 0
    this.group.visible = alive > 0
    if (alive) {
      this.aPos.needsUpdate = true
      this.aData.needsUpdate = true
    }
  }

  dispose() {
    window.removeEventListener(CARD_HOVER_EVENT, this.onHover)
    super.dispose()
  }
}
