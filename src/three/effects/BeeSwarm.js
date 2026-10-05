import { CanvasTexture, InstancedBufferAttribute, InstancedBufferGeometry, LinearMipmapLinearFilter, Mesh, PlaneGeometry, ShaderMaterial } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { clamp, damp, noise1 } from '../utils/noise.js'
import { createRandom } from '../utils/random.js'

const VERT = /* glsl */ `
uniform float uTime;
attribute vec3 aPos;
attribute vec4 aBee; // hướng (lật trái/phải), nghiêng, pha vỗ cánh (âm = đang đậu, cánh khép), cỡ (px)
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
  vFrame = aBee.z < 0.0 ? 1.0 : step(0.0, sin(uTime * 90.0 + aBee.z * 10.0)); // 2 khung hình cánh
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

/**
 * Sprite ong mật nhìn nghiêng, đầu quay trái (2 khung: cánh vỗ / cánh khép).
 * Màu thật: bụng hổ phách có khoanh nâu sẫm, ngực lông vàng nâu, cánh trong — không viền hoạt hình.
 */
export function beeAtlas() {
  const S = 128
  const cv = document.createElement('canvas')
  cv.width = S * 2
  cv.height = S
  const g = cv.getContext('2d')
  for (let f = 0; f < 2; f++) {
    g.save()
    g.translate(S * f + S / 2, S / 2 + 10)
    // chân
    g.strokeStyle = 'rgba(42, 29, 18, 0.85)'
    g.lineWidth = 2.2
    g.lineCap = 'round'
    for (const [x, dx] of [
      [-12, -6],
      [-4, 0],
      [4, 8],
    ]) {
      g.beginPath()
      g.moveTo(x, 8)
      g.quadraticCurveTo(x + dx * 0.5, 18, x + dx, 24)
      g.stroke()
    }
    // bụng: hổ phách, khoanh nâu sẫm mềm
    g.save()
    g.translate(20, 2)
    g.rotate(0.16)
    g.beginPath()
    g.ellipse(0, 0, 25, 15, 0, 0, Math.PI * 2)
    const belly = g.createLinearGradient(0, -15, 0, 15)
    belly.addColorStop(0, '#d9a23e')
    belly.addColorStop(1, '#93601c')
    g.fillStyle = belly
    g.fill()
    g.clip()
    for (const x of [-6, 5, 15]) {
      const band = g.createLinearGradient(x - 4, 0, x + 6, 0)
      band.addColorStop(0, 'rgba(48, 30, 14, 0)')
      band.addColorStop(0.35, 'rgba(48, 30, 14, 0.85)')
      band.addColorStop(0.75, 'rgba(48, 30, 14, 0.85)')
      band.addColorStop(1, 'rgba(48, 30, 14, 0)')
      g.fillStyle = band
      g.fillRect(x - 4, -16, 10, 32)
    }
    g.fillStyle = 'rgba(255, 236, 190, 0.35)'
    g.beginPath()
    g.ellipse(-2, -8, 16, 4, -0.1, 0, Math.PI * 2)
    g.fill()
    g.restore()
    // ngực: lông vàng nâu
    const tho = g.createRadialGradient(-8, -4, 2, -6, 0, 14)
    tho.addColorStop(0, '#b58a3e')
    tho.addColorStop(1, '#5e3f19')
    g.fillStyle = tho
    g.beginPath()
    g.arc(-6, 0, 12.5, 0, Math.PI * 2)
    g.fill()
    // đầu + mắt kép
    g.fillStyle = '#2e2014'
    g.beginPath()
    g.ellipse(-22, 2, 8.5, 9.5, 0.2, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = 'rgba(120, 96, 70, 0.55)'
    g.beginPath()
    g.ellipse(-23, -1, 3.5, 5, 0.2, 0, Math.PI * 2)
    g.fill()
    // râu gập khuỷu
    g.strokeStyle = 'rgba(42, 29, 18, 0.9)'
    g.lineWidth = 1.6
    g.beginPath()
    g.moveTo(-25, -6)
    g.lineTo(-30, -14)
    g.lineTo(-37, -13)
    g.stroke()
    // cánh trong, gân mảnh — khung 0 vỗ lên, khung 1 khép dọc lưng
    const wings = f
      ? [
          [-2, -8, -0.1, 24, 8],
          [4, -6, 0.05, 20, 7],
        ]
      : [
          [-4, -10, -1.05, 23, 9],
          [2, -9, -0.7, 19, 8],
        ]
    for (const [x, y, rot, rx, ry] of wings) {
      g.save()
      g.translate(x, y)
      g.rotate(rot)
      g.beginPath()
      g.ellipse(rx * 0.9, 0, rx, ry, 0, 0, Math.PI * 2)
      g.fillStyle = 'rgba(228, 236, 240, 0.5)'
      g.fill()
      g.strokeStyle = 'rgba(70, 60, 50, 0.22)'
      g.lineWidth = 1
      g.stroke()
      g.beginPath()
      g.moveTo(2, 0)
      g.lineTo(rx * 1.5, -ry * 0.2)
      g.stroke()
      g.restore()
    }
    g.restore()
  }
  const tex = new CanvasTexture(cv)
  tex.minFilter = LinearMipmapLinearFilter
  tex.anisotropy = 4
  return tex
}

/**
 * Đàn ong đi kiếm mật (sprite + instancing, 1 draw call).
 * Mỗi con: bay tới một bông hoa (lao ngắn, có chao nhẹ) → lơ lửng một nhịp → đậu, khép cánh vài giây
 * → sang bông gần đó (thỉnh thoảng bay xa hơn). Không bay vòng quanh một tâm.
 *
 * anchors: [{ get() → { sx, sy, inView, visibility, targets: [{ x, y, z }], max } }]
 *   sx, sy: gốc toạ độ trên màn hình; targets: chỗ hoa, tính tương đối với gốc (y hướng xuống).
 * Toạ độ ong tính tương đối với gốc nên cả đàn cuộn theo trang. Ong chỉ ở nơi có hoa —
 * không bay đè lên chữ hay ảnh.
 */
export class BeeSwarm extends Effect {
  constructor(engine, { anchors }) {
    super(engine, 'Đàn ong')
    this.anchors = anchors
    this.current = null
    const max = THREE_CONFIG.bees.high
    this.max = max
    this.rnd = createRandom(11)
    const rnd = this.rnd
    this.bees = Array.from({ length: max }, (_, i) => ({
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      state: 'new',
      timer: 0,
      target: -1,
      size: rnd.range(22, 27),
      speed: rnd.range(0.8, 1.15),
      seed: i * 7.31,
      phase: rnd.range(0, 6.28),
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
      if (v && v.inView && v.targets.length && v.visibility > bestVis) {
        best = a
        bestVis = v.visibility
      }
    }
    if (!best) return this.current || this.anchors[0]
    if (this.current && best !== this.current) {
      const cur = this.current.get()
      if (cur?.inView && cur.targets.length && cur.visibility + 0.12 > bestVis) return this.current
    }
    return best
  }

  /** Bông kế tiếp: phần lớn là bông gần, thỉnh thoảng bay xa hơn. */
  nextTarget(b, targets, scale) {
    const rnd = this.rnd
    if (targets.length < 2 || rnd.next() < 0.22) return Math.floor(rnd.next() * targets.length)
    const from = targets[b.target] || { x: b.x, y: b.y }
    const near = []
    const reach = 260 * scale
    for (let k = 0; k < targets.length; k++) {
      if (k === b.target) continue
      const d = Math.hypot(targets[k].x - from.x, targets[k].y - from.y)
      if (d < reach) near.push(k)
    }
    const pool = near.length ? near : targets.map((_, k) => k)
    return pool[Math.floor(rnd.next() * pool.length)]
  }

  takeOff(b, targets, scale) {
    b.target = this.nextTarget(b, targets, scale)
    b.state = 'fly'
    b.vy -= 60 * scale // cất cánh: bật lên một chút
  }

  update(dt, engine) {
    if (!this.count) {
      this.group.visible = false
      return
    }
    const anchor = this.pickAnchor()
    const a = anchor.get()
    if (!a) return
    const targets = a.targets
    const scale = clamp(engine.W / 1440, 0.62, 1) // ong nhỏ lại trên màn hình nhỏ
    const n = Math.min(this.count, a.max ?? this.count)

    if (anchor !== this.current) {
      const prev = this.current && this.current.get()
      for (let i = 0; i < this.max; i++) {
        const b = this.bees[i]
        // ong mới / ong ở rất xa → đặt ngay sát mép màn hình để bay vào trong 1–2 giây;
        // ong lần đầu xuất hiện thì đậu sẵn trên hoa
        if (b.state === 'new' || !prev || !targets.length) {
          const k = Math.floor(this.rnd.next() * targets.length)
          const t = targets[k]
          if (!t) continue
          Object.assign(b, { x: t.x, y: t.y, z: t.z, vx: 0, vy: 0, target: k, state: 'rest', timer: this.rnd.range(0.3, 2.5) })
          continue
        }
        b.x += prev.sx - a.sx
        b.y += prev.sy - a.sy
        const sy = a.sy + b.y
        if (sy < -engine.H * 0.5 || sy > engine.H * 1.5) {
          const fromTop = sy < 0
          b.x = this.rnd.range(0.1, 0.9) * engine.W - a.sx
          b.y = (fromTop ? -40 : engine.H + 40) - a.sy
          b.vx = 0
          b.vy = fromTop ? 180 : -180
        }
        b.target = Math.floor(this.rnd.next() * targets.length)
        b.state = 'fly'
      }
      this.current = anchor
    }

    this.intensity = damp(this.intensity, a.inView ? 1 : 0, 2, dt)
    this.material.uniforms.uOpacity.value = this.intensity
    this.group.visible = this.intensity > 0.01
    if (!this.group.visible || !targets.length) return

    const t = engine.time
    const avoid = THREE_CONFIG.beeInteraction && engine.interactive && engine.pointer.inside
    const mx = engine.pointer.x - a.sx
    const my = engine.pointer.y - a.sy
    const pos = this.aPos.array
    const data = this.aBee.array

    for (let i = 0; i < this.max; i++) {
      const b = this.bees[i]
      if (i >= n) {
        data[i * 4 + 3] = 0 // con thừa so với điểm neo này (vd Hero chỉ 3 con) → ẩn
        continue
      }
      if (b.target >= targets.length || b.target < 0) b.target = Math.floor(this.rnd.next() * targets.length)
      const T = targets[b.target]
      const tx = T.x
      const ty = T.y - 5 * scale // đậu ngay trên nhuỵ
      const dx = tx - b.x
      const dy = ty - b.y
      const dist = Math.hypot(dx, dy)
      b.timer -= dt

      if (b.state === 'fly') {
        // lao tới hoa, chậm lại khi gần; chao nhẹ vuông góc hướng bay
        const maxSp = 230 * scale * b.speed
        const want = Math.min(1, dist / (90 * scale))
        const ux = dx / (dist || 1)
        const uy = dy / (dist || 1)
        const wob = noise1(t * 2.2 + b.seed) * 70 * scale * want
        let ax = (ux * maxSp * want - b.vx) * 4 - uy * wob
        let ay = (uy * maxSp * want - b.vy) * 4 + ux * wob
        if (avoid) {
          const ex = b.x - mx
          const ey = b.y - my
          const d = Math.hypot(ex, ey)
          if (d < 120 && d > 0.01) {
            ax += (ex / d) * (1 - d / 120) * 1600
            ay += (ey / d) * (1 - d / 120) * 1600
          }
        }
        b.vx += ax * dt
        b.vy += ay * dt
        b.z = damp(b.z, T.z, 1.5, dt)
        if (dist < 7 * scale) {
          b.state = 'hover'
          b.timer = this.rnd.range(0.35, 0.9)
        }
      } else if (b.state === 'hover') {
        // lơ lửng sát hoa, rung nhẹ, rồi hạ xuống
        const jx = noise1(t * 6 + b.seed) * 3 * scale
        const jy = noise1(t * 6.4 + b.seed + 9) * 2.5 * scale
        b.vx = damp(b.vx, (dx + jx) * 6, 8, dt)
        b.vy = damp(b.vy, (dy + jy - 6 * scale) * 6, 8, dt)
        if (b.timer <= 0) {
          b.state = 'rest'
          b.timer = this.rnd.range(1.4, 4)
        }
      } else {
        // đậu: bám theo bông hoa (hoa lay theo gió), cánh khép
        b.vx = 0
        b.vy = 0
        b.x = damp(b.x, tx, 10, dt)
        b.y = damp(b.y, ty, 10, dt)
        const scared = avoid && Math.hypot(b.x - mx, b.y - my) < 70
        if (b.timer <= 0 || scared) this.takeOff(b, targets, scale)
      }
      b.x += b.vx * dt
      b.y += b.vy * dt

      const sp = Math.hypot(b.vx, b.vy)
      // đầu quay theo hướng bay (hình gốc quay trái), ngóc/chúc theo hướng dọc
      const face = b.vx > 10 ? -1 : b.vx < -10 ? 1 : Math.sign(b.flip) || 1
      b.flip = damp(b.flip, face, 12, dt)
      const tilt = b.state === 'fly' && sp > 20 ? clamp(face * Math.atan2(b.vy, Math.abs(b.vx) + 0.001), -0.5, 0.5) : 0
      b.tilt = damp(b.tilt, tilt, 6, dt)

      const k = engine.scaleAt(b.z)
      pos[i * 3] = (a.sx + b.x - engine.W / 2) * k
      pos[i * 3 + 1] = (engine.H / 2 - (a.sy + b.y)) * k
      pos[i * 3 + 2] = b.z
      data[i * 4] = b.flip
      data[i * 4 + 1] = b.tilt
      data[i * 4 + 2] = b.state === 'rest' ? -1 : b.phase
      data[i * 4 + 3] = b.size * scale // phối cảnh tự làm ong ở hàng hoa gần to hơn
    }
    this.aPos.needsUpdate = true
    this.aBee.needsUpdate = true
  }
}

// sprite ong dùng chung với con ong dẫn đường (GuideBee)
export { VERT as BEE_VERT, FRAG as BEE_FRAG }
