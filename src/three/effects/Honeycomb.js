import { BufferAttribute, BufferGeometry, DoubleSide, Group, Mesh, ShaderMaterial, Vector3 } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { NOISE, rawColor } from '../shaders/index.js'
import { clamp, damp, smoothstep } from '../utils/noise.js'
import { createRandom } from '../utils/random.js'
import { acquireDropGeometry, createHoneyMaterial, releaseDropGeometry, setHoneyOpacity } from './HoneyDrop.js'

const SQ3 = Math.sqrt(3)
const DEPTH = 1.5 // chiều sâu mỗi ô (đơn vị = bán kính ô)
const KIND = { wax: 0, back: 1, honey: 2, cap: 3 }

const VERT = /* glsl */ `
attribute vec3 aColor;
attribute float aKind;
varying vec3 vN;
varying vec3 vV;
varying vec3 vColor;
varying float vKind;
varying vec3 vObj;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vV = -mv.xyz;
  vN = normalMatrix * normal;
  vColor = aColor;
  vKind = aKind;
  vObj = position;
  gl_Position = projectionMatrix * mv;
}
`

// Sáp ong: khuếch tán ấm + bóng nhẹ; mật trong ô: bóng loáng, vân chuyển động, viền fresnel.
const FRAG = /* glsl */ `
${NOISE}
uniform float uTime;
uniform float uOpacity;
uniform vec3 uLight;
uniform vec3 uHoneyDeep;
uniform vec3 uHoneyLight;
varying vec3 vN;
varying vec3 vV;
varying vec3 vColor;
varying float vKind;
varying vec3 vObj;

void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(vV);
  vec3 L = normalize(uLight);
  float diff = max(dot(N, L), 0.0);
  float nh = max(dot(N, normalize(L + V)), 0.0);
  vec3 col;
  if (vKind < 0.5) {
    col = vColor * (0.42 + 0.7 * diff) + vec3(1.0, 0.9, 0.7) * pow(nh, 24.0) * 0.22;
  } else if (vKind < 1.5) {
    col = vColor * (0.6 + 0.3 * diff);
  } else if (vKind < 2.5) {
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    float s = snoise(vec3(vObj.xy * 1.3, uTime * 0.15));
    col = mix(uHoneyDeep, uHoneyLight, 0.35 + 0.22 * s) * (0.6 + 0.55 * diff);
    col += vec3(1.0, 0.97, 0.9) * (pow(nh, 90.0) * 1.3 + pow(nh, 14.0) * 0.12) + uHoneyLight * fres * 0.35;
  } else {
    col = vColor * (0.5 + 0.6 * diff) + vec3(1.0, 0.96, 0.82) * pow(nh, 16.0) * 0.16;
  }
  gl_FragColor = vec4(col, uOpacity);
}
`

/** Đỉnh thứ i của ô lục giác đỉnh nhọn (pointy-top) tâm (cx, cy) bán kính r. */
const corner = (cx, cy, r, i) => {
  const a = (Math.PI / 180) * (60 * i - 30)
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

/** Dựng cả bánh tổ thành 1 geometry (~30 ô): viền sáp, thành ô, đáy ô, mật hoặc nắp sáp. */
function buildComb(palette) {
  const rnd = createRandom(42)
  // chọn ô: lõi tròn bán kính 2, vành ngoài lởm chởm, xệ về phía dưới như bánh tổ treo
  const cells = []
  for (let q = -3; q <= 3; q++) {
    for (let r = -3; r <= 3; r++) {
      const d = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r))
      const x = SQ3 * (q + r / 2)
      const y = -1.5 * r
      const keep = d <= 2 || (d === 3 && rnd.next() < (y < 0 ? 0.75 : 0.3))
      if (keep) cells.push({ x, y, front: DEPTH / 2 + rnd.range(-0.12, 0.14), fill: rnd.next() })
    }
  }
  const key = (x, y) => `${Math.round(x * 10)},${Math.round(y * 10)}`
  const occupied = new Set(cells.map((c) => key(c.x, c.y)))

  const pos = []
  const nor = []
  const col = []
  const kind = []
  const push = (p, n, c, k) => {
    pos.push(...p)
    nor.push(...n)
    col.push(...c)
    kind.push(k)
  }
  const quad = (a, b, c, d, n, ca, cb, k) => {
    // ca: màu 2 đỉnh đầu (mép trước), cb: 2 đỉnh sau (sâu trong ô → tối hơn)
    for (const [p, cc] of [
      [a, ca],
      [b, ca],
      [c, cb],
      [a, ca],
      [c, cb],
      [d, cb],
    ])
      push(p, n, cc, k)
  }
  const shade = (hex, k) => {
    const c = rawColor(hex)
    return [c.r * k, c.g * k, c.b * k]
  }

  const RI = 0.84 // bán kính trong (thành sáp dày 16%)
  const back = -DEPTH / 2
  for (const c of cells) {
    const wax = rnd.pick(palette.wax)
    const rim = shade(wax, 1.12)
    const wallFront = shade(wax, 1)
    const wallBack = shade(wax, 0.45)
    const zf = c.front
    for (let i = 0; i < 6; i++) {
      const [ox0, oy0] = corner(c.x, c.y, 1, i)
      const [ox1, oy1] = corner(c.x, c.y, 1, i + 1)
      const [ix0, iy0] = corner(c.x, c.y, RI, i)
      const [ix1, iy1] = corner(c.x, c.y, RI, i + 1)
      // viền trước
      quad([ox0, oy0, zf], [ox1, oy1, zf], [ix1, iy1, zf], [ix0, iy0, zf], [0, 0, 1], rim, rim, KIND.wax)
      // thành trong (pháp tuyến hướng vào tâm ô)
      const ang = (Math.PI / 180) * (60 * i)
      quad([ix0, iy0, zf], [ix1, iy1, zf], [ix1, iy1, back], [ix0, iy0, back], [-Math.cos(ang), -Math.sin(ang), 0], wallFront, wallBack, KIND.wax)
      // thành ngoài chỉ ở mép bánh tổ (không có ô kề)
      if (!occupied.has(key(c.x + SQ3 * Math.cos(ang), c.y + SQ3 * Math.sin(ang)))) {
        quad([ox0, oy0, zf], [ox1, oy1, zf], [ox1, oy1, back], [ox0, oy0, back], [Math.cos(ang), Math.sin(ang), 0], wallFront, wallBack, KIND.wax)
      }
    }
    // đáy ô, rồi lớp trong ô: nắp sáp (45%), mật (35%) hoặc trống
    const fan = (z, centerZ, tiltOut, k, color) => {
      for (let i = 0; i < 6; i++) {
        const [x0, y0] = corner(c.x, c.y, RI, i)
        const [x1, y1] = corner(c.x, c.y, RI, i + 1)
        const n0 = [(x0 - c.x) * tiltOut, (y0 - c.y) * tiltOut, 1]
        const n1 = [(x1 - c.x) * tiltOut, (y1 - c.y) * tiltOut, 1]
        push([c.x, c.y, centerZ], [0, 0, 1], color, k)
        push([x0, y0, z], n0, color, k)
        push([x1, y1, z], n1, color, k)
      }
    }
    fan(back, back, 0, KIND.back, shade(palette.combBack, 1))
    if (c.fill < 0.45) fan(zf - 0.08, zf - 0.01, 0.45, KIND.cap, shade(palette.waxCap, 1))
    else if (c.fill < 0.8) fan(zf - 0.42, zf - 0.5, -0.35, KIND.honey, [0, 0, 0])
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  geo.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3))
  geo.setAttribute('aColor', new BufferAttribute(new Float32Array(col), 3))
  geo.setAttribute('aKind', new BufferAttribute(new Float32Array(kind), 1))

  // điểm treo giọt mật: góc dưới cùng của ô thấp nhất
  const low = cells.reduce((a, b) => (b.y < a.y || (b.y === a.y && Math.abs(b.x) < Math.abs(a.x)) ? b : a))
  const [hx, hy] = corner(low.x, low.y, 1, 4)
  const width = Math.max(...cells.map((c) => Math.abs(c.x))) * 2 + 2
  return { geometry: geo, hang: new Vector3(hx, hy, low.front * 0.3), width }
}

/**
 * Bánh tổ ong 3D ở Hero (thay giọt mật lơ lửng): đàn ong lượn quanh, xoay nhẹ cho thấy
 * chiều sâu các ô; một giọt mật thành hình ở đáy tổ rồi nhỏ xuống, lặp lại.
 */
export class Honeycomb extends Effect {
  constructor(engine, palette, { anchor }) {
    super(engine, 'Tổ ong · Hero')
    this.anchor = anchor
    const { geometry, hang, width } = buildComb(palette)
    this.hang = hang
    this.width = width
    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        uTime: engine.uniforms.uTime,
        uOpacity: { value: 0 },
        uLight: { value: new Vector3(0.55, 0.65, 0.55) }, // nắng từ góc trên-phải, như tranh Hero
        uHoneyDeep: { value: rawColor(palette.honeyDeep) },
        uHoneyLight: { value: rawColor(palette.honeyLight) },
      },
    })
    this.comb = new Mesh(geometry, this.material)
    this.comb.frustumCulled = false
    this.comb.renderOrder = 8

    this.dripMaterial = createHoneyMaterial(engine, palette)
    this.drip = new Mesh(acquireDropGeometry(), this.dripMaterial)
    this.drip.frustumCulled = false
    this.drip.renderOrder = 8

    this.pivot = new Group()
    this.pivot.add(this.comb, this.drip)
    this.group.add(this.pivot)
    this.count = 1
  }

  update(dt, engine) {
    const a = THREE_CONFIG.effects.honeycomb ? this.anchor() : null
    this.intensity = damp(this.intensity, a?.inView ? clamp(a.visibility * 1.4, 0, 1) : 0, 3, dt)
    this.group.visible = !!a && this.intensity > 0.01
    if (!this.group.visible) return

    const t = engine.time
    const still = engine.reduced
    const scale = (a.r * 4.6) / this.width
    engine.toWorld(a.sx, a.sy + (still ? 0 : Math.sin(t * 0.7) * 6), 0, this.pivot.position)
    this.pivot.scale.setScalar(scale)
    this.pivot.rotation.set(
      -0.08 + (still ? 0 : Math.sin(t * 0.18) * 0.12),
      -0.35 + (still ? 0 : Math.sin(t * 0.25) * 0.35),
      still ? 0 : Math.sin(t * 0.3) * 0.04
    )
    this.material.uniforms.uOpacity.value = this.intensity

    // giọt mật: thành hình (0–70%), kéo dài cổ (70–85%), rơi và tan (85–100%) — chu kỳ 7 giây
    const p = still ? 0.6 : (t % 7) / 7
    const grow = 0.25 + 0.75 * smoothstep(0, 0.7, p)
    const neck = 1 + 0.35 * smoothstep(0.55, 0.85, p)
    const fall = p > 0.85 ? (p - 0.85) * 7 : 0 // giây kể từ lúc rơi
    const size = 0.34 * grow
    this.drip.scale.set(size, size * neck, size)
    // đỉnh giọt (y ≈ 1.3 trong hình gốc) chạm điểm treo
    this.drip.position.set(this.hang.x, this.hang.y - 1.3 * size * neck - 4.9 * fall * fall * 3, this.hang.z)
    this.drip.rotation.set(0, t * 0.3, 0)
    setHoneyOpacity(this.dripMaterial, this.intensity * (1 - smoothstep(0.88, 1, p)))
  }

  dispose() {
    this.pivot.remove(this.drip)
    this.dripMaterial.dispose()
    releaseDropGeometry()
    super.dispose()
  }
}
