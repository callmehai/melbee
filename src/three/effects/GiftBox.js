import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  Path,
  PlaneGeometry,
  Points,
  RepeatWrapping,
  Shape,
  ShapeGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'
import { Effect } from '../core/Effect.js'
import { clamp, damp, noise1 } from '../utils/noise.js'
import { HONEY, NOISE, rawColor } from '../shaders/index.js'
import { THREE_CONFIG } from '../config.js'
import { boxColors, honeyTones } from '../../data/giftbox.js'
import { products } from '../../data/products.js'
import { getGift, setGift } from '../../lib/giftbox.js'

/**
 * HỘP QUÀ 3D (section "Hộp quà") — hộp lục giác như một ô tổ ong, nắp bản lề phía sau,
 * ruy băng satin thắt nơ quanh vành nắp.
 * Kéo/vuốt để xoay (ngang: quanh hộp, dọc: lật lên xuống), bấm/chạm để mở nắp: nắp lật ra sau (mặt trong nắp in tổ ong, gài thiệp),
 * các hũ mật nhô lên khỏi khay màu mật, vài hạt bụi vàng bay lên. Kiểu hộp, màu, hũ, thiệp đọc từ
 * lib/giftbox.js mỗi khung hình.
 *
 * Đơn vị: bán kính hũ = 1. Mặt phẳng của lục giác trùng mặt trước (+z) như hũ thật của MelBee.
 */

const TAU = Math.PI * 2
const SQ3 = Math.sqrt(3)
const FAR = 9 // "rất xa mép" cho thuộc tính khoảng cách tới mép

// ── hũ ──────────────────────────────────────────────────────
const JAR_R = 1
const JAR_H = 2.08 // thân kính
const FILL = 1.86 // mật đầy tới đây
const NECK_R = 0.8
const CAP_R = 0.9
const CAP_Y0 = 2.14
const CAP_Y1 = 2.5
const LABEL_Y0 = 0.62
const LABEL_Y1 = 1.76

// ── hộp ─────────────────────────────────────────────────────
const WALL = 0.07
const INSERT_Y = 0.8 // mặt khay tổ ong
const POCKET = 0.55 // hốc hũ sâu bấy nhiêu dưới mặt khay
const JAR_BASE = INSERT_Y - POCKET
const BOX_H = JAR_BASE + CAP_Y1 + 0.12
const HOLE_R = JAR_R + 0.07
const SKIRT = 0.5 // vành nắp
const LID_T = 0.08 // bề dày mặt nắp
const LID_GAP = 0.05
const OPEN_ANGLE = 1.86 // rad — nắp lật ra sau, hơi quá chiều đứng
const RISE = 1.15 // hũ nhô lên khỏi khay khi mở
const RIBBON_W = 0.22
const SPARKS = 36

// ô của khay: hộp đơn một ô giữa; hộp ba xếp tam giác — một hũ trước, hai hũ sau, nhãn đều quay ra trước
const TRIO_C = (2 * JAR_R + 0.34) / SQ3
const LAYOUT = {
  single: { slots: [[0, 0]], inner: JAR_R * (SQ3 / 2) + 0.3 },
  trio: {
    slots: [90, 210, 330].map((d) => [TRIO_C * Math.cos((d * Math.PI) / 180), TRIO_C * Math.sin((d * Math.PI) / 180)]),
    inner: TRIO_C + JAR_R * (SQ3 / 2) + 0.24,
  },
}
// apothem trong → bán kính (đỉnh) trong
for (const l of Object.values(LAYOUT)) l.R = l.inner / (SQ3 / 2)

// ── tư thế ──────────────────────────────────────────────────
const PITCH = 0.44 // nhìn từ trên xuống
const PITCH_MIN = -0.12 // kéo xuống: gần ngang tầm mắt
const PIVOT_Y = 1.5 // tâm xoay: giữa thân hộp
const PITCH_MAX = 1.35 // kéo lên: nhìn gần như thẳng từ trên xuống
const YAW = -0.42 // xoay ¾: thấy mặt trước và mặt bên phải đón nắng
const FRICTION = 2.4
const LIGHT = new Vector3(0.62, 0.38, 0.69).normalize() // mặt trời chung của trang

// ── shader ──────────────────────────────────────────────────
const VERT = /* glsl */ `
attribute vec4 aEdge;
attribute vec3 aTangent;
varying vec3 vN;
varying vec3 vT;
varying vec3 vW;
varying vec3 vL;
varying vec2 vUv;
varying vec4 vEdge;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vL = position;
  vUv = uv;
  vEdge = aEdge;
  vN = normalize(mat3(modelMatrix) * normal);
  vT = normalize(mat3(modelMatrix) * aTangent);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

// hiện/ẩn bằng vân loang (giữ vật liệu đục)
const DISSOLVE = /* glsl */ `
uniform float uOpacity;
void dissolve(vec3 p) {
  if (snoise(p * 0.8) * 0.5 + 0.5 > uOpacity * 1.05 - 0.02) discard;
}
`

// dùng chung: mép gấp sáng (giấy bọc quanh cạnh cứng bắt nắng), phản chiếu trời ấm cho nhũ / kính
const COMMON = /* glsl */ `
varying vec4 vEdge;
// 1 ở sát mép, 0 khi cách mép > w (đơn vị mô hình), chống răng cưa theo độ rộng điểm ảnh
float edgeLine(float w) {
  float e = min(min(vEdge.x, vEdge.y), min(vEdge.z, vEdge.w));
  return 1.0 - smoothstep(0.0, max(w, fwidth(e) * 1.6), e);
}
vec3 warmEnv(vec3 R) {
  float sky = smoothstep(-0.35, 0.9, R.y);
  vec3 env = mix(vec3(0.52, 0.4, 0.24), vec3(1.12, 1.03, 0.86), sky);
  env += vec3(1.0, 0.95, 0.82) * smoothstep(0.9, 0.985, dot(R, normalize(vec3(0.5, 0.62, 0.6)))) * 1.3;
  return env;
}
// bump theo đạo hàm màn hình (không cần tiếp tuyến): h là độ cao, scale tính theo px thế giới
vec3 bumpNormal(vec3 N, vec3 p, float h, float scale) {
  vec3 dpx = dFdx(p);
  vec3 dpy = dFdy(p);
  vec3 r1 = cross(dpy, N);
  vec3 r2 = cross(N, dpx);
  float det = dot(dpx, r1);
  vec3 grad = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2) * scale;
  return normalize(abs(det) * N - grad);
}
`

// giấy bồi: nhũ (kênh R) là kim loại — phản chiếu trời, loé sáng theo góc xoay; vân dập (kênh G) chìm xuống.
// MAP: uMap là ảnh màu (nhãn hũ, thiệp). INSIDE: lòng hộp tối dần xuống đáy. SEAM: thân hộp — bóng
// vành nắp đổ xuống, chân hộp tối hơn chỗ chạm bàn.
const PAPER_FRAG = /* glsl */ `
${NOISE}
${DISSOLVE}
${COMMON}
uniform sampler2D uMap;
uniform vec2 uUvScale;
uniform vec3 uPaper;
uniform vec3 uFoil;
uniform vec3 uLightDir;
uniform vec2 uInk; // độ đậm nhũ, độ sâu vân dập
uniform float uGloss;
uniform float uDeep;
uniform float uEdge;
uniform vec2 uSeam; // y mép dưới vành nắp, nắp đang đóng (0..1)
varying vec3 vN;
varying vec3 vW;
varying vec3 vL;
varying vec2 vUv;
void main() {
  dissolve(vW * 0.012);
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vW);
  vec4 m = texture2D(uMap, vUv * uUvScale);
#ifdef MAP
  vec3 base = m.rgb;
  float foil = 0.0;
#else
  float foil = m.r * uInk.x;
  float emboss = m.g * uInk.y;
  N = bumpNormal(N, vW, foil * 0.35 - emboss * 0.6, 0.9);
  vec3 base = uPaper * (1.0 - 0.04 * emboss);
#endif
  base *= 0.985 + 0.02 * snoise(vL * 9.0);
  float ndl = dot(N, uLightDir);
  float wrap = clamp((ndl + 0.4) / 1.4, 0.0, 1.0);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  // nắng + trời ấm + ánh hắt từ mặt bàn gỗ lên các mặt hướng xuống
  vec3 light = vec3(0.5, 0.42, 0.33) + 0.74 * wrap + vec3(0.16, 0.1, 0.04) * clamp(-N.y, 0.0, 1.0);
  vec3 col = base * light;
#ifdef INSIDE
  col *= mix(0.5, 1.0, smoothstep(0.0, uDeep, vL.y));
#endif
#ifdef SEAM
  float under = step(vL.y, uSeam.x) * (1.0 - smoothstep(0.0, 0.32, uSeam.x - vL.y));
  col *= 1.0 - 0.38 * under * uSeam.y;
  col *= mix(0.8, 1.0, smoothstep(0.0, 0.3, vL.y));
#endif
  // mép gấp: giấy bọc quanh cạnh cứng bo tròn nhẹ → một đường sáng mảnh
  float e = edgeLine(0.035) * uEdge;
  col = mix(col, base * (light + 0.22) + 0.04, e * 0.55);
  vec3 H = normalize(uLightDir + V);
  float nh = max(dot(N, H), 0.0);
  vec3 R = reflect(-V, N);
  vec3 foilCol = uFoil * (0.4 + 0.7 * warmEnv(R)) * (0.8 + 0.5 * wrap) + mix(uFoil, vec3(1.0, 0.95, 0.8), 0.5) * (pow(nh, 40.0) * 1.1 + pow(nh, 8.0) * 0.18);
  col = mix(col, foilCol, clamp(foil, 0.0, 1.0));
  col += vec3(1.0, 0.97, 0.9) * (pow(nh, 60.0) * uGloss + pow(nh, 10.0) * 0.03);
  col += base * pow(1.0 - ndv, 3.0) * 0.12; // viền sáng nhẹ tách hộp khỏi nền
  gl_FragColor = vec4(col, 1.0);
}
`

// satin: bóng chạy dọc theo sợi (dị hướng), mặt trái/phải như nhau
const SATIN_FRAG = /* glsl */ `
${NOISE}
${DISSOLVE}
uniform vec3 uColor;
uniform vec3 uLightDir;
varying vec3 vN;
varying vec3 vT;
varying vec3 vW;
void main() {
  dissolve(vW * 0.012);
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 T = normalize(vT);
  vec3 V = normalize(cameraPosition - vW);
  float ndl = dot(N, uLightDir);
  float wrap = clamp((ndl + 0.5) / 1.5, 0.0, 1.0);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  vec3 col = uColor * (vec3(0.42, 0.36, 0.3) + 0.78 * wrap);
  vec3 H = normalize(uLightDir + V);
  float th = dot(T, H);
  float s = sqrt(max(0.0, 1.0 - th * th));
  vec3 sheen = mix(uColor, vec3(1.0), 0.55);
  col += sheen * (pow(s, 90.0) * 0.6 + pow(s, 10.0) * 0.14) * (0.25 + 0.75 * wrap);
  col += uColor * pow(1.0 - ndv, 2.5) * 0.35;
  gl_FragColor = vec4(col, 1.0);
}
`

// mật trong hũ: giữa dày (đậm), mép mỏng (sáng); đáy đậm hơn; góc lăng trụ dày hơn; nắng xuyên mặt khuất
const JAR_HONEY_FRAG = /* glsl */ `
${NOISE}
${DISSOLVE}
${HONEY}
${COMMON}
uniform float uFill;
varying vec3 vN;
varying vec3 vW;
varying vec3 vL;
void main() {
  dissolve(vW * 0.012);
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float h = clamp(vL.y / uFill, 0.0, 1.0);
  float corner = edgeLine(0.12);
  float thick = clamp(0.62 + 0.3 * ndv + 0.25 * (1.0 - h) + 0.25 * corner + 0.03 * snoise(vL * 2.0), 0.0, 1.0);
  float glow = clamp(-dot(N, uLightDir), 0.0, 1.0) * 0.6 + 0.16 * h;
  gl_FragColor = vec4(honeyColor(N, V, thick, glow), 1.0);
}
`

// kính: gần như trong suốt; cạnh lăng trụ dày nên sáng thành đường; mặt phẳng loé "cửa sổ" khi xoay
const GLASS_FRAG = /* glsl */ `
${COMMON}
uniform float uOpacity;
uniform vec3 uLightDir;
varying vec3 vN;
varying vec3 vW;
void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vW);
  float f = pow(1.0 - abs(dot(N, V)), 3.0);
  float nh = max(dot(N, normalize(uLightDir + V)), 0.0);
  vec3 R = reflect(-V, N);
  float win = smoothstep(0.86, 0.97, dot(R, normalize(vec3(0.5, 0.62, 0.6))));
  float spec = pow(nh, 90.0) * 1.4 + pow(nh, 14.0) * 0.1 + win * 0.45;
  float edge = edgeLine(0.05);
  gl_FragColor = vec4(vec3(1.0, 0.985, 0.95), clamp(0.04 + 0.45 * f + spec + edge * 0.55, 0.0, 0.92) * uOpacity);
}
`

// bóng hộp trên mặt bàn: lục giác nhoè, đậm ở chân, lệch về phía khuất nắng
const SHADOW_VERT = /* glsl */ `
uniform float uSize;
varying vec2 vP;
void main() {
  vP = position.xz * uSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const SHADOW_FRAG = /* glsl */ `
uniform float uOpacity;
uniform float uA;
uniform float uStretch;
varying vec2 vP;
float hexDist(vec2 p) {
  p = abs(p);
  return max(p.y, dot(p, vec2(0.8660254, 0.5)));
}
void main() {
  vec2 p = vP;
  if (p.y < 0.0) p.y /= 1.0 + uStretch;
  float d = hexDist(p.yx) / uA;
  float soft = 1.0 - smoothstep(0.75, 1.55, d);
  float core = 1.0 - smoothstep(0.92, 1.08, d);
  gl_FragColor = vec4(vec3(0.33, 0.2, 0.08), (soft * 0.26 + core * 0.3) * uOpacity);
}
`

// bụi vàng lấp lánh khi mở nắp
const SPARK_VERT = /* glsl */ `
attribute float aLife;
attribute float aSize;
uniform float uScale;
uniform float uPR;
varying float vLife;
void main() {
  vLife = aLife;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uScale * uPR * sin(3.14159 * clamp(aLife, 0.0, 1.0));
}
`
const SPARK_FRAG = /* glsl */ `
uniform float uOpacity;
varying float vLife;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  float core = smoothstep(0.5, 0.0, r);
  float star = max(smoothstep(0.08, 0.0, abs(c.x)), smoothstep(0.08, 0.0, abs(c.y))) * smoothstep(0.5, 0.1, r);
  float a = clamp(core * core * 0.95 + star * 0.6, 0.0, 1.0) * sin(3.14159 * clamp(vLife, 0.0, 1.0)) * uOpacity;
  if (a < 0.01) discard;
  // vàng nhũ đậm ở rìa, lõi trắng — đọc được cả trên nền kem sáng
  gl_FragColor = vec4(mix(vec3(0.86, 0.6, 0.18), vec3(1.0, 0.97, 0.86), core * core), a);
}
`

// ── hình học ────────────────────────────────────────────────

const vtx = (p, u = [0, 0], e = [FAR, FAR, FAR, FAR], t = [1, 0, 0]) => ({ p, u, e, t })

/** Gom tam giác không đánh chỉ số; mỗi tam giác tự lật chiều theo pháp tuyến mong muốn. */
function builder() {
  const pos = []
  const nor = []
  const uv = []
  const edge = []
  const tan = []
  const push = (v, n) => {
    pos.push(...v.p)
    nor.push(...n)
    uv.push(...v.u)
    edge.push(...v.e)
    tan.push(...v.t)
  }
  const b = {
    tri(a, c, d, n) {
      const e1 = [c.p[0] - a.p[0], c.p[1] - a.p[1], c.p[2] - a.p[2]]
      const e2 = [d.p[0] - a.p[0], d.p[1] - a.p[1], d.p[2] - a.p[2]]
      const cx = e1[1] * e2[2] - e1[2] * e2[1]
      const cy = e1[2] * e2[0] - e1[0] * e2[2]
      const cz = e1[0] * e2[1] - e1[1] * e2[0]
      const ok = cx * n[0] + cy * n[1] + cz * n[2] >= 0
      for (const v of ok ? [a, c, d] : [a, d, c]) push(v, n)
    },
    quad(v0, v1, v2, v3, n) {
      b.tri(v0, v1, v2, n)
      b.tri(v0, v2, v3, n)
    },
    build() {
      const g = new BufferGeometry()
      g.setAttribute('position', new Float32BufferAttribute(pos, 3))
      g.setAttribute('normal', new Float32BufferAttribute(nor, 3))
      g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
      g.setAttribute('aEdge', new Float32BufferAttribute(edge, 4))
      g.setAttribute('aTangent', new Float32BufferAttribute(tan, 3))
      return g
    },
  }
  return b
}

/** Hình học dựng sẵn của three (ShapeGeometry, PlaneGeometry) → thêm thuộc tính mép/tiếp tuyến mặc định. */
function withDefaults(g) {
  const n = g.attributes.position.count
  g.setAttribute('aEdge', new Float32BufferAttribute(new Array(n * 4).fill(FAR), 4))
  g.setAttribute('aTangent', new Float32BufferAttribute(new Array(n).fill([1, 0, 0]).flat(), 3))
  return g
}

const hexPt = (cx, cz, R, k) => [cx + R * Math.cos((k * Math.PI) / 3), cz + R * Math.sin((k * Math.PI) / 3)]

/**
 * Các mặt bên của lăng trụ lục giác. Mặt k nối đỉnh k → k+1, pháp tuyến hướng góc (k + ½)·60°; mặt k = 1 là mặt trước.
 * u chạy từ trái sang phải khi nhìn từ ngoài vào. Mỗi đỉnh mang khoảng cách tới 4 mép của mặt (cho đường mép sáng).
 */
function prism(b, { cx = 0, cz = 0, R, y0, y1, inward = false, faces = [0, 1, 2, 3, 4, 5], u = (k, t) => (6 - k - t) / 6, edges = true }) {
  const h = y1 - y0
  for (const k of faces) {
    const [ax, az] = hexPt(cx, cz, R, k)
    const [bx, bz] = hexPt(cx, cz, R, k + 1)
    const a = ((k + 0.5) * Math.PI) / 3
    const s = inward ? -1 : 1
    const n = [Math.cos(a) * s, 0, Math.sin(a) * s]
    const t = [(bx - ax) / R, 0, (bz - az) / R]
    const ua = u(k, 0)
    const ub = u(k, 1)
    const E = (da, db, dy0, dy1) => (edges ? [da, db, dy0, dy1] : [FAR, FAR, FAR, FAR])
    b.quad(
      vtx([ax, y0, az], [ua, 0], E(0, R, 0, h), t),
      vtx([bx, y0, bz], [ub, 0], E(R, 0, 0, h), t),
      vtx([bx, y1, bz], [ub, 1], E(R, 0, h, 0), t),
      vtx([ax, y1, az], [ua, 1], E(0, R, h, 0), t),
      n
    )
  }
}

/** Mặt lục giác phẳng (quạt tam giác), UV phẳng: mép trước (+z) ở cạnh dưới ảnh → chữ đứng thẳng với người xem. */
function hexCap(b, { cx = 0, cz = 0, R, y, up = true, uvScale = 1 }) {
  const n = [0, up ? 1 : -1, 0]
  const A = R * (SQ3 / 2)
  const uvOf = (x, z) => [((x - cx) / (2 * R) + 0.5) * uvScale, (0.5 - (z - cz) / (2 * R)) * uvScale]
  for (let k = 0; k < 6; k++) {
    const [ax, az] = hexPt(cx, cz, R, k)
    const [bx, bz] = hexPt(cx, cz, R, k + 1)
    b.tri(vtx([cx, y, cz], uvOf(cx, cz), [A, FAR, FAR, FAR]), vtx([ax, y, az], uvOf(ax, az), [0, FAR, FAR, FAR]), vtx([bx, y, bz], uvOf(bx, bz), [0, FAR, FAR, FAR]), n)
  }
}

/** Vành lục giác phẳng giữa hai bán kính (miệng hộp, mép nắp). */
function hexRing(b, { R1, R2, y, up = true }) {
  const n = [0, up ? 1 : -1, 0]
  const g = (R2 - R1) * (SQ3 / 2)
  for (let k = 0; k < 6; k++) {
    const [a1x, a1z] = hexPt(0, 0, R1, k)
    const [b1x, b1z] = hexPt(0, 0, R1, k + 1)
    const [a2x, a2z] = hexPt(0, 0, R2, k)
    const [b2x, b2z] = hexPt(0, 0, R2, k + 1)
    b.quad(vtx([a1x, y, a1z], [0, 0], [0, g, FAR, FAR]), vtx([b1x, y, b1z], [1, 0], [0, g, FAR, FAR]), vtx([b2x, y, b2z], [1, 1], [g, 0, FAR, FAR]), vtx([a2x, y, a2z], [0, 1], [g, 0, FAR, FAR]), n)
  }
}

/** Khay tổ ong: mặt lục giác có khoét các hốc hũ (ShapeGeometry nằm trong mặt xy → xoay về mặt xz). */
function insertGeometry(R, slots) {
  const shape = new Shape([0, 1, 2, 3, 4, 5].map((k) => hexPt(0, 0, R, k)).map(([x, z]) => ({ x, y: -z })))
  for (const [sx, sz] of slots) {
    shape.holes.push(new Path([0, 1, 2, 3, 4, 5].map((k) => hexPt(sx, sz, HOLE_R, k)).map(([x, z]) => ({ x, y: -z }))))
  }
  const g = new ShapeGeometry(shape)
  g.rotateX(-Math.PI / 2)
  g.translate(0, INSERT_Y, 0)
  return withDefaults(g)
}

/**
 * Dải ruy băng dọc một đường cong: mỗi điểm có hướng bề rộng (được làm vuông góc với đường đi) và bề rộng.
 * Pháp tuyến = tiếp tuyến × hướng bề rộng; tiếp tuyến dùng cho bóng satin chạy dọc sợi.
 */
function ribbon(points, widthDir, width, closed = false) {
  const n = points.length
  const pos = []
  const nor = []
  const tan = []
  const uv = []
  const idx = []
  const T = new Vector3()
  const W = new Vector3()
  const N = new Vector3()
  for (let i = 0; i < n; i++) {
    const prev = points[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)]
    const next = points[closed ? (i + 1) % n : Math.min(i + 1, n - 1)]
    T.subVectors(next, prev).normalize()
    W.copy(widthDir(i / (n - 1), T)).addScaledVector(T, -widthDir(i / (n - 1), T).dot(T)).normalize()
    N.crossVectors(T, W).normalize()
    const w = width(i / (n - 1)) / 2
    for (const sgn of [1, -1]) {
      pos.push(points[i].x + W.x * w * sgn, points[i].y + W.y * w * sgn, points[i].z + W.z * w * sgn)
      nor.push(N.x, N.y, N.z)
      tan.push(T.x, T.y, T.z)
      uv.push(i / (n - 1), sgn > 0 ? 1 : 0)
    }
  }
  const segs = closed ? n : n - 1
  for (let i = 0; i < segs; i++) {
    const a = i * 2
    const b = ((i + 1) % n) * 2
    idx.push(a, a + 1, b, a + 1, b + 1, b)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3))
  g.setAttribute('aTangent', new Float32BufferAttribute(tan, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setAttribute('aEdge', new Float32BufferAttribute(new Array(n * 8).fill(FAR), 4))
  g.setIndex(idx)
  return g
}

/** Nơ thắt ở mặt trước vành nắp: hai quai, nút thắt, hai đuôi buông xuống. Gốc toạ độ = tâm nút, z hướng ra ngoài. */
function bowGeometries() {
  const geos = []
  const up = new Vector3(0, 1, 0)
  // quai: vòng dẹt trong mặt xz (lớp trước phồng ra, lớp sau áp vào vành nắp), nghiêng lên hai bên
  for (const side of [-1, 1]) {
    const L = 0.66
    const d = 0.13
    const tilt = side * 0.34
    const pts = []
    for (let i = 0; i <= 48; i++) {
      const s = i / 48
      const x = side * L * 0.5 * (1 - Math.cos(TAU * s))
      const z = d * (1 + Math.sin(TAU * s)) + 0.02
      const y = 0.05 * Math.sin(Math.PI * s) // quai hơi võng
      pts.push(new Vector3(x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt), z))
    }
    const dir = new Vector3(-Math.sin(tilt), Math.cos(tilt), 0)
    geos.push(ribbon(pts, () => dir, (s) => RIBBON_W * (0.78 + 0.5 * Math.sin(Math.PI * s))))
  }
  // đuôi: buông xuống, lượn nhẹ
  for (const side of [-1, 1]) {
    const pts = []
    for (let i = 0; i <= 24; i++) {
      const t = i / 24
      pts.push(new Vector3(side * (0.04 + 0.3 * t + 0.04 * Math.sin(t * 4)), -0.06 - 0.72 * t, 0.13 + 0.05 * Math.sin(t * 6) - 0.07 * t))
    }
    const across = new Vector3(1, side * 0.25, 0).normalize()
    geos.push(ribbon(pts, () => across, () => RIBBON_W * 0.92))
  }
  // nút thắt: một vòng nhỏ quấn quanh chỗ hai quai gặp nhau
  const knot = []
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU
    knot.push(new Vector3(0.1 * Math.cos(a), 0, 0.12 + 0.09 * Math.sin(a)))
  }
  geos.push(ribbon(knot, () => up, () => RIBBON_W * 0.82, true))
  return geos
}

// ── hoạ tiết vẽ bằng canvas ─────────────────────────────────
const SERIF = '"Noto Serif Display", "Times New Roman", serif'

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function texture(c) {
  const t = new CanvasTexture(c)
  t.anisotropy = 4
  return t
}

/** Đường núi: sóng "gãy" như núi đá Tây Bắc (giống dãy núi ở footer). */
function ridgePath(ctx, x0, x1, base, amp, phase, scale = 1) {
  const peak = (v) => (1 - Math.abs(Math.sin(v))) ** 1.6
  ctx.beginPath()
  for (let x = x0; x <= x1; x += 3) {
    const v = x / scale
    const h = 0.6 * peak(v * 0.0042 + phase) + 0.28 * peak(v * 0.011 + phase * 2.3) + 0.12 * peak(v * 0.029 + phase * 3.7)
    if (x === x0) ctx.moveTo(x, base - amp * h)
    else ctx.lineTo(x, base - amp * h)
  }
}

/** Lưới tổ ong nét mảnh, đỉnh nhọn trên/dưới; lặp khít theo chu kỳ √3·s × 3·s. */
function honeycombLines(ctx, w, h, s) {
  const dx = s * SQ3
  const dy = s * 1.5
  ctx.beginPath()
  for (let row = -1; row * dy < h + s * 2; row++) {
    const y = row * dy
    for (let x = row & 1 ? -dx / 2 : 0; x < w + dx; x += dx) {
      for (let k = 0; k < 6; k++) {
        const a = ((k + 0.5) * Math.PI) / 3
        ctx[k ? 'lineTo' : 'moveTo'](x + s * Math.cos(a), y + s * Math.sin(a))
      }
      ctx.closePath()
    }
  }
}

/** Ô tổ ong lặp được (cả kênh R lẫn G) — khay và mặt trong nắp. Ảnh rộng 2 ô, cao gấp √3 lần bề rộng. */
const COMB_TILE = 0.62 // bề rộng một ảnh lặp (đơn vị mô hình)
function honeycombTile() {
  const W = 128
  const s = W / (2 * SQ3)
  const H = Math.round(6 * s)
  const c = canvas(W, H)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgb(255,255,0)'
  ctx.lineWidth = 3
  honeycombLines(ctx, W, H, s)
  ctx.stroke()
  const t = texture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  return t
}

/** Con ong nhỏ vẽ nét (nhũ). */
function bee(ctx, x, y, s) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-0.25)
  ctx.lineWidth = s * 0.09
  ctx.beginPath()
  ctx.ellipse(-s * 0.18, -s * 0.42, s * 0.34, s * 0.2, -0.6, 0, TAU)
  ctx.ellipse(s * 0.2, -s * 0.44, s * 0.3, s * 0.18, 0.5, 0, TAU)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.5, s * 0.3, 0, 0, TAU)
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-out'
  for (const sx of [-0.12, 0.12]) ctx.fillRect(s * sx - s * 0.04, -s * 0.32, s * 0.08, s * 0.64)
  ctx.restore()
}

/** Mặt nắp: R = nhũ (viền lục giác đôi, chữ, dãy núi, con ong), G = lưới tổ ong dập chìm ở vành ngoài. */
function lidPrint() {
  const S = 1024
  const c = canvas(S, S)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, S, S)
  ctx.globalCompositeOperation = 'lighter'
  const hex = (r, fresh = true) => {
    if (fresh) ctx.beginPath()
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3
      ctx[k ? 'lineTo' : 'moveTo'](S / 2 + r * Math.cos(a), S / 2 - r * Math.sin(a))
    }
    ctx.closePath()
  }
  // vân tổ ong chỉ ở vành ngoài (giữa hai lục giác)
  ctx.save()
  hex(S * 0.5)
  hex(S * 0.415, false)
  ctx.clip('evenodd')
  ctx.strokeStyle = 'rgb(0,255,0)'
  ctx.lineWidth = 4
  honeycombLines(ctx, S, S, 26)
  ctx.stroke()
  ctx.restore()

  ctx.strokeStyle = ctx.fillStyle = 'rgb(255,0,0)'
  ctx.lineWidth = 6
  hex(S * 0.405)
  ctx.stroke()
  ctx.lineWidth = 2.5
  hex(S * 0.385)
  ctx.stroke()

  // dãy núi trong lòng lục giác
  ctx.save()
  hex(S * 0.385)
  ctx.clip()
  ctx.lineWidth = 3.5
  ridgePath(ctx, 0, S, S * 0.74, S * 0.14, 0.9, 1.3)
  ctx.stroke()
  ctx.lineWidth = 2.5
  ridgePath(ctx, 0, S, S * 0.79, S * 0.1, 3.1, 1.1)
  ctx.stroke()
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `italic 500 ${S * 0.135}px ${SERIF}`
  ctx.fillText('MelBee', S / 2, S * 0.53)
  ctx.font = `500 ${S * 0.03}px ${SERIF}`
  ctx.letterSpacing = `${S * 0.012}px`
  ctx.fillText('MẬT ONG TÂY BẮC', S / 2 + S * 0.006, S * 0.6)
  ctx.letterSpacing = '0px'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(S * 0.39, S * 0.405)
  ctx.lineTo(S * 0.465, S * 0.405)
  ctx.moveTo(S * 0.535, S * 0.405)
  ctx.lineTo(S * 0.61, S * 0.405)
  ctx.stroke()
  bee(ctx, S / 2, S * 0.405, S * 0.05)
  return texture(c)
}

/**
 * Mặt bên thân hộp: dãy núi nét nhũ chạy liền quanh hộp + chỉ viền trên/dưới.
 * Ảnh lặp theo chiều ngang (SIDE_U đơn vị thế giới một vòng ảnh) nên hộp to hay nhỏ thì núi vẫn cùng tỉ lệ;
 * hàm núi tuần hoàn để chỗ nối không bị gãy.
 */
const SIDE_U = 6
function sidePrint() {
  const W = 2048
  const H = Math.round((W * BOX_H) / SIDE_U)
  const c = canvas(W, H)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgb(255,0,0)'
  ctx.lineWidth = 3
  for (const y of [H * 0.035, H * 0.965]) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  const peak = (v) => (1 - Math.abs(Math.sin(v))) ** 1.6
  const ridge = (base, amp, n, ph) => {
    ctx.beginPath()
    for (let x = 0; x <= W; x += 3) {
      const v = (x / W) * Math.PI
      const h = 0.6 * peak(v * n[0] + ph) + 0.28 * peak(v * n[1] + ph * 2.3) + 0.12 * peak(v * n[2] + ph * 3.7)
      ctx[x ? 'lineTo' : 'moveTo'](x, base - amp * h)
    }
    ctx.stroke()
  }
  ctx.lineWidth = 4
  ridge(H * 0.8, H * 0.42, [3, 7, 17], 0.4)
  ctx.lineWidth = 2.5
  ridge(H * 0.87, H * 0.28, [4, 9, 23], 2.6)
  const t = texture(c)
  t.wrapS = RepeatWrapping
  return t
}

/** Nhãn hũ trải 3 mặt trước (như nhãn thật): nền kem, núi xanh, hoa ban, chữ nâu. */
function labelArt(product, tone) {
  const W = 1024
  const H = 384
  const c = canvas(W, H)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#f7f0dc'
  ctx.fillRect(0, 0, W, H)
  for (const [base, amp, ph, col] of [
    [H * 0.86, H * 0.36, 1.2, '#9fbb7e'],
    [H * 0.95, H * 0.3, 3.4, '#6f9a5e'],
  ]) {
    ridgePath(ctx, 0, W, base, amp, ph, 0.55)
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.closePath()
    ctx.fillStyle = col
    ctx.fill()
  }
  for (const [x, y, r] of [
    [W * 0.12, H * 0.34, 26],
    [W * 0.2, H * 0.52, 18],
    [W * 0.86, H * 0.3, 24],
    [W * 0.8, H * 0.5, 17],
  ]) {
    ctx.fillStyle = '#ffffff'
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU
      ctx.beginPath()
      ctx.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.5, r * 0.36, a, 0, TAU)
      ctx.fill()
    }
    ctx.fillStyle = '#e2b13c'
    ctx.beginPath()
    ctx.arc(x, y, r * 0.22, 0, TAU)
    ctx.fill()
  }
  ctx.strokeStyle = '#c9a052'
  ctx.lineWidth = 4
  ctx.strokeRect(8, 8, W - 16, H - 16)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#6b3d14'
  ctx.font = `700 ${H * 0.22}px ${SERIF}`
  ctx.fillText('Melbee', W / 2, H * 0.36)
  ctx.font = `500 ${H * 0.1}px ${SERIF}`
  ctx.fillStyle = '#4b2e14'
  ctx.fillText(product?.name || 'Mật ong Tây Bắc', W / 2, H * 0.53)
  ctx.font = `italic ${H * 0.065}px ${SERIF}`
  ctx.fillStyle = '#6d5534'
  ctx.fillText(product?.size || '', W / 2, H * 0.64)
  ctx.fillStyle = tone.mid
  ctx.fillRect(W / 2 - 46, H * 0.68, 92, 6)
  return texture(c)
}

/** Thiệp: giấy kem, viền nhũ, lời nhắn chữ nghiêng, ký tên góc phải. */
function cardArt(card) {
  const W = 1024
  const H = 680
  const c = canvas(W, H)
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#fdf9ef')
  g.addColorStop(1, '#f5ecd8')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#d0aa62'
  ctx.lineWidth = 3
  ctx.strokeRect(26, 26, W - 52, H - 52)
  ctx.lineWidth = 1.5
  ctx.strokeRect(38, 38, W - 76, H - 76)
  ctx.fillStyle = '#c88a24'
  bee(ctx, W / 2, 104, 50)
  ctx.textAlign = 'center'
  const text = card.text.trim()
  ctx.fillStyle = text ? '#3a291d' : '#a8957c'
  ctx.font = `italic ${text ? 66 : 56}px ${SERIF}`
  const words = (text || 'Viết vài dòng cho người nhận…').split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (ctx.measureText(next).width > W - 150 && line) {
      lines.push(line)
      line = w
    } else line = next
  }
  if (line) lines.push(line)
  const shown = lines.slice(0, 5)
  const lh = 84
  const top = H * 0.5 - ((shown.length - 1) * lh) / 2 + 10
  shown.forEach((l, i) => ctx.fillText(l, W / 2, top + i * lh))
  if (card.from.trim()) {
    ctx.textAlign = 'right'
    ctx.font = `italic 50px ${SERIF}`
    ctx.fillStyle = '#7a5528'
    ctx.fillText(`— ${card.from.trim()}`, W - 90, H - 70)
  }
  return texture(c)
}

// ── hiệu ứng ────────────────────────────────────────────────
const ease = (t) => t * t * (3 - 2 * t)
const smoothstep = (a, b, x) => ease(clamp((x - a) / (b - a), 0, 1))
const COLOR_KEYS = ['paper', 'foil', 'inside', 'tray', 'ribbon']

export class GiftBox extends Effect {
  constructor(engine, palette, { anchor }) {
    super(engine, 'Hộp quà 3D')
    this.anchor = anchor
    const light = { value: LIGHT }
    this.colors = {}
    for (const key of COLOR_KEYS) this.colors[key] = rawColor(boxColors[0][key])
    this.colorTarget = boxColors[0]
    this.seam = new Vector2(BOX_H - SKIRT, 1)

    const paper = (map, { ink = [1, 1], gloss = 0.05, color = this.colors.paper, foil = this.colors.foil, edge = 1, uvScale = [1, 1], defines = {} } = {}) =>
      new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: PAPER_FRAG,
        defines,
        side: DoubleSide,
        uniforms: {
          uOpacity: { value: 0 },
          uMap: { value: map },
          uUvScale: { value: new Vector2(...uvScale) },
          uPaper: { value: color },
          uFoil: { value: foil },
          uLightDir: light,
          uInk: { value: new Vector2(...ink) },
          uGloss: { value: gloss },
          uDeep: { value: BOX_H },
          uEdge: { value: edge },
          uSeam: { value: this.seam },
        },
      })
    this.paper = paper

    this.textures = { lid: lidPrint(), side: sidePrint(), comb: honeycombTile() }
    const comb = this.textures.comb
    this.mats = {
      side: paper(this.textures.side, { defines: { SEAM: '' } }),
      lid: paper(this.textures.lid),
      plain: paper(this.textures.side, { ink: [0, 0] }),
      inside: paper(comb, { ink: [0, 0], color: this.colors.inside, defines: { INSIDE: '' } }),
      lining: paper(comb, { ink: [0.32, 0], color: this.colors.inside, edge: 0 }), // mặt trong nắp: tổ ong nhũ mờ
      tray: paper(comb, { ink: [0, 0.9], color: this.colors.tray, edge: 0, gloss: 0.08 }), // khay màu mật, vân tổ ong dập
      pocket: paper(comb, { ink: [0, 0], color: this.colors.tray, defines: { INSIDE: '' } }),
      cap: paper(null, { ink: [0, 0], color: rawColor('#1b1714'), gloss: 0.9, edge: 0.6 }),
      card: paper(null, { defines: { MAP: '' }, edge: 0.4 }),
      satin: new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: SATIN_FRAG,
        side: DoubleSide,
        uniforms: { uOpacity: { value: 0 }, uColor: { value: this.colors.ribbon }, uLightDir: light },
      }),
      glass: new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: GLASS_FRAG,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        uniforms: { uOpacity: { value: 0 }, uLightDir: light },
      }),
      shadow: new ShaderMaterial({
        vertexShader: SHADOW_VERT,
        fragmentShader: SHADOW_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: { uOpacity: { value: 0 }, uA: { value: 1 }, uStretch: { value: 0 }, uSize: { value: 1 } },
      }),
      spark: new ShaderMaterial({
        vertexShader: SPARK_VERT,
        fragmentShader: SPARK_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: { uOpacity: { value: 0 }, uScale: { value: 1 }, uPR: { value: 1 } },
      }),
    }

    // root: điểm xoay ở giữa thân hộp (lật lên xuống không văng khỏi khung); stage: đáy hộp, dời xuống dưới tâm xoay
    this.pivot = new Group()
    this.group.add(this.pivot)
    this.root = new Group()
    this.root.position.y = -PIVOT_Y
    this.pivot.add(this.root)

    // bóng trên mặt bàn (vẽ trước hộp)
    const sg = new PlaneGeometry(1, 1)
    sg.rotateX(-Math.PI / 2)
    this.shadow = new Mesh(sg, this.mats.shadow)
    this.shadow.renderOrder = -1
    this.shadow.frustumCulled = false
    // bóng nằm trên "mặt bàn" cố định (cùng góc nghiêng với nền khung), không lật theo hộp:
    // xoay ngang thì hình bóng xoay theo, lật hộp lên thì bóng nhạt và loang ra như hộp được nhấc khỏi bàn
    this.floor = new Group()
    this.floor.add(this.shadow)
    this.group.add(this.floor)

    this.labels = new Map() // id sản phẩm → texture nhãn
    this.jars = [0, 1, 2].map(() => this.makeJar())
    for (const j of this.jars) this.root.add(j.group)

    // bụi vàng
    const sp = new BufferGeometry()
    this.sparkPos = new Float32Array(SPARKS * 3)
    this.sparkLife = new Float32Array(SPARKS).fill(-1)
    this.sparkSize = new Float32Array(SPARKS)
    this.sparkVel = new Float32Array(SPARKS * 3)
    // BufferAttribute dùng chung mảng (Float32BufferAttribute sẽ chép ra mảng mới)
    sp.setAttribute('position', new BufferAttribute(this.sparkPos, 3))
    sp.setAttribute('aLife', new BufferAttribute(this.sparkLife, 1))
    sp.setAttribute('aSize', new BufferAttribute(this.sparkSize, 1))
    this.sparks = new Points(sp, this.mats.spark)
    this.sparks.frustumCulled = false
    this.sparks.renderOrder = 3
    this.root.add(this.sparks)

    this.yaw = YAW
    this.yawV = 0
    this.pitch = PITCH
    this.pitchV = 0
    this.tilt = { x: 0, y: 0 }
    this.lid = 0 // góc mở 0..1 (lò xo, mở ra hơi nảy)
    this.lidV = 0
    this.lift = 0
    this.wasOpen = false
    this.hover = null
    this.drag = null
    this.rev = -1
    this.sizeId = null
    this.fontsReady = false
    document.fonts?.ready.then(() => {
      this.fontsReady = true
      this.redrawText()
    })
  }

  makeJar() {
    const group = new Group()
    const b = builder()
    prism(b, { R: JAR_R, y0: 0, y1: JAR_H })
    hexCap(b, { R: JAR_R, y: 0, up: false })
    hexRing(b, { R1: NECK_R, R2: JAR_R, y: JAR_H })
    const glass = new Mesh(b.build(), this.mats.glass)
    glass.renderOrder = 2

    const hb = builder()
    prism(hb, { R: JAR_R - 0.05, y0: 0.05, y1: FILL })
    hexCap(hb, { R: JAR_R - 0.05, y: FILL })
    hexCap(hb, { R: JAR_R - 0.05, y: 0.05, up: false })
    const honeyMat = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: JAR_HONEY_FRAG,
      uniforms: {
        uOpacity: { value: 0 },
        uFill: { value: FILL },
        uLightDir: { value: LIGHT },
        uDeep: { value: new Color() },
        uMid: { value: new Color() },
        uLight: { value: new Color() },
      },
    })
    const honey = new Mesh(hb.build(), honeyMat)

    // cổ + nắp tròn đen bóng, mép trên vát
    const cb = builder()
    const ring = (r, y0, y1, n = 32) => {
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * TAU
        const a1 = ((i + 1) / n) * TAU
        const am = (a0 + a1) / 2
        const P = (a, y) => [r * Math.cos(a), y, r * Math.sin(a)]
        const e = (y) => [FAR, FAR, y - y0, y1 - y]
        cb.quad(vtx(P(a0, y0), [0, 0], e(y0)), vtx(P(a1, y0), [1, 0], e(y0)), vtx(P(a1, y1), [1, 1], e(y1)), vtx(P(a0, y1), [0, 1], e(y1)), [Math.cos(am), 0, Math.sin(am)])
      }
    }
    const disc = (r, y, n = 32) => {
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * TAU
        const a1 = ((i + 1) / n) * TAU
        cb.tri(vtx([0, y, 0], [0.5, 0.5], [r, FAR, FAR, FAR]), vtx([r * Math.cos(a0), y, r * Math.sin(a0)], [0, 0], [0, FAR, FAR, FAR]), vtx([r * Math.cos(a1), y, r * Math.sin(a1)], [1, 0], [0, FAR, FAR, FAR]), [0, 1, 0])
      }
    }
    ring(NECK_R, JAR_H, CAP_Y0 + 0.02)
    ring(CAP_R, CAP_Y0, CAP_Y1 - 0.05)
    ring(CAP_R - 0.05, CAP_Y1 - 0.05, CAP_Y1)
    disc(CAP_R - 0.05, CAP_Y1)
    const cap = new Mesh(cb.build(), this.mats.cap)

    // nhãn trải 3 mặt trước (k = 0, 1, 2): trái → phải là mặt 2, 1, 0
    const lb = builder()
    prism(lb, { R: JAR_R * 1.006, y0: LABEL_Y0, y1: LABEL_Y1, faces: [0, 1, 2], u: (k, t) => (3 - k - t) / 3, edges: false })
    const labelMat = this.paper(null, { defines: { MAP: '' }, edge: 0 })
    const label = new Mesh(lb.build(), labelMat)

    group.add(honey, label, cap, glass)
    group.traverse((m) => (m.frustumCulled = false))
    return { group, honeyMat, labelMat, id: null, show: 0, scale: 0 }
  }

  /** Dựng lại thân hộp, nắp, khay, ruy băng theo kiểu hộp. */
  buildBox(sizeId) {
    if (this.box) {
      this.root.remove(this.box)
      this.box.traverse((m) => m.geometry?.dispose())
    }
    const L = LAYOUT[sizeId] || LAYOUT.trio
    this.layout = L
    const Ri = L.R
    const Ro = Ri + WALL / (SQ3 / 2)
    const Rli = Ro + LID_GAP
    const Rlo = Rli + WALL / (SQ3 / 2)
    const Alo = Rlo * (SQ3 / 2)
    this.span = { R: Rlo, A: Alo, Ri }

    const box = new Group()
    const out = builder()
    prism(out, { R: Ro, y0: 0, y1: BOX_H, u: (k, t) => ((6 - k - t) * Ro) / SIDE_U })
    const bot = builder()
    hexCap(bot, { R: Ro, y: 0, up: false })
    hexRing(bot, { R1: Ri, R2: Ro, y: BOX_H })
    const inn = builder()
    prism(inn, { R: Ri, y0: INSERT_Y, y1: BOX_H, inward: true })
    const pocket = builder()
    for (const [sx, sz] of L.slots) {
      prism(pocket, { cx: sx, cz: sz, R: HOLE_R, y0: JAR_BASE, y1: INSERT_Y, inward: true })
      hexCap(pocket, { cx: sx, cz: sz, R: HOLE_R, y: JAR_BASE })
    }
    const tray = insertGeometry(Ri, L.slots)
    const trayMesh = new Mesh(tray, this.mats.tray)
    box.add(new Mesh(out.build(), this.mats.side), new Mesh(bot.build(), this.mats.plain), new Mesh(inn.build(), this.mats.inside), new Mesh(pocket.build(), this.mats.pocket), trayMesh)

    // nắp: bản lề ở mép dưới phía sau của vành nắp
    const hinge = new Group()
    hinge.position.set(0, BOX_H - SKIRT + 0.04, -Alo)
    const lid = new Group()
    lid.position.set(0, SKIRT, Alo)
    const top = builder()
    hexCap(top, { R: Rlo, y: LID_T })
    const skirt = builder()
    prism(skirt, { R: Rlo, y0: -SKIRT, y1: LID_T })
    prism(skirt, { R: Rli, y0: -SKIRT, y1: 0, inward: true })
    hexRing(skirt, { R1: Rli, R2: Rlo, y: -SKIRT, up: false })
    const under = builder()
    hexCap(under, { R: Rli, y: 0, up: false })
    lid.add(new Mesh(top.build(), this.mats.lid), new Mesh(skirt.build(), this.mats.plain), new Mesh(under.build(), this.mats.lining))

    // ruy băng quanh vành nắp + nơ ở mặt trước
    const band = builder()
    const bandY = -SKIRT * 0.5
    prism(band, { R: Rlo + 0.012, y0: bandY - RIBBON_W / 2, y1: bandY + RIBBON_W / 2, edges: false })
    lid.add(new Mesh(band.build(), this.mats.satin))
    const bow = new Group()
    for (const g of bowGeometries()) bow.add(new Mesh(g, this.mats.satin))
    bow.position.set(0, bandY, Alo + 0.012)
    lid.add(bow)

    // thiệp gài ở mặt trong nắp
    const cardW = Rli * 1.3
    this.card = new Mesh(withDefaults(new PlaneGeometry(cardW, cardW * (680 / 1024))), this.mats.card)
    this.card.rotation.set(Math.PI / 2, 0, 0.04) // úp xuống; mở nắp ra thì đứng thẳng, đầu chữ quay về mép trước nắp
    this.card.position.set(0, -0.014, 0.05)
    lid.add(this.card)

    hinge.add(lid)
    box.add(hinge)
    this.hinge = hinge
    box.traverse((m) => (m.frustumCulled = false))
    this.box = box
    this.root.add(box)

    // ô tổ ong cùng cỡ ở khay (uv = toạ độ mô hình) và lòng nắp (uv 0..1 trên bề ngang nắp)
    this.mats.tray.uniforms.uUvScale.value.set(1 / COMB_TILE, 1 / (COMB_TILE * SQ3))
    this.mats.lining.uniforms.uUvScale.value.set((2 * Rli) / COMB_TILE, (2 * Rli) / (COMB_TILE * SQ3))

    this.shadowSize = Alo * 3.6
    this.shadow.position.set(-0.12 * Alo, 0.004 - PIVOT_Y, -0.1 * Alo) // lệch về phía khuất nắng (trái, sau)
    this.mats.shadow.uniforms.uSize.value = this.shadowSize
    this.mats.shadow.uniforms.uA.value = Alo * 1.02
  }

  labelFor(id) {
    if (!this.labels.has(id)) {
      const p = products.find((x) => x.id === id)
      this.labels.set(id, labelArt(p, honeyTones[p?.tone] || honeyTones.amber))
    }
    return this.labels.get(id)
  }

  /** Font web tải xong → vẽ lại chữ trên nắp, nhãn, thiệp. */
  redrawText() {
    for (const t of this.labels.values()) t.dispose()
    this.labels.clear()
    for (const j of this.jars) if (j.id) j.labelMat.uniforms.uMap.value = this.labelFor(j.id)
    const old = this.cardTex
    this.cardTex = cardArt(getGift().card)
    this.mats.card.uniforms.uMap.value = this.cardTex
    old?.dispose()
    if (this.fontsReady) {
      this.textures.lid.dispose()
      this.textures.lid = lidPrint()
      this.mats.lid.uniforms.uMap.value = this.textures.lid
    }
  }

  /** Đọc trạng thái hộp từ giao diện. */
  sync(g) {
    if (g.size !== this.sizeId) {
      this.sizeId = g.size
      this.buildBox(g.size)
    }
    const slots = this.layout.slots.length
    this.jars.forEach((j, i) => {
      const id = i < slots ? g.jars[i] : null
      j.show = id ? 1 : 0
      if (id && id !== j.id) {
        j.id = id
        const p = products.find((x) => x.id === id)
        const tone = honeyTones[p?.tone] || honeyTones.amber
        const u = j.honeyMat.uniforms
        u.uDeep.value.copy(rawColor(tone.deep))
        u.uMid.value.copy(rawColor(tone.mid))
        u.uLight.value.copy(rawColor(tone.light))
        j.labelMat.uniforms.uMap.value = this.labelFor(id)
      }
      if (i < slots) j.slot = this.layout.slots[i]
    })
    const card = `${g.card.on}|${g.card.text}|${g.card.from}`
    if (card !== this.cardKey) {
      this.cardKey = card
      const old = this.cardTex
      this.cardTex = cardArt(g.card)
      this.mats.card.uniforms.uMap.value = this.cardTex
      old?.dispose()
    }
    this.cardOn = g.card.on
    this.colorTarget = boxColors.find((c) => c.id === g.color) || boxColors[0]
  }

  /** Mở nắp → một nắm bụi vàng bay lên từ miệng hộp. */
  burst() {
    const R = this.span.Ri * 0.7
    for (let i = 0; i < SPARKS; i++) {
      const a = Math.random() * TAU
      const r = Math.sqrt(Math.random()) * R
      this.sparkPos.set([Math.cos(a) * r, BOX_H + 0.1 + Math.random() * 0.5, Math.sin(a) * r], i * 3)
      this.sparkVel.set([(Math.random() - 0.5) * 0.5, 0.7 + Math.random() * 1.1, (Math.random() - 0.5) * 0.5], i * 3)
      this.sparkLife[i] = -Math.random() * 0.5 // xuất hiện lệch nhau một chút
      this.sparkSize[i] = 5 + Math.random() * 9
    }
    this.sparks.geometry.attributes.aSize.needsUpdate = true
  }

  updateSparks(dt) {
    for (let i = 0; i < SPARKS; i++) {
      if (this.sparkLife[i] >= 1) continue
      this.sparkLife[i] += dt * 0.55
      if (this.sparkLife[i] < 0) continue
      const j = i * 3
      this.sparkVel[j + 1] *= Math.exp(-0.6 * dt)
      for (let c = 0; c < 3; c++) this.sparkPos[j + c] += this.sparkVel[j + c] * dt
      this.sparkPos[j] += Math.sin(this.engine.time * 2 + i) * 0.15 * dt
    }
    const at = this.sparks.geometry.attributes
    at.position.needsUpdate = true
    at.aLife.needsUpdate = true
  }

  /** Gắn sự kiện chuột/chạm vào khung (canvas không nhận chuột). */
  bind(el) {
    if (this.el === el) return
    this.el = el
    const on = (type, fn, opts) => this.engine.on(el, type, fn, opts)
    on('pointerdown', (e) => {
      if (e.button > 0) return
      const r = el.getBoundingClientRect()
      this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now(), w: r.width, h: r.height, moved: false, vx: 0, vy: 0 }
      this.yawV = 0
      this.pitchV = 0
      try {
        el.setPointerCapture?.(e.pointerId)
      } catch {
        // con trỏ không còn hoạt động (vd. sự kiện giả lập) — vẫn kéo được nhờ pointermove trên khung
      }
    })
    on(
      'pointermove',
      (e) => {
        const d = this.drag
        if (d && e.pointerId === d.id) {
          // ngang → xoay quanh hộp (tự do); dọc → lật lên/xuống (có giới hạn)
          const dx = e.clientX - d.x
          const dy = e.clientY - d.y
          d.x = e.clientX
          d.y = e.clientY
          if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 6) d.moved = true
          const now = performance.now()
          const sx = (dx / d.w) * 4.2
          const sy = (dy / d.h) * 3.2
          this.yaw += sx
          this.pitch = clamp(this.pitch + sy, PITCH_MIN, PITCH_MAX)
          const span = Math.max((now - d.t) / 1000, 1 / 120)
          d.vx = sx / span
          d.vy = sy / span
          d.t = now
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
      if (d.moved) {
        const fresh = performance.now() - d.t < 80 // thả tay khi đang vuốt → hộp trôi tiếp theo đà
        this.yawV = fresh ? clamp(d.vx, -9, 9) : 0
        this.pitchV = fresh ? clamp(d.vy, -5, 5) : 0
      }
      else if (e.type === 'pointerup') setGift((g) => ({ open: !g.open }))
    }
    on('pointerup', end)
    on('pointercancel', end)
    on('lostpointercapture', end)
    on('pointerleave', () => (this.hover = null))
  }

  update(dt, engine) {
    const a = THREE_CONFIG.effects.giftBox ? this.anchor() : null
    this.intensity = damp(this.intensity, a?.inView ? 1 : 0, 2.6, dt)
    this.group.visible = !!a && this.intensity > 0.01
    if (!this.group.visible) return
    this.bind(a.el)
    const g = getGift()
    if (g.rev !== this.rev) {
      this.rev = g.rev
      this.sync(g)
    }
    const t = engine.time
    const idle = engine.reduced ? 0 : 1

    // màu hộp chuyển mượt
    const k = 1 - Math.exp(-6 * dt)
    for (const key of COLOR_KEYS) this.colors[key].lerp(rawColor(this.colorTarget[key]), k)

    // xoay: kéo tay quay tự do, thả ra thì trôi theo đà rồi dừng
    if (!this.drag) {
      this.yaw += this.yawV * dt
      this.yawV *= Math.exp(-FRICTION * dt)
      this.pitch += this.pitchV * dt
      this.pitchV *= Math.exp(-FRICTION * 1.6 * dt)
      if (this.pitch < PITCH_MIN || this.pitch > PITCH_MAX) {
        this.pitch = clamp(this.pitch, PITCH_MIN, PITCH_MAX)
        this.pitchV = 0
      }
    }
    const hx = this.hover && !this.drag ? this.hover.nx : 0
    const hy = this.hover && !this.drag ? this.hover.ny : 0
    this.tilt.x = damp(this.tilt.x, hy * 0.1, 4, dt)
    this.tilt.y = damp(this.tilt.y, hx * 0.22, 4, dt)

    // nắp: lò xo hơi nảy khi mở; đóng thì êm
    if (g.open && !this.wasOpen && !engine.reduced) this.burst()
    this.wasOpen = g.open
    const target = g.open ? 1 : 0
    const kSpring = engine.reduced ? 60 : 34
    const damping = g.open ? 7.5 : 11
    this.lidV += (kSpring * (target - this.lid) - damping * this.lidV) * dt
    this.lid += this.lidV * dt
    if (!g.open && this.lid < 0) {
      this.lid = 0
      this.lidV = 0
    }
    this.lift = damp(this.lift, g.open ? 1 : 0, g.open ? 2.2 : 5, dt)
    this.hinge.rotation.x = -OPEN_ANGLE * this.lid
    this.card.visible = this.cardOn
    this.seam.y = 1 - smoothstep(0, 0.15, this.lid) // bóng vành nắp chỉ có khi nắp đóng
    this.mats.shadow.uniforms.uStretch.value = 0.35 * clamp(this.lid, 0, 1) // nắp mở ra sau → bóng dài ra sau
    this.updateSparks(dt)

    // ── đặt hộp vào khung ──
    // đóng nắp thì hộp to, đứng giữa khung; mở nắp thì lùi ra cho nắp dựng đứng không tràn khung.
    // hộp đơn được phóng to hơn một chút nhưng vẫn trông nhỏ hơn hộp ba
    const spanTrio = 2 * (LAYOUT.trio.R + (2 * WALL) / (SQ3 / 2) + LID_GAP)
    this.zoom = damp(this.zoom ?? 1, this.sizeId === 'single' ? 1.3 : 1, 3, dt)
    this.frame = damp(this.frame ?? 0, g.open ? 1 : 0, 2.4, dt)
    const f = ease(clamp(this.frame, 0, 1))
    const sClosed = Math.min((a.w * 0.62) / spanTrio, (a.h * 0.6) / (BOX_H + spanTrio * 0.45))
    const sOpen = Math.min((a.w * 0.5) / spanTrio, (a.h * 0.6) / (BOX_H + spanTrio * 0.86))
    const s = (sClosed + (sOpen - sClosed) * f) * this.zoom
    engine.toWorld(a.x, a.top + a.h * (0.6 + 0.06 * f), 0, this.pivot.position)
    this.pivot.scale.setScalar(s)
    const sway = idle * (0.06 * Math.sin(t * 0.33) + 0.02 * noise1(t * 0.2))
    const lean = 0.15 * this.lid * (1 - this.lift * 0.5) // mở nắp: nghiêng thêm chút cho thấy lòng hộp
    this.pivot.rotation.set(this.pitch + this.tilt.x + lean, this.yaw + sway + this.tilt.y, 0)
    this.floor.position.copy(this.pivot.position)
    this.floor.scale.setScalar(s)
    this.floor.rotation.set(PITCH + lean, 0, 0)
    this.shadow.rotation.y = this.yaw + sway + this.tilt.y
    const lifted = smoothstep(0.04, 0.9, Math.abs(this.pitch + this.tilt.x - PITCH))
    this.shadow.scale.set(this.shadowSize * (1 + 0.3 * lifted), 1, this.shadowSize * (1 + 0.3 * lifted))
    const sm = this.mats.spark.uniforms
    sm.uScale.value = s / 40
    sm.uPR.value = engine.pixelRatio

    // hũ: hiện/ẩn bật lên như đặt vào khay; mở nắp thì nhô lên lần lượt
    this.jars.forEach((j, i) => {
      j.scale = damp(j.scale, j.show, j.show ? 7 : 10, dt)
      j.group.visible = j.scale > 0.01 && !!j.slot
      if (!j.group.visible) return
      const pop = j.scale < 0.999 ? Math.sin(Math.PI * j.scale) * 0.08 : 0
      const rise = RISE * smoothstep(0.12 * i, 0.12 * i + 0.76, this.lift)
      j.group.position.set(j.slot[0], JAR_BASE + rise + (1 - j.scale) * 1.2, j.slot[1])
      j.group.scale.setScalar(Math.max(j.scale + pop, 0.001))
    })

    const fade = this.intensity
    for (const m of Object.values(this.mats)) m.uniforms.uOpacity.value = fade
    this.mats.shadow.uniforms.uOpacity.value = fade * (1 - 0.6 * lifted)
    for (const j of this.jars) {
      j.honeyMat.uniforms.uOpacity.value = fade
      j.labelMat.uniforms.uOpacity.value = fade
    }
    this.count = this.jars.filter((j) => j.show).length
  }

  dispose() {
    for (const t of this.labels.values()) t.dispose()
    this.cardTex?.dispose()
    super.dispose()
  }
}
