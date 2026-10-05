import { CanvasTexture, InstancedBufferAttribute, InstancedBufferGeometry, LinearMipmapLinearFilter, Mesh, PlaneGeometry, ShaderMaterial } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { clamp, damp, noise1 } from '../utils/noise.js'
import { createRandom } from '../utils/random.js'

const VERT = /* glsl */ `
uniform float uTime;
attribute vec3 aPos;
attribute vec4 aBee; // hướng (lật trái/phải), nghiêng, pha vỗ cánh, cỡ (px)
varying vec2 vUv;
varying float vFrame;
void main() {
  vec2 q = position.xy;
  q.x *= aBee.x;
  float c = cos(aBee.y), s = sin(aBee.y);
  q = mat2(c, s, -s, c) * q;
  vec4 mv = modelViewMatrix * vec4(aPos, 1.0);
  mv.xy += q * aBee.w; // billboard: luôn quay mặt về camera
  gl_Position = projectionMatrix * mv;
  vUv = uv;
  vFrame = step(0.0, sin(uTime * 70.0 + aBee.z * 10.0)); // 2 khung hình cánh
}
`

const FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uOpacity;
varying vec2 vUv;
varying float vFrame;
void main() {
  vec4 c = texture2D(uMap, vec2(vUv.x * 0.5 + vFrame * 0.5, vUv.y));
  if (c.a < 0.03) discard;
  gl_FragColor = vec4(c.rgb, c.a * uOpacity);
}
`

/** Vẽ sprite ong (2 khung: cánh trên / cánh dưới), đầu quay trái như con trỏ ong. */
function beeAtlas() {
  const S = 128
  const cv = document.createElement('canvas')
  cv.width = S * 2
  cv.height = S
  const g = cv.getContext('2d')
  for (let f = 0; f < 2; f++) {
    g.save()
    g.translate(S * f + S / 2, S / 2 + 8)
    // cánh
    g.fillStyle = 'rgba(255,255,255,0.78)'
    g.strokeStyle = 'rgba(30,28,24,0.35)'
    g.lineWidth = 2
    for (const [x, rot, rx, ry] of [
      [-2, f ? -0.25 : -0.9, 17, 26],
      [12, f ? 0.1 : -0.55, 14, 22],
    ]) {
      g.save()
      g.translate(x, -14)
      g.rotate(rot)
      g.beginPath()
      g.ellipse(0, -ry * 0.6, rx, ry, 0, 0, Math.PI * 2)
      g.fill()
      g.stroke()
      g.restore()
    }
    // thân
    g.save()
    g.beginPath()
    g.ellipse(6, 0, 34, 22, 0, 0, Math.PI * 2)
    const grad = g.createLinearGradient(0, -22, 0, 22)
    grad.addColorStop(0, '#f6c04a')
    grad.addColorStop(1, '#cf8618')
    g.fillStyle = grad
    g.fill()
    g.clip()
    g.fillStyle = '#1e1c18'
    for (const x of [-2, 16, 32]) g.fillRect(x, -24, 9, 48)
    g.restore()
    // ngòi, đầu, mắt, râu
    g.fillStyle = '#1e1c18'
    g.beginPath()
    g.moveTo(38, -4)
    g.lineTo(50, 1)
    g.lineTo(38, 6)
    g.fill()
    g.beginPath()
    g.arc(-30, 0, 16, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#fff'
    g.beginPath()
    g.arc(-35, -4, 3.5, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#1e1c18'
    g.lineWidth = 3
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(-36, -13)
    g.quadraticCurveTo(-46, -32, -40, -38)
    g.moveTo(-28, -15)
    g.quadraticCurveTo(-30, -34, -22, -38)
    g.stroke()
    g.restore()
  }
  const tex = new CanvasTexture(cv)
  tex.minFilter = LinearMipmapLinearFilter
  tex.anisotropy = 4
  return tex
}

/**
 * Đàn ong (sprite + instancing, 1 draw call). Mô phỏng kiểu boids đơn giản:
 * mỗi con bay quanh "tổ" của điểm neo + nhiễu + tách nhau + né chuột.
 * Toạ độ ong tính tương đối với điểm neo nên cả đàn cuộn theo trang; khi đổi điểm neo
 * (Hero → đồng hoa "Nguồn gốc") đàn ong bay sang chỗ mới.
 */
export class BeeSwarm extends Effect {
  constructor(engine, { anchors }) {
    super(engine, 'Đàn ong')
    this.anchors = anchors
    this.current = null
    this.center = { x: 0, y: 0 }
    const max = THREE_CONFIG.bees.high
    this.max = max
    const rnd = createRandom(11)
    this.bees = Array.from({ length: max }, (_, i) => ({
      x: rnd.range(-200, 200),
      y: rnd.range(-120, 120),
      z: rnd.range(-160, 120),
      vx: 0,
      vy: 0,
      phase: rnd.range(0, Math.PI * 2),
      speed: rnd.range(0.25, 0.55) * rnd.sign(),
      orbit: rnd.range(0.35, 1),
      size: rnd.range(22, 32),
      seed: i * 7.31,
      flip: 1,
      tilt: 0,
    }))

    const geo = new InstancedBufferGeometry()
    const plane = new PlaneGeometry(1, 1)
    geo.index = plane.index
    geo.setAttribute('position', plane.attributes.position)
    geo.setAttribute('uv', plane.attributes.uv)
    this.aPos = new InstancedBufferAttribute(new Float32Array(max * 3), 3)
    this.aBee = new InstancedBufferAttribute(new Float32Array(max * 4), 4)
    geo.setAttribute('aPos', this.aPos)
    geo.setAttribute('aBee', this.aBee)
    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: { uTime: engine.uniforms.uTime, uMap: { value: beeAtlas() }, uOpacity: { value: 0 } },
    })
    this.mesh = new Mesh(geo, this.material)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 9
    this.group.add(this.mesh)
  }

  setQuality(q, engine) {
    this.count = THREE_CONFIG.effects.bees && !engine.reduced ? THREE_CONFIG.bees[q] : 0
    this.mesh.geometry.instanceCount = this.count
  }

  /** Chọn điểm neo đang chiếm màn hình nhiều nhất (có độ trễ để không nhảy qua lại). */
  pickAnchor() {
    let best = null
    let bestVis = 0
    for (const a of this.anchors) {
      const v = a.get()
      if (v && v.inView && v.visibility > bestVis) {
        best = a
        bestVis = v.visibility
      }
    }
    if (!best) return this.current || this.anchors[0]
    if (this.current && best !== this.current) {
      const cur = this.current.get()
      if (cur?.inView && cur.visibility + 0.12 > bestVis) return this.current
    }
    return best
  }

  update(dt, engine) {
    if (!this.count) {
      this.group.visible = false
      return
    }
    const anchor = this.pickAnchor()
    const a = anchor.get()
    if (!a) return
    // đổi điểm neo: giữ nguyên vị trí trên màn hình, rồi để ong tự bay về chỗ mới
    if (anchor !== this.current) {
      if (this.current) {
        const far = engine.H * 0.9
        for (const b of this.bees) {
          b.x += this.center.x - a.sx
          b.y -= this.center.y - a.sy
          // ong còn ở rất xa (ngoài màn hình) → đặt ngay sát mép màn hình để bay vào trong 1–2 giây
          const sy = a.sy - b.y
          if (sy < -far || sy > engine.H + far) {
            const fromTop = sy < 0
            const nsy = fromTop ? -30 - Math.random() * 90 : engine.H + 30 + Math.random() * 90
            b.x = Math.random() * engine.W - a.sx
            b.y = a.sy - nsy
            b.vx = 0
            b.vy = fromTop ? -220 : 220
          }
        }
      }
      this.current = anchor
    }
    this.center.x = a.sx
    this.center.y = a.sy

    this.intensity = damp(this.intensity, a.inView ? 1 : 0, 2, dt)
    this.material.uniforms.uOpacity.value = this.intensity
    this.group.visible = this.intensity > 0.01
    if (!this.group.visible) return

    const t = engine.time
    const avoid = THREE_CONFIG.beeInteraction && engine.interactive && engine.pointer.inside
    const mx = engine.pointer.x - a.sx
    const my = a.sy - engine.pointer.y
    const pos = this.aPos.array
    const data = this.aBee.array
    const n = this.count

    for (let i = 0; i < n; i++) {
      const b = this.bees[i]
      // "tổ": quỹ đạo elip chậm + lượn nhiễu
      const th = b.phase + t * b.speed
      const tx = Math.cos(th) * a.rx * b.orbit + noise1(t * 0.3 + b.seed) * a.rx * 0.25
      const ty = Math.sin(th * 1.37) * a.ry * b.orbit + noise1(t * 0.27 + b.seed + 50) * a.ry * 0.3
      let ax = (tx - b.x) * 1.5 - b.vx * 1.1
      let ay = (ty - b.y) * 1.5 - b.vy * 1.1
      // vo ve: rung nhanh, biên độ nhỏ
      ax += noise1(t * 5 + b.seed) * 160
      ay += noise1(t * 5.3 + b.seed + 9) * 160
      // tách nhau
      for (let j = 0; j < n; j++) {
        if (j === i) continue
        const o = this.bees[j]
        const dx = b.x - o.x
        const dy = b.y - o.y
        const d2 = dx * dx + dy * dy
        if (d2 < 1600 && d2 > 0.01) {
          const d = Math.sqrt(d2)
          ax += (dx / d) * (40 - d) * 6
          ay += (dy / d) * (40 - d) * 6
        }
      }
      // né chuột nhẹ
      if (avoid) {
        const dx = b.x - mx
        const dy = b.y - my
        const d = Math.hypot(dx, dy)
        if (d < 130 && d > 0.01) {
          const f = (1 - d / 130) * 1400
          ax += (dx / d) * f
          ay += (dy / d) * f
        }
      }
      b.vx += ax * dt
      b.vy += ay * dt
      const sp = Math.hypot(b.vx, b.vy)
      const maxSp = 320
      if (sp > maxSp) {
        b.vx *= maxSp / sp
        b.vy *= maxSp / sp
      }
      b.x += b.vx * dt
      b.y += b.vy * dt

      // đầu quay theo hướng bay (hình gốc quay trái), ngóc/chúc theo hướng dọc
      const face = b.vx > 8 ? -1 : b.vx < -8 ? 1 : Math.sign(b.flip) || 1
      b.flip = damp(b.flip, face, 10, dt)
      const tilt = sp > 15 ? clamp(-face * Math.atan2(b.vy, Math.abs(b.vx) + 0.001), -0.6, 0.6) : 0
      b.tilt = damp(b.tilt, tilt, 6, dt)

      const zz = b.z + Math.sin(t * 0.4 + b.phase) * 40
      const k = engine.scaleAt(zz)
      pos[i * 3] = (a.sx + b.x - engine.W / 2) * k
      pos[i * 3 + 1] = (engine.H / 2 - (a.sy - b.y)) * k
      pos[i * 3 + 2] = zz
      data[i * 4] = b.flip
      data[i * 4 + 1] = b.tilt
      data[i * 4 + 2] = b.phase
      data[i * 4 + 3] = b.size // phối cảnh tự làm ong gần to hơn
    }
    this.aPos.needsUpdate = true
    this.aBee.needsUpdate = true
  }
}
