import { BufferAttribute, BufferGeometry, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, PlaneGeometry, Points, ShaderMaterial, Vector3 } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { clamp, damp, noise1 } from '../utils/noise.js'
import { BEE_FRAG, BEE_VERT, beeAtlas } from './BeeSwarm.js'

/**
 * ONG DẪN ĐƯỜNG — một con ong theo người xem suốt trang: cuộn tới phần nào, ong bay tới lượn quanh
 * thứ quan trọng nhất của phần đó (phần tử có data-bee-perch), phần tử ấy sáng viền lên. Ong không
 * bao giờ đậu: luôn vỗ cánh, lượn hình số 8 lững lờ cạnh phần tử, thỉnh thoảng dạt sang một chỗ gần
 * đó; người xem dừng cuộn để đọc thì ong bay một vòng quanh (nút nhỏ: quanh cả nút). Chuột sà tới thì
 * ong né ra. Bay từ phần này sang phần khác để lại vệt phấn hoa mờ dần — nối các chỗ thành một chuỗi.
 *
 * Đánh dấu chỗ ong lượn trong JSX:
 *   data-bee-perch="top-right" | "top-left" | "top"  → lượn trên mép trên phần tử (mặc định top-right)
 *   data-bee-perch="0.5,0.3"                          → lượn quanh điểm (x, y) tính theo tỉ lệ khung (vd. trên miếng tổ 3D)
 *   data-bee-glow="off"                               → không sáng viền (ảnh, khung 3D)
 * Ong chọn chỗ nằm gần giữa màn hình nhất; không có chỗ nào thì lượn ở mép phải.
 */

const FOCUS = 0.48 // đường "chú ý" ở 48% chiều cao màn hình
const KEEP = 90 // px — chỗ mới phải gần đường chú ý hơn chỗ đang lượn chừng này mới đổi (đỡ nhảy qua lại)
const MAX_SPEED = 1500 // px/s — cuộn nhanh vẫn đuổi kịp
const ARRIVE = 46 // px — tới gần thế này thì chuyển từ bay sang lượn
const TRAIL = 90
const SCAN = 1 // s — quét lại danh sách chỗ lượn (phần tử hiện/ẩn theo dữ liệu)
const READING = 1.2 // s không cuộn → coi như người xem đang dừng lại đọc
const _w = new Vector3()

const TRAIL_VERT = /* glsl */ `
attribute float aLife;
uniform float uSize;
uniform float uPR;
varying float vLife;
void main() {
  vLife = aLife;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * uPR * (0.45 + 0.55 * aLife);
}
`
const TRAIL_FRAG = /* glsl */ `
uniform float uOpacity;
varying float vLife;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.15, r) * vLife * 0.6 * uOpacity;
  if (a < 0.01) discard;
  gl_FragColor = vec4(mix(vec3(0.84, 0.58, 0.16), vec3(0.98, 0.83, 0.45), smoothstep(0.35, 0.0, r)), a);
}
`


/** Tâm vùng lượn (px màn hình) theo data-bee-perch — cao hơn mép trên một chút để ong không che chữ. */
function anchor(el, r, scale) {
  const spec = el.dataset.beePerch || 'top-right'
  const inset = Math.min(34, r.width * 0.2)
  if (spec.includes(',')) {
    const [fx, fy] = spec.split(',').map(Number)
    return { x: r.left + r.width * fx, y: r.top + r.height * fy - 14 * scale }
  }
  const x = spec === 'top-left' ? r.left + inset : spec === 'top' ? r.left + r.width / 2 : r.right - inset
  return { x, y: r.top - 26 * scale }
}

/** Vòng bay quanh: nút/thẻ nhỏ → quanh cả phần tử; ảnh, khung lớn → một vòng nhỏ quanh tâm vùng lượn. */
function orbit(r, A, scale) {
  if (r.width <= 360 && r.height <= 140) {
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, rx: r.width / 2 + 30 * scale, ry: r.height / 2 + 26 * scale }
  }
  return { x: A.x, y: A.y, rx: 64 * scale, ry: 34 * scale }
}

export class GuideBee extends Effect {
  constructor(engine) {
    super(engine, 'Ong dẫn đường')
    const geo = new InstancedBufferGeometry()
    const plane = new PlaneGeometry(1, 1)
    geo.index = plane.index
    geo.setAttribute('position', plane.attributes.position)
    geo.setAttribute('uv', plane.attributes.uv)
    this.aPos = new InstancedBufferAttribute(new Float32Array(3), 3)
    this.aBee = new InstancedBufferAttribute(new Float32Array(4), 4)
    geo.setAttribute('aPos', this.aPos)
    geo.setAttribute('aBee', this.aBee)
    geo.instanceCount = 1
    this.material = new ShaderMaterial({
      vertexShader: BEE_VERT,
      fragmentShader: BEE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: { uTime: engine.uniforms.uTime, uMap: { value: beeAtlas() }, uOpacity: { value: 0 } },
    })
    this.bee = new Mesh(geo, this.material)
    this.bee.frustumCulled = false
    this.bee.renderOrder = 12
    this.group.add(this.bee)

    // vệt phấn: toạ độ theo TRANG (x, y + scrollY) → nằm yên trên trang, cuộn theo nội dung
    this.dots = { page: new Float32Array(TRAIL * 2), life: new Float32Array(TRAIL), next: 0 }
    const tg = new BufferGeometry()
    this.trailPos = new BufferAttribute(new Float32Array(TRAIL * 3), 3)
    this.trailLife = new BufferAttribute(this.dots.life, 1)
    tg.setAttribute('position', this.trailPos)
    tg.setAttribute('aLife', this.trailLife)
    this.trailMat = new ShaderMaterial({
      vertexShader: TRAIL_VERT,
      fragmentShader: TRAIL_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: { uOpacity: { value: 0 }, uSize: { value: 7 }, uPR: { value: 1 } },
    })
    this.trail = new Points(tg, this.trailMat)
    this.trail.frustumCulled = false
    this.trail.renderOrder = 11
    this.group.add(this.trail)

    this.p = { x: -200, y: -200 }
    this.v = { x: 0, y: 0 }
    this.state = 'away' // away | travel (bay sang chỗ mới) | hover (lượn số 8) | loop (bay một vòng quanh)
    this.spot = null // phần tử đang lượn quanh / đang bay tới
    this.spots = []
    this.scanT = 0
    this.lastA = null // tâm vùng lượn khung trước — lấy vận tốc cuộn để bám theo không trễ
    this.drift = { x: 0, y: 0 } // chỗ dạt tới quanh tâm vùng lượn
    this.driftTo = { x: 0, y: 0 }
    this.driftT = 0
    this.phase = 0 // pha hình số 8
    this.loop = null // { t, D, dir, a0 }
    this.sinceLoop = 0
    this.idle = 0
    this.lastScroll = 0
    this.flip = 1
    this.tilt = 0
    this.lastDrop = { x: 0, y: 0 }
    this.count = 1
  }

  setQuality(q, engine) {
    this.enabled = THREE_CONFIG.effects.guideBee && !engine.reduced
  }

  /** Chỗ gần đường chú ý nhất trong số phần tử đang hiện trên màn hình. */
  pick(engine, scale) {
    const top = 90 // dưới navbar
    let best = null
    let bestScore = Infinity
    let curScore = Infinity
    for (const el of this.spots) {
      if (!el.isConnected || !el.offsetParent) continue
      const r = el.getBoundingClientRect()
      if (!r.width || r.bottom < top + 20 || r.top > engine.H - 40) continue
      const A = anchor(el, r, scale)
      if (A.y < top || A.y > engine.H - 30) continue
      const score = Math.abs(r.top + r.height / 2 - engine.H * FOCUS)
      if (el === this.spot) curScore = score
      if (score < bestScore) {
        bestScore = score
        best = el
      }
    }
    if (this.spot && curScore < Infinity && curScore - bestScore < KEEP) return this.spot
    return best
  }

  glow(el) {
    if (el === this.lit) return
    this.lit?.classList.remove('bee-perched')
    el?.classList.add('bee-perched')
    this.lit = el
  }

  drop(scrollY, size) {
    const d = this.dots
    const i = d.next
    d.page[i * 2] = this.p.x
    d.page[i * 2 + 1] = this.p.y + size * 0.15 + scrollY
    d.life[i] = 1
    d.next = (i + 1) % TRAIL
    this.lastDrop.x = this.p.x
    this.lastDrop.y = this.p.y
  }

  update(dt, engine) {
    const on = this.enabled
    this.intensity = damp(this.intensity, on && this.spots.length ? 1 : 0, 2.5, dt)
    this.group.visible = this.intensity > 0.01
    if (!on) {
      this.glow(null)
      if (!this.group.visible) return
    }
    this.scanT -= dt
    if (this.scanT <= 0) {
      this.scanT = SCAN
      this.spots = [...document.querySelectorAll('[data-bee-perch]')]
    }

    const t = engine.time
    const scale = clamp(engine.W / 1440, 0.72, 1)
    const size = 50 * scale
    const scrollY = window.scrollY
    this.idle = Math.abs(scrollY - this.lastScroll) > 0.5 ? 0 : this.idle + dt
    this.lastScroll = scrollY
    const target = on ? this.pick(engine, scale) : null

    // tâm vùng lượn: quanh phần tử, hoặc mép phải khi phần này không có gì để chỉ
    let rect = null
    let A
    if (target) {
      rect = target.getBoundingClientRect()
      A = anchor(target, rect, scale)
    } else {
      A = { x: engine.W - 70 * scale, y: engine.H * 0.3 }
    }

    if (target !== this.spot) {
      if (this.state === 'away') {
        this.p.x = engine.W + 40 // lần đầu: bay vào từ mép phải
        this.p.y = engine.H * 0.25
      }
      this.spot = target
      this.state = 'travel'
      this.lastA = null
      this.glow(null)
    }

    // vận tốc của tâm vùng lượn (trang cuộn) — cộng vào để ong bám theo phần tử, không bị tụt lại
    const ax = this.lastA ? clamp((A.x - this.lastA.x) / Math.max(dt, 1e-3), -MAX_SPEED, MAX_SPEED) : 0
    const ay = this.lastA ? clamp((A.y - this.lastA.y) / Math.max(dt, 1e-3), -MAX_SPEED, MAX_SPEED) : 0
    this.lastA = A

    let vx
    let vy
    if (this.state === 'travel') {
      // bay sang chỗ mới: lao tới, chậm dần khi gần, chao nhẹ vuông góc hướng bay (đường cong như ong thật)
      const dx = A.x - this.p.x
      const dy = A.y - this.p.y
      const dist = Math.hypot(dx, dy)
      const ux = dx / (dist || 1)
      const uy = dy / (dist || 1)
      const sp = Math.min(MAX_SPEED, dist * 3 + 60)
      const wob = noise1(t * 1.8 + 3) * 140 * Math.min(1, dist / 220)
      vx = ux * sp - uy * wob
      vy = uy * sp + ux * wob
      if (dist < ARRIVE) {
        this.state = 'hover'
        this.phase = Math.atan2(this.p.y - A.y, this.p.x - A.x) // vào số 8 từ phía đang tới, không giật
        this.drift.x = this.drift.y = 0
        this.driftTo.x = this.driftTo.y = 0
        this.driftT = 2 + Math.random() * 2
        this.sinceLoop = 0
        if (target && target.dataset.beeGlow !== 'off') this.glow(target)
      }
    } else if (this.state === 'loop') {
      // một vòng elip quanh phần tử (nhấp nhô nhẹ), xong thì quay về lượn
      const L = this.loop
      const o = orbit(rect, A, scale)
      if (L.a0 === null) L.a0 = Math.atan2((this.p.y - o.y) / o.ry, (this.p.x - o.x) / o.rx)
      L.t += dt
      const u = Math.min(1, L.t / L.D)
      const e = u * u * (3 - 2 * u)
      const a = L.a0 + L.dir * Math.PI * 2 * e
      const gx = o.x + Math.cos(a) * o.rx
      const gy = o.y + Math.sin(a) * o.ry - Math.sin(e * Math.PI * 3) * 6 * scale
      vx = (gx - this.p.x) * 5 + ax
      vy = (gy - this.p.y) * 5 + ay
      if (u >= 1) {
        this.state = 'hover'
        this.sinceLoop = 0
        this.phase = Math.atan2(this.p.y - A.y, this.p.x - A.x)
      }
    } else {
      // lượn: hình số 8 lững lờ (biên độ, nhịp đổi chậm theo nhiễu) quanh một chỗ dạt gần tâm vùng lượn
      this.driftT -= dt
      if (this.driftT <= 0) {
        this.driftT = 2.5 + Math.random() * 3
        this.driftTo.x = (Math.random() * 2 - 1) * 34 * scale
        this.driftTo.y = (Math.random() * 2 - 1) * 10 * scale
      }
      this.drift.x = damp(this.drift.x, this.driftTo.x, 0.9, dt)
      this.drift.y = damp(this.drift.y, this.driftTo.y, 0.9, dt)
      this.phase += dt * (1.45 + noise1(t * 0.3 + 7) * 0.35)
      const rx = (24 + noise1(t * 0.21 + 2) * 8) * scale
      const ry = (9 + noise1(t * 0.27 + 5) * 3) * scale
      const gx = A.x + this.drift.x + Math.sin(this.phase) * rx
      const gy = A.y + this.drift.y + Math.sin(this.phase * 2) * ry + noise1(t * 0.6 + 9) * 4 * scale
      vx = (gx - this.p.x) * 3.2 + ax
      vy = (gy - this.p.y) * 3.2 + ay
      this.sinceLoop += dt
      // người xem dừng lại đọc → thỉnh thoảng bay một vòng quanh phần tử
      if (rect && this.idle > READING && this.sinceLoop > 6 && Math.random() < dt * 0.25) {
        this.state = 'loop'
        this.loop = { t: 0, D: 2.8 + Math.random() * 0.8, dir: Math.random() < 0.5 ? 1 : -1, a0: null }
      }
    }

    // chuột sà tới → né ra (đẩy theo hướng ngược chuột, mạnh dần khi càng gần)
    const pointer = engine.pointer
    if (engine.interactive && pointer.inside) {
      const px = this.p.x - pointer.x
      const py = this.p.y - pointer.y
      const d = Math.hypot(px, py)
      if (d < 70) {
        const push = (1 - d / 70) * 520
        vx += (px / (d || 1)) * push
        vy += (py / (d || 1)) * push - push * 0.3
      }
    }

    // tăng tốc êm về vận tốc mong muốn (quán tính → đường bay mượt, không giật)
    const k = Math.min(1, (this.state === 'travel' ? 5.5 : 4) * dt)
    this.v.x += (clamp(vx, -MAX_SPEED, MAX_SPEED) - this.v.x) * k
    this.v.y += (clamp(vy, -MAX_SPEED, MAX_SPEED) - this.v.y) * k
    this.p.x += this.v.x * dt
    this.p.y += this.v.y * dt
    if (this.state !== 'hover' && Math.hypot(this.p.x - this.lastDrop.x, this.p.y - this.lastDrop.y) > 15) this.drop(scrollY, size)

    // hướng mặt theo chiều bay ngang (so với trang, bỏ phần cuộn); bay chậm thì giữ hướng cũ (hình gốc quay trái)
    const rvx = this.v.x - ax
    const rvy = this.v.y - ay
    const face = rvx > 40 ? -1 : rvx < -40 ? 1 : Math.sign(this.flip) || 1
    this.flip = damp(this.flip, face, 10, dt)
    const speed = Math.hypot(rvx, rvy)
    const tilt = speed > 20 ? clamp(face * Math.atan2(rvy, Math.abs(rvx) + 0.001), -0.5, 0.5) * Math.min(1, speed / 160) : 0
    this.tilt = damp(this.tilt, tilt, 5, dt)

    const pos = engine.toWorld(this.p.x, this.p.y, 0, _w)
    this.aPos.array.set([pos.x, pos.y, 0])
    this.aBee.array.set([this.flip, this.tilt, 1.3, size]) // luôn vỗ cánh
    this.aPos.needsUpdate = true
    this.aBee.needsUpdate = true
    this.material.uniforms.uOpacity.value = this.intensity

    // vệt phấn: phai dần, rơi nhẹ
    const d = this.dots
    const arr = this.trailPos.array
    for (let i = 0; i < TRAIL; i++) {
      if (d.life[i] > 0) {
        d.life[i] = Math.max(0, d.life[i] - dt / 1.8)
        d.page[i * 2 + 1] += 8 * dt
      }
      const w = engine.toWorld(d.page[i * 2], d.page[i * 2 + 1] - scrollY, 0, _w)
      arr[i * 3] = w.x
      arr[i * 3 + 1] = w.y
      arr[i * 3 + 2] = 0
    }
    this.trailPos.needsUpdate = true
    this.trailLife.needsUpdate = true
    const tu = this.trailMat.uniforms
    tu.uOpacity.value = this.intensity
    tu.uSize.value = 7 * scale
    tu.uPR.value = engine.pixelRatio
  }

  dispose() {
    this.glow(null)
    super.dispose()
  }
}
