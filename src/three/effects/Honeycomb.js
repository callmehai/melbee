import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  DynamicDrawUsage,
  ExtrudeGeometry,
  Group,
  Mesh,
  Path,
  Quaternion,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
} from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { HONEY, NOISE, rawColor } from '../shaders/index.js'
import { acquireDropGeometry, createHoneyMaterial, releaseDropGeometry, setHoneyOpacity } from './honey.js'
import { createRandom } from '../utils/random.js'
import { clamp, damp, noise1, noise2, smoothstep } from '../utils/noise.js'

// ── hình học bánh tổ (đơn vị: bán kính ô = 1) ───────────────
const SQ3 = Math.sqrt(3)
const WALL = 0.1 // nửa bề dày vách sáp
const DEPTH = 1.5 // độ sâu ô (từ mép vách tới đáy)
const BEVEL_T = 0.05
const BEVEL_S = 0.04
const SPAN_X = 8.4 // nửa bề ngang miếng tổ (siêu elip, có nhiễu ở mép)
const SPAN_Y = 7.2
const SIZE = 0.64 // miếng tổ rộng bằng ~64% khung

// ô lục giác đỉnh nhọn: góc i ở PI/6 + i·PI/3; cạnh i (góc i → i+1) giáp ô bên theo hướng trục (dq, dr)
const EDGE_NEIGHBOR = [
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 0],
]
const corner = (x, y, r, i) => {
  const a = Math.PI / 6 + (i * Math.PI) / 3
  return [x + r * Math.cos(a), y + r * Math.sin(a)]
}

// ── chuyển động ─────────────────────────────────────────────
const BASE = { x: 0.14, y: -0.32, z: -0.06 } // tư thế nghỉ: nghiêng ¾ cho thấy bề dày, cạnh phải đón nắng
const SPRING = 46 // lò xo xoay: thấp → lắc lâu, mềm
const SPRING_DRAG = 130
const DAMPING = 4.2 // < 2·√SPRING → dao động tắt dần (miếng sáp rung rinh rồi mới đứng yên)
const SHAKE_RELEASE = 3.2 // tốc độ xoay (rad/s) đủ để văng giọt mật

// ── giọt mật treo ───────────────────────────────────────────
const LINKS = 8 // số điểm của chuỗi mô phỏng
const RING = 8 // số đỉnh quanh tiết diện sợi
const SAMPLES = 22 // số khúc khi vẽ sợi
const GRAVITY = 900 // px/s² — mật nặng, chảy chậm
const FALL_GRAVITY = 1500
const VISCOSITY = 4.5 // càng lớn sợi càng ít đung đưa
const SUBSTEP = 1 / 120
const STRANDS = { high: 3, medium: 2, low: 1 }

// mặt trời chung của trang (thấp bên phải, hơi chếch lên) — cùng hướng với tranh và tia nắng
const LIGHT = new Vector3(0.62, 0.38, 0.69).normalize()

const VERT = /* glsl */ `
#ifdef CELLS
attribute vec2 aCell;
attribute float aRand;
attribute float aLevel;
varying vec2 vCell;
varying float vRand;
varying float vLevel;
#endif
varying vec3 vN;
varying vec3 vW;
varying vec3 vL;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vL = position;
  vN = normalize(mat3(modelMatrix) * normal);
#ifdef CELLS
  vCell = aCell;
  vRand = aRand;
  vLevel = aLevel;
#endif
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

// hiện/ẩn bằng vân loang (giữ vật liệu đục, không phải sắp xếp lớp trong suốt)
const DISSOLVE = /* glsl */ `
uniform float uOpacity;
void dissolve(vec3 p) {
  if (snoise(p * 0.45) * 0.5 + 0.5 > uOpacity * 1.05 - 0.02) discard;
}
`

// sáp ong: mép vách ngà nhạt, sâu vào trong ngả hổ phách (mật thấm vào sáp), khe sâu tối dần;
// sáp mỏng nên nắng xuyên được — mặt khuất nắng vẫn ấm chứ không xám
const WAX_FRAG = /* glsl */ `
${NOISE}
${DISSOLVE}
uniform vec3 uRim;
uniform vec3 uWall;
uniform vec3 uFloor;
uniform vec3 uCap;
uniform vec3 uSun;
uniform vec3 uLightDir;
uniform float uDepth;
varying vec3 vN;
varying vec3 vW;
varying vec3 vL;
#ifdef CELLS
varying vec2 vCell;
varying float vRand;
varying float vLevel;
#endif
void main() {
  dissolve(vL);
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vW);
#ifdef CELLS
  // nắp sáp: mịn, mờ, mỗi nắp đậm nhạt một chút
  vec3 base = uCap * (0.95 + 0.08 * vRand);
  float depth = 0.0;
  float lift = 0.16; // nắp sáp mỏng, sáng hơn vách
#else
  float depth = clamp(-vL.z / uDepth, 0.0, 1.0);
  vec3 base = mix(uRim, uWall, smoothstep(0.0, 0.3, depth));
  base = mix(base, uFloor, smoothstep(0.35, 1.0, depth));
  float lift = 0.0;
#endif
  base *= 0.96 + 0.05 * snoise(vL * 0.7);
  float ndl = dot(N, uLightDir);
  float wrap = clamp((ndl + 0.5) / 1.5, 0.0, 1.0);
  float ao = 1.0 - 0.55 * smoothstep(0.05, 1.0, depth);
  // phía khuất nắng ngả nâu ấm (sáp mỏng, ánh sáng tán bên trong) chứ không xám
  vec3 col = base * (vec3(0.5, 0.4, 0.27) + lift + 0.72 * wrap) * ao;
  col += uSun * base * clamp(-ndl, 0.0, 1.0) * 0.3 * (1.0 - 0.5 * depth);
  float nh = max(dot(N, normalize(uLightDir + V)), 0.0);
  col += vec3(1.0, 0.96, 0.86) * pow(nh, 24.0) * 0.16 * (1.0 - depth);
  col += uRim * pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.12;
  gl_FragColor = vec4(col, 1.0);
}
`

// mặt mật trong ô: nắng chiếu từ phải xuyên qua mật → vầng sáng ở phía trái mỗi ô
const CELL_HONEY_FRAG = /* glsl */ `
${NOISE}
${DISSOLVE}
${HONEY}
uniform float uTime;
uniform vec2 uLightCell;
varying vec3 vN;
varying vec3 vW;
varying vec3 vL;
varying vec2 vCell;
varying float vRand;
varying float vLevel;
void main() {
  dissolve(vL);
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float swirl = snoise(vec3(vL.xy * 0.6, uTime * 0.06 + vRand * 7.0));
  float thick = clamp(0.6 + 0.22 * (1.0 - vLevel) + 0.2 * (vRand - 0.5) + 0.04 * swirl, 0.0, 1.0);
  // nắng xuyên qua mật, sáng lên ở mép ô phía khuất nắng
  float r = length(vCell);
  float glow = smoothstep(0.55, 1.0, r) * smoothstep(-0.2, 0.9, dot(vCell / max(r, 1e-3), -uLightCell)) * 0.45 + 0.08;
  gl_FragColor = vec4(honeyColor(N, V, thick, glow), 1.0);
}
`

// cổ giọt mật: giữa dày (đậm), hai mép mỏng (sáng, trong)
const STRAND_FRAG = /* glsl */ `
${HONEY}
uniform float uOpacity;
varying vec3 vN;
varying vec3 vW;
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  vec3 col = honeyColor(N, V, pow(ndv, 0.7) * 0.75, 0.25 * ndv);
  gl_FragColor = vec4(col, (0.78 + 0.22 * pow(1.0 - ndv, 3.0)) * uOpacity);
}
`

/**
 * Chọn các ô của miếng tổ: một siêu elip có mép nhiễu, bỏ ô thừa lẻ loi, lấp lỗ.
 * Trả về danh sách ô (toạ độ trục q, r + tâm x, y) và đường viền ngoài đi theo cạnh ô.
 */
function buildCells(seed) {
  const rnd = createRandom(seed)
  const id = (q, r) => `${q},${r}`
  const center = (q, r) => [SQ3 * (q + r / 2), -1.5 * r]
  const inside = new Set()
  const QR = 11
  for (let r = -QR; r <= QR; r++) {
    for (let q = -QR - 6; q <= QR + 6; q++) {
      const [x, y] = center(q, r)
      const a = Math.atan2(y / SPAN_Y, x / SPAN_X)
      const d = Math.abs(x / SPAN_X) ** 3 + Math.abs(y / SPAN_Y) ** 3
      // mép trên cắt khá thẳng (miếng tổ cắt ra), mép dưới loang lổ hơn
      const edge = 1 + 0.18 * noise1(a * 2.2 + 3.1) + (y < 0 ? 0.16 * noise1(a * 5 + 9) : 0)
      if (d < edge) inside.add(id(q, r))
    }
  }
  const neighbors = (q, r) => EDGE_NEIGHBOR.map(([dq, dr]) => [q + dq, r + dr])
  // ô lẻ loi (ít hơn 3 ô bên cạnh) làm mép xấu → bỏ
  for (let pass = 0; pass < 2; pass++) {
    for (const k of [...inside]) {
      const [q, r] = k.split(',').map(Number)
      if (neighbors(q, r).filter(([a, b]) => inside.has(id(a, b))).length < 3) inside.delete(k)
    }
  }
  // lấp lỗ: ô trống nào không đi ra được ngoài khung → thuộc miếng tổ
  const outside = new Set()
  const queue = []
  for (let r = -QR - 1; r <= QR + 1; r++) {
    for (let q = -QR - 8; q <= QR + 8; q++) {
      const edge = r === -QR - 1 || r === QR + 1 || q === -QR - 8 || q === QR + 8
      if (edge && !inside.has(id(q, r))) {
        outside.add(id(q, r))
        queue.push([q, r])
      }
    }
  }
  while (queue.length) {
    const [q, r] = queue.pop()
    for (const [a, b] of neighbors(q, r)) {
      const k = id(a, b)
      if (Math.abs(b) > QR + 1 || Math.abs(a) > QR + 8 || inside.has(k) || outside.has(k)) continue
      outside.add(k)
      queue.push([a, b])
    }
  }
  for (let r = -QR; r <= QR; r++) {
    for (let q = -QR - 6; q <= QR + 6; q++) if (!outside.has(id(q, r))) inside.add(id(q, r))
  }

  // đường viền: các cạnh ô không giáp ô nào khác, nối đầu-đuôi thành một vòng
  const vkey = ([x, y]) => `${Math.round(x * 1000)},${Math.round(y * 1000)}`
  const edges = new Map()
  const cells = []
  for (const k of inside) {
    const [q, r] = k.split(',').map(Number)
    const [x, y] = center(q, r)
    const cell = { x, y, boundary: false, rand: rnd.next() }
    EDGE_NEIGHBOR.forEach(([dq, dr], i) => {
      if (inside.has(id(q + dq, r + dr))) return
      const a = corner(x, y, 1, i)
      edges.set(vkey(a), { a, b: corner(x, y, 1, (i + 1) % 6) })
      cell.boundary = true
    })
    cells.push(cell)
  }
  const outline = []
  const start = edges.keys().next().value
  let k = start
  do {
    const e = edges.get(k)
    outline.push(e.a)
    k = vkey(e.b)
  } while (k !== start && outline.length <= edges.size)
  // các cạnh ô nối đuôi nhau ngược chiều kim đồng hồ; đảm bảo chiều trước khi nới viền
  let area = 0
  for (let i = 0; i < outline.length; i++) {
    const [x1, y1] = outline[i]
    const [x2, y2] = outline[(i + 1) % outline.length]
    area += x1 * y2 - x2 * y1
  }
  if (area < 0) outline.reverse()

  // ô vít nắp gom thành mảng, nhiều ở phía trên; ô còn mật đầy vơi khác nhau; ô ở mép cắt tràn mật
  for (const c of cells) {
    const patch = noise2(c.x * 0.2 + 4, c.y * 0.2 - 2) + (c.y / SPAN_Y) * 0.9 + 0.1
    c.type = !c.boundary && patch > -0.35 ? 'cap' : 'honey'
    c.level = c.boundary ? 0 : 0.05 + rnd.next() ** 1.3 * 0.72
  }
  return { cells, outline: offsetOutline(outline, (WALL * SQ3) / 2 + 0.02) }
}

/**
 * Nới đường viền (đa giác ngược chiều kim đồng hồ) ra ngoài một khoảng d — vách ở mép miếng tổ
 * dày bằng vách bên trong (không thì phần vát mép lấn vào lỗ ô, mặt trước bị chia tam giác sai).
 */
function offsetOutline(points, d) {
  const n = points.length
  const normal = (a, b) => {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const l = Math.hypot(dx, dy)
    return [dy / l, -dx / l]
  }
  return points.map((p, i) => {
    const n1 = normal(points[(i - 1 + n) % n], p)
    const n2 = normal(p, points[(i + 1) % n])
    let mx = n1[0] + n2[0]
    let my = n1[1] + n2[1]
    const ml = Math.hypot(mx, my)
    mx /= ml
    my /= ml
    const k = d / (mx * n1[0] + my * n1[1])
    return [p[0] + mx * k, p[1] + my * k]
  })
}

/** Mặt nắp sáp / mặt mật của tất cả ô cùng loại, gộp một geometry (vòm nhỏ hoặc mặt lõm). */
function cellSurfaces(cells, type) {
  const RINGS = [0.45, 0.8, 1]
  const pos = []
  const uv = []
  const rand = []
  const level = []
  const index = []
  const rc = 1 - WALL + 0.012 // lấn nhẹ vào vách cho kín mép
  for (const c of cells) {
    if (c.type !== type) continue
    const z = (s, i) => {
      if (type === 'cap') return -0.05 + 0.06 * (1 - s * s) + 0.012 * Math.sin(i * 2.1 + c.rand * 9) * s
      if (c.level < 0.03) return -0.01 + 0.05 * (1 - s * s) // mật đầy tràn, hơi phồng trên mép
      return -c.level * DEPTH - 0.04 * (1 - s * s) + 0.12 * s ** 6 // mặt lõm, mép mật bám lên vách
    }
    const base = pos.length / 3
    const push = (x, y, s, i) => {
      pos.push(c.x + x * rc, c.y + y * rc, z(s, i))
      uv.push(x, y)
      rand.push(c.rand)
      level.push(c.level)
    }
    push(0, 0, 0, 0)
    RINGS.forEach((s) => {
      for (let i = 0; i < 6; i++) {
        const [x, y] = corner(0, 0, s, i)
        push(x, y, s, i)
      }
    })
    for (let i = 0; i < 6; i++) index.push(base, base + 1 + i, base + 1 + ((i + 1) % 6))
    for (let j = 0; j < RINGS.length - 1; j++) {
      const a = base + 1 + j * 6
      const b = a + 6
      for (let i = 0; i < 6; i++) {
        const i2 = (i + 1) % 6
        index.push(a + i, b + i, b + i2, a + i, b + i2, a + i2)
      }
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('aCell', new BufferAttribute(new Float32Array(uv), 2))
  g.setAttribute('aRand', new BufferAttribute(new Float32Array(rand), 1))
  g.setAttribute('aLevel', new BufferAttribute(new Float32Array(level), 1))
  g.setIndex(index)
  g.computeVertexNormals()
  return g
}

/** Chỗ treo giọt mật: các mũi nhọn thấp nhất của mép dưới, ưu tiên gần giữa, cách nhau đủ xa. */
function dripPoints(outline, cx, cy, count) {
  const n = outline.length
  const ys = outline.map((p) => p[1])
  const bottom = Math.min(...ys)
  const tips = outline.filter((p, i) => p[1] < ys[(i - 1 + n) % n] && p[1] <= ys[(i + 1) % n] && p[1] < bottom + 2.4)
  tips.sort((a, b) => Math.abs(a[0] - cx) + (a[1] - bottom) * 0.8 - (Math.abs(b[0] - cx) + (b[1] - bottom) * 0.8))
  const picked = []
  for (const t of tips) {
    if (picked.every((p) => Math.abs(p[0] - t[0]) > 3.2)) picked.push(t)
    if (picked.length === count) break
  }
  return picked.map(([x, y]) => new Vector3(x - cx, y - cy - 0.04, -0.3))
}

const UP = new Vector3(0, 1, 0)
const _q = new Quaternion()
const _v = new Vector3()
const _a = new Vector3()
const _b = new Vector3()
const _t = new Vector3()
const _n = new Vector3()
const _bn = new Vector3()
const _cur = new Vector3()
const _nxt = new Vector3()
const _p = [new Vector3(), new Vector3(), new Vector3(), new Vector3()]

/**
 * Một giọt mật treo ở mép dưới: to dần thấy rõ (người xem biết là sắp rơi), ngay trước khi rơi
 * mới kéo ra một cổ ngắn rồi rơi; lắc mạnh thì giọt văng sớm. Cổ giọt là chuỗi điểm (verlet)
 * treo theo trọng lực nên giọt đung đưa trễ theo miếng tổ khi lắc.
 * Mô phỏng trong toạ độ của khung (trừ vị trí khung) → cuộn trang không làm giọt đung đưa.
 */
class Strand {
  constructor(effect, local, i, palette) {
    this.local = local
    this.grow = [2.6, 3.4, 2.2][i % 3] // giây từ lúc giọt mới đọng tới lúc rơi
    this.age = this.grow * (0.2 + 0.3 * i)
    this.p = new Float32Array(LINKS * 3)
    this.q = new Float32Array(LINKS * 3)
    this.ready = false
    this.anchor = new Vector3()

    const tone = { deep: '#a8661a', mid: '#d9982f', light: '#f6cc6e', glow: 0.45 }
    const dropGeometry = acquireDropGeometry()
    const beadGeometry = acquireDropGeometry()
    this.drop = new Mesh(dropGeometry, createHoneyMaterial(effect.engine, palette, tone))
    this.bead = new Mesh(beadGeometry, createHoneyMaterial(effect.engine, palette, tone))
    const fallGeometry = acquireDropGeometry()
    this.falling = { mesh: new Mesh(fallGeometry, createHoneyMaterial(effect.engine, palette, tone)), on: false, pos: new Vector3(), vel: new Vector3(), life: 0, size: 0 }

    const verts = (SAMPLES + 1) * RING
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(verts * 3), 3).setUsage(DynamicDrawUsage))
    g.setAttribute('normal', new BufferAttribute(new Float32Array(verts * 3), 3).setUsage(DynamicDrawUsage))
    const index = []
    for (let s = 0; s < SAMPLES; s++) {
      for (let k = 0; k < RING; k++) {
        const a = s * RING + k
        const b = s * RING + ((k + 1) % RING)
        index.push(a, a + RING, b, b, a + RING, b + RING)
      }
    }
    g.setIndex(index)
    this.tube = new Mesh(g, effect.strandMaterial)
    this.meshes = [this.tube, this.drop, this.bead, this.falling.mesh]
    for (const m of this.meshes) {
      m.frustumCulled = false
      m.renderOrder = 9
      effect.group.add(m)
    }
  }

  /** Độ chín của giọt (0 → 1): 1 là rơi. */
  get ripe() {
    return clamp(this.age / this.grow, 0, 1)
  }

  /** Cổ giọt: gần như không có, chỉ kéo dài ra ở ~20% cuối trước khi rơi. */
  len(r0) {
    return r0 * (0.35 + 1.6 * smoothstep(0.78, 1, this.ripe))
  }

  reset(a, seg) {
    for (let i = 0; i < LINKS; i++) {
      this.p[i * 3] = this.q[i * 3] = a.x
      this.p[i * 3 + 1] = this.q[i * 3 + 1] = a.y - i * seg
      this.p[i * 3 + 2] = this.q[i * 3 + 2] = a.z
    }
    this.ready = true
  }

  simulate(dt, a, seg) {
    const { p, q } = this
    const keep = Math.exp(-VISCOSITY * SUBSTEP)
    for (let t = dt; t > 1e-5; t -= SUBSTEP) {
      const h = Math.min(SUBSTEP, t)
      p[0] = q[0] = a.x
      p[1] = q[1] = a.y
      p[2] = q[2] = a.z
      for (let i = 1; i < LINKS; i++) {
        const j = i * 3
        for (let c = 0; c < 3; c++) {
          const v = (p[j + c] - q[j + c]) * keep
          q[j + c] = p[j + c]
          p[j + c] += v
        }
        p[j + 1] -= GRAVITY * h * h
      }
      for (let it = 0; it < 6; it++) {
        for (let i = 0; i < LINKS - 1; i++) {
          const j = i * 3
          const k = j + 3
          const dx = p[k] - p[j]
          const dy = p[k + 1] - p[j + 1]
          const dz = p[k + 2] - p[j + 2]
          const d = Math.hypot(dx, dy, dz) || 1e-6
          const diff = (d - seg) / d
          const wa = i === 0 ? 0 : 0.5
          const wb = i === 0 ? 1 : 0.5
          p[j] += dx * diff * wa
          p[j + 1] += dy * diff * wa
          p[j + 2] += dz * diff * wa
          p[k] -= dx * diff * wb
          p[k + 1] -= dy * diff * wb
          p[k + 2] -= dz * diff * wb
        }
      }
    }
  }

  point(i, out) {
    const j = clamp(i, 0, LINKS - 1) * 3
    return out.set(this.p[j], this.p[j + 1], this.p[j + 2])
  }

  /** Điểm trên đường cong Catmull-Rom qua chuỗi điểm (u từ 0 tới LINKS − 1). */
  sample(u, out) {
    const i = Math.min(Math.floor(u), LINKS - 2)
    const t = u - i
    const p0 = this.point(i - 1, _p[0])
    const p1 = this.point(i, _p[1])
    const p2 = this.point(i + 1, _p[2])
    const p3 = this.point(i + 2, _p[3])
    const t2 = t * t
    const t3 = t2 * t
    return out.set(
      0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      0.5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)
    )
  }

  /** Dựng lại cổ giọt (toạ độ thế giới = toạ độ khung + gốc khung). */
  draw(origin, r0) {
    const pos = this.tube.geometry.attributes.position
    const nor = this.tube.geometry.attributes.normal
    const cur = _cur
    const nxt = _nxt
    for (let s = 0; s <= SAMPLES; s++) {
      const u = (s / SAMPLES) * (LINKS - 1)
      this.sample(u, cur)
      this.sample(Math.min(u + 0.05, LINKS - 1), nxt)
      _t.subVectors(nxt, cur)
      if (_t.lengthSq() < 1e-8) _t.set(0, -1, 0)
      _t.normalize()
      _n.set(0, 0, 1).cross(_t)
      if (_n.lengthSq() < 1e-6) _n.set(1, 0, 0)
      _n.normalize()
      _bn.crossVectors(_t, _n)
      // mật đọng thành hạt ở mép tổ, kéo xuống thành sợi mảnh rồi phình ra ở giọt đầu sợi
      const r = r0 * (0.62 - 0.38 * smoothstep(0, 0.75, s / SAMPLES))
      for (let k = 0; k < RING; k++) {
        const a = (k / RING) * Math.PI * 2
        const cx = Math.cos(a)
        const sx = Math.sin(a)
        const nx = _n.x * cx + _bn.x * sx
        const ny = _n.y * cx + _bn.y * sx
        const nz = _n.z * cx + _bn.z * sx
        const vi = s * RING + k
        pos.setXYZ(vi, origin.x + cur.x + nx * r, origin.y + cur.y + ny * r, origin.z + cur.z + nz * r)
        nor.setXYZ(vi, nx, ny, nz)
      }
    }
    pos.needsUpdate = true
    nor.needsUpdate = true
  }

  dispose(group) {
    for (const m of this.meshes) group.remove(m)
    this.tube.geometry.dispose() // vật liệu sợi dùng chung, effect tự dọn
    for (const m of [this.drop, this.bead, this.falling.mesh]) {
      m.material.dispose()
      releaseDropGeometry()
    }
  }
}

/**
 * Miếng bánh tổ 3D trong khung "Một giọt mật": vách sáp, ô vít nắp, ô mật bóng; mép dưới có
 * giọt mật treo, to dần rồi rơi. Rê chuột → miếng tổ nghiêng theo; kéo → xoay; thả hoặc
 * chạm → rung rinh như lò xo (giọt đung đưa theo quán tính); lắc mạnh → giọt mật văng ra.
 * Vị trí, cỡ lấy từ khung trong DOM (.intro__stage) nên luôn khớp bố cục.
 */
export class Honeycomb extends Effect {
  constructor(engine, palette, { anchor, seed = 7 }) {
    super(engine, 'Bánh tổ · Giọt mật')
    this.anchor = anchor
    this.palette = palette

    const { cells, outline } = buildCells(seed)
    const xs = outline.map((p) => p[0])
    const ys = outline.map((p) => p[1])
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2
    this.width = Math.max(...xs) - Math.min(...xs)

    const shape = new Shape(outline.map(([x, y]) => new Vector2(x, y)))
    for (const c of cells) shape.holes.push(new Path([0, 1, 2, 3, 4, 5].map((i) => new Vector2(...corner(c.x, c.y, 1 - WALL, i)))))
    const lattice = new ExtrudeGeometry(shape, {
      depth: DEPTH,
      steps: 1,
      curveSegments: 1,
      bevelEnabled: true,
      bevelThickness: BEVEL_T,
      bevelSize: BEVEL_S,
      bevelOffset: -BEVEL_S,
      bevelSegments: 2,
    })
    lattice.translate(-cx, -cy, -(DEPTH + BEVEL_T)) // mép vách ở z = 0, quay về phía người xem
    const floor = new ShapeGeometry(new Shape(outline.map(([x, y]) => new Vector2(x, y))))
    floor.translate(-cx, -cy, -(DEPTH + BEVEL_T * 0.5)) // vách ngăn giữa (đáy ô)
    const caps = cellSurfaces(cells, 'cap')
    const honey = cellSurfaces(cells, 'honey')
    for (const g of [caps, honey]) g.translate(-cx, -cy, 0)

    const u = engine.uniforms
    const light = { value: LIGHT }
    const waxUniforms = () => ({
      uOpacity: { value: 0 },
      uDepth: { value: DEPTH + BEVEL_T },
      uRim: { value: rawColor('#f6dc9a') },
      uWall: { value: rawColor('#e6b552') },
      uFloor: { value: rawColor('#a96f22') },
      uCap: { value: rawColor('#f7e4b0') },
      uSun: { value: rawColor('#ffe2a8') },
      uLightDir: light,
    })
    this.wax = new ShaderMaterial({ vertexShader: VERT, fragmentShader: WAX_FRAG, uniforms: waxUniforms(), side: DoubleSide })
    this.capWax = new ShaderMaterial({ vertexShader: VERT, fragmentShader: WAX_FRAG, uniforms: waxUniforms(), defines: { CELLS: '' } })
    const honeyUniforms = {
      uDeep: { value: rawColor('#a8641a') },
      uMid: { value: rawColor('#dc9e3c') },
      uLight: { value: rawColor('#f9d27a') },
      uLightDir: light,
    }
    this.cellHoney = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: CELL_HONEY_FRAG,
      defines: { CELLS: '' },
      uniforms: { ...honeyUniforms, uTime: u.uTime, uOpacity: { value: 0 }, uLightCell: { value: new Vector2(LIGHT.x, LIGHT.y).normalize() } },
    })
    this.strandMaterial = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: STRAND_FRAG,
      transparent: true,
      uniforms: { ...honeyUniforms, uOpacity: { value: 0 } },
    })

    this.comb = new Group()
    this.comb.add(new Mesh(lattice, this.wax), new Mesh(floor, this.wax), new Mesh(caps, this.capWax), new Mesh(honey, this.cellHoney))
    this.comb.traverse((m) => (m.frustumCulled = false))
    this.group.add(this.comb)

    this.drips = dripPoints(outline, cx, cy, 3)
    this.strands = []

    this.rot = { x: BASE.x, y: BASE.y, z: BASE.z }
    this.spin = { x: 0, y: 0, z: 0 }
    this.off = { x: 0, y: 0 }
    this.offV = { x: 0, y: 0 }
    this.hover = null
    this.drag = null
    this.greeted = false
    this.origin = new Vector3()
    this.count = cells.length
  }

  setQuality(q) {
    const want = Math.min(STRANDS[q] ?? 2, this.drips.length)
    while (this.strands.length > want) this.strands.pop().dispose(this.group)
    while (this.strands.length < want) this.strands.push(new Strand(this, this.drips[this.strands.length], this.strands.length, this.palette))
  }

  /** Gắn sự kiện chuột/chạm vào khung (canvas không nhận chuột). */
  bind(el) {
    if (this.el === el) return
    this.el = el
    const on = (type, fn, opts) => this.engine.on(el, type, fn, opts)
    on('pointerdown', (e) => {
      if (e.button > 0) return
      const r = el.getBoundingClientRect()
      this.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, w: r.width, h: r.height, moved: false, nx: ((e.clientX - r.left) / r.width) * 2 - 1, ny: ((e.clientY - r.top) / r.height) * 2 - 1 }
      el.setPointerCapture?.(e.pointerId)
    })
    on(
      'pointermove',
      (e) => {
        const d = this.drag
        if (d && e.pointerId === d.id) {
          d.dx = e.clientX - d.x0
          d.dy = e.clientY - d.y0
          if (Math.hypot(d.dx, d.dy) > 6) d.moved = true
          return
        }
        if (e.pointerType !== 'mouse') return
        const r = el.getBoundingClientRect()
        this.hover = { nx: clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1), ny: clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1) }
      },
      { passive: true }
    )
    const end = (e) => {
      const d = this.drag
      if (!d || e.pointerId !== d.id) return
      this.drag = null
      if (!d.moved && e.type === 'pointerup') this.nudge(d.nx, d.ny)
    }
    on('pointerup', end)
    on('pointercancel', end)
    on('lostpointercapture', end)
    on('pointerleave', () => (this.hover = null))
  }

  /** Chạm/bấm → đẩy miếng tổ một cái ở chỗ chạm, nó rung rinh rồi về chỗ. */
  nudge(nx, ny) {
    this.spin.y += (nx >= 0 ? 1 : -1) * (3.2 + Math.abs(nx) * 2.4)
    this.spin.x += ny * 3.2
    this.spin.z += (nx >= 0 ? -1 : 1) * 1.1
  }

  update(dt, engine) {
    const a = THREE_CONFIG.effects.honeycomb ? this.anchor() : null
    this.intensity = damp(this.intensity, a?.inView ? 1 : 0, 2.6, dt)
    this.group.visible = !!a && this.intensity > 0.01
    if (!this.group.visible) {
      for (const s of this.strands) s.ready = false
      return
    }
    this.bind(a.el)
    const t = engine.time

    // lần đầu hiện ra: tự rung nhẹ một cái để người xem biết miếng tổ "sống"
    if (!this.greeted && this.intensity > 0.6) {
      this.greeted = true
      if (!engine.reduced) this.nudge(0.7, -0.2)
    }

    // ── xoay: lò xo về tư thế đích ────────────────────────
    const idle = engine.reduced ? 0 : 1
    const target = {
      x: BASE.x + idle * (0.05 * Math.sin(t * 0.37 + 1.2) + 0.025 * noise1(t * 0.2)),
      y: BASE.y + idle * (0.13 * Math.sin(t * 0.45) + 0.05 * noise1(t * 0.17 + 5)),
      z: BASE.z + idle * 0.03 * Math.sin(t * 0.29 + 2),
    }
    let k = SPRING
    const d = this.drag
    const offTarget = { x: 0, y: 0 }
    if (d) {
      k = SPRING_DRAG
      target.y = BASE.y + clamp((d.dx / d.w) * 2.4, -1.15, 1.15)
      target.x = BASE.x + clamp((d.dy / d.h) * 1.8, -0.75, 0.75)
      offTarget.x = clamp(d.dx * 0.12, -26, 26)
      offTarget.y = clamp(d.dy * 0.12, -26, 26)
    } else if (this.hover) {
      target.y += this.hover.nx * 0.42
      target.x += this.hover.ny * 0.28
    }
    for (const ax of ['x', 'y', 'z']) {
      this.spin[ax] += (k * (target[ax] - this.rot[ax]) - DAMPING * this.spin[ax]) * dt
      this.rot[ax] += this.spin[ax] * dt
    }
    for (const ax of ['x', 'y']) {
      this.offV[ax] += (70 * (offTarget[ax] - this.off[ax]) - 7 * this.offV[ax]) * dt
      this.off[ax] += this.offV[ax] * dt
    }
    const shaking = Math.hypot(this.spin.x, this.spin.y, this.spin.z) > SHAKE_RELEASE

    // ── đặt miếng tổ vào khung ───────────────────────────
    const s = (a.w * SIZE) / this.width
    const bob = idle * 4 * Math.sin(t * 0.6)
    engine.toWorld(a.x, a.top, 0, this.origin) // gốc khung: giọt mật mô phỏng tương đối với điểm này
    engine.toWorld(a.x + this.off.x, a.top + a.h * 0.42 + bob + this.off.y, 0, this.comb.position)
    this.comb.scale.setScalar(s)
    this.comb.rotation.set(this.rot.x, this.rot.y, this.rot.z)
    this.comb.updateMatrixWorld(true)

    const fade = this.intensity
    for (const m of [this.wax, this.capWax, this.cellHoney]) m.uniforms.uOpacity.value = fade
    this.strandMaterial.uniforms.uOpacity.value = fade

    // ── giọt mật ─────────────────────────────────────────
    const r0 = s * 0.32
    const land = engine.toWorld(0, a.bottom - a.h * 0.1, 0, _v).y - this.origin.y
    const grow = engine.reduced ? 0.3 : 1
    for (const st of this.strands) {
      st.anchor.copy(st.local).applyMatrix4(this.comb.matrixWorld).sub(this.origin)
      st.age += dt * grow
      const len = st.len(r0)
      const seg = len / (LINKS - 1)
      if (!st.ready) st.reset(st.anchor, seg)
      st.simulate(dt, st.anchor, seg)
      st.draw(this.origin, r0)

      // giọt to dần đều từ lúc mới đọng (thấy rõ là đang lớn), sắp rơi thì thuôn dài ra; đủ nặng hoặc bị lắc mạnh → rơi
      const ripe = st.ripe
      const size = r0 * (0.45 + 1.75 * ripe ** 0.75)
      const neck = 1 + 0.55 * smoothstep(0.75, 1, ripe)
      const end = st.point(LINKS - 1, _a)
      const dir = _b.subVectors(end, st.point(LINKS - 2, _t)).normalize()
      st.drop.quaternion.setFromUnitVectors(UP, _t.copy(dir).negate())
      st.drop.position.copy(end).addScaledVector(dir, 1.3 * size * neck * 0.92).add(this.origin)
      st.drop.scale.set(size, size * neck, size)
      setHoneyOpacity(st.drop.material, fade)

      // hạt mật đọng ở mép tổ, chỗ giọt mọc ra
      const b = r0 * 1.6
      st.bead.position.copy(st.anchor).add(this.origin)
      st.bead.position.y -= b * 0.35
      st.bead.quaternion.identity()
      st.bead.scale.set(b, b * 0.8, b)
      setHoneyOpacity(st.bead.material, fade)

      const f = st.falling
      if (!f.on && (ripe >= 1 || (shaking && ripe > 0.3))) {
        f.on = true
        f.life = 1
        f.size = size
        f.pos.copy(st.drop.position).sub(this.origin)
        const j = (LINKS - 1) * 3
        f.vel.set(st.p[j] - st.q[j], st.p[j + 1] - st.q[j + 1], st.p[j + 2] - st.q[j + 2]).divideScalar(SUBSTEP).clampLength(0, 600)
        f.mesh.quaternion.copy(st.drop.quaternion)
        st.age = 0 // giọt mới bắt đầu đọng lại từ đầu
      }
      if (f.on) {
        f.vel.y -= FALL_GRAVITY * dt
        f.pos.addScaledVector(f.vel, dt)
        f.pos.x = clamp(f.pos.x, -a.w * 0.4, a.w * 0.4) // văng mạnh cũng không bay ra ngoài khung
        // chạm "đáy" khung (chỗ bóng) → dừng lại, bẹp xuống rồi tan; không rơi lọt ra ngoài khung
        if (f.pos.y < land) {
          f.pos.y = land
          f.vel.set(0, 0, 0)
          f.life -= dt * 6
        }
        f.mesh.quaternion.slerp(_q.identity(), 1 - Math.exp(-6 * dt)) // rơi thì thẳng lại
        f.mesh.position.copy(f.pos).add(this.origin)
        const squash = clamp(f.life, 0, 1)
        f.mesh.scale.set(f.size * (2 - squash), f.size * 1.15 * squash, f.size * (2 - squash))
        if (f.life <= 0) f.on = false
      }
      f.mesh.visible = f.on
      setHoneyOpacity(f.mesh.material, fade * clamp(f.life, 0, 1))
    }
  }

  dispose() {
    for (const s of this.strands) s.dispose(this.group)
    this.strands = []
    this.strandMaterial.dispose()
    super.dispose()
  }
}
