import {
  BufferAttribute,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  ShaderMaterial,
  Vector2,
  Vector4,
} from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { NOISE, SPACE, rawColor } from '../shaders/index.js'
import { createRandom } from '../utils/random.js'

// Mọi cây hoa, ngọn cỏ cùng lay theo MỘT trường gió: sóng chạy dọc trục x + nhiễu + độ mạnh gió chung.
const VERT = /* glsl */ `
${NOISE}
${SPACE}
uniform float uTime;
uniform vec2 uViewport;
uniform float uD;
uniform vec3 uWind;
uniform vec2 uWindOffset;
uniform vec4 uBand; // trái, trên, rộng, cao (px CSS)
uniform vec2 uDepthRange;
uniform float uGrow;
uniform float uHeight;
uniform vec3 uStemDark;
uniform vec3 uStemLight;
uniform vec3 uCenter;

attribute float aPart; // 0 thân/lá, 1 cánh (hoặc ngọn cỏ), 2 nhuỵ
attribute vec4 aInst; // vị trí x (0–1), độ sâu (0–1), tỉ lệ cao, pha
attribute vec3 aColor;
attribute float aRot;

varying vec3 vColor;
varying float vFog;

void main() {
  float zt = aInst.y;
  float z = mix(uDepthRange.x, uDepthRange.y, zt);
  float sx = uBand.x + aInst.x * uBand.z;
  float sy = uBand.y + uBand.w * mix(0.6, 1.04, zt); // hàng xa mọc cao hơn (đường chân trời)
  vec3 base = screenToWorld(domToCentered(vec2(sx, sy), uViewport), z, uD);

  // mọc lên lần lượt từ trái sang phải khi section vào màn hình
  float grow = clamp(uGrow * 1.7 - aInst.x * 0.7, 0.0, 1.0);
  grow = 1.0 - pow(1.0 - grow, 3.0);

  float height = uBand.w * uHeight * aInst.z * mix(0.6, 1.0, zt) * grow;
  vec3 p = position;
  float c = cos(aRot), s = sin(aRot);
  p.xz = mat2(c, -s, s, c) * p.xz;
  p *= height;

  // gió: sóng chạy theo hướng gió + gió giật nhiễu + rung nhẹ riêng từng cây
  float wave = sin(uTime * 1.5 - sx * 0.006 + uWindOffset.x * 0.004);
  float gust = snoise(vec3(sx * 0.0025 - uWindOffset.x * 0.002, z * 0.004, uTime * 0.25));
  float bend = (0.08 + 0.32 * uWind.z) * (0.55 * wave + 0.45 * gust)
             + 0.1 * uWind.z * sign(uWind.x)
             + sin(uTime * 2.3 + aInst.w) * 0.02;
  float k = position.y * position.y; // gốc đứng yên, ngọn lay nhiều
  p.x += bend * k * height;
  p.y -= abs(bend) * k * height * 0.3;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(base + p, 1.0);

  vec3 col = aPart < 0.5 ? mix(uStemDark, uStemLight, position.y) : (aPart < 1.5 ? aColor : uCenter);
  vColor = col * (0.55 + 0.45 * clamp(position.y * 1.2, 0.0, 1.0));
  vFog = 1.0 - zt;
}
`

const FRAG = /* glsl */ `
uniform vec3 uFogColor;
uniform vec2 uClip; // đáy, đỉnh section theo toạ độ gl_FragCoord.y
varying vec3 vColor;
varying float vFog;
void main() {
  if (gl_FragCoord.y < uClip.x || gl_FragCoord.y > uClip.y) discard;
  gl_FragColor = vec4(mix(vColor, uFogColor, vFog * 0.6), 1.0);
}
`

/** Thêm một tứ giác (2 tam giác) vào mảng. */
function quad(out, a, b, c, d, part) {
  for (const v of [a, b, c, a, c, d]) {
    out.pos.push(...v)
    out.part.push(part)
  }
}

/** Hoa low-poly: thân 2 dải bắt chéo (nhìn có khối), 2 lá, 6 cánh hướng về camera, nhuỵ. */
function flowerGeometry() {
  const out = { pos: [], part: [] }
  const SEG = 5
  for (const ang of [0, Math.PI / 2]) {
    const cx = Math.cos(ang)
    const cz = Math.sin(ang)
    for (let i = 0; i < SEG; i++) {
      const y0 = (i / SEG) * 0.96
      const y1 = ((i + 1) / SEG) * 0.96
      const w0 = 0.016 * (1 - y0 * 0.4)
      const w1 = 0.016 * (1 - y1 * 0.4)
      quad(out, [-w0 * cx, y0, -w0 * cz], [w0 * cx, y0, w0 * cz], [w1 * cx, y1, w1 * cz], [-w1 * cx, y1, -w1 * cz], 0)
    }
  }
  // lá
  for (const [y, dir] of [
    [0.3, 1],
    [0.45, -1],
  ]) {
    const tip = [dir * 0.16, y + 0.12, 0.02]
    const mid = [dir * 0.07, y + 0.08, 0.04]
    const mid2 = [dir * 0.09, y + 0.02, -0.02]
    quad(out, [0, y, 0], mid2, tip, mid, 0)
  }
  // cánh hoa: 5 đỉnh (đầu cánh bo tròn) quanh tâm, mặt hoa ngửa về phía trước-lên
  const R = 0.13
  const tilt = -0.55
  const rot = ([x, y, z]) => [x, y * Math.cos(tilt) - z * Math.sin(tilt) + 1, y * Math.sin(tilt) + z * Math.cos(tilt)]
  const PETALS = 6
  for (let k = 0; k < PETALS; k++) {
    const a = (k / PETALS) * Math.PI * 2
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const at = (ang, r, z) => rot([Math.cos(ang) * r, Math.sin(ang) * r, z])
    const p0 = rot([0, 0, 0])
    const p1 = at(a - 0.5, R * 0.55, 0.01)
    const p2 = at(a - 0.2, R, 0.02)
    const p3 = at(a + 0.2, R, 0.02)
    const p4 = at(a + 0.5, R * 0.55, 0.01)
    const tip = rot([ca * R * 1.06, sa * R * 1.06, 0.02])
    quad(out, p0, p1, p2, tip, 1)
    quad(out, p0, tip, p3, p4, 1)
  }
  // nhuỵ
  const C = 0.035
  quad(out, rot([-C, -C, 0.03]), rot([C, -C, 0.03]), rot([C, C, 0.03]), rot([-C, C, 0.03]), 2)
  return out
}

/** Ngọn cỏ: dải thon nhọn 4 đoạn. */
function grassGeometry() {
  const out = { pos: [], part: [] }
  const SEG = 4
  for (let i = 0; i < SEG; i++) {
    const y0 = i / SEG
    const y1 = (i + 1) / SEG
    const w0 = 0.03 * (1 - y0)
    const w1 = 0.03 * (1 - y1)
    quad(out, [-w0, y0, 0], [w0, y0, 0], [w1, y1, 0], [-w1, y1, 0], 1)
  }
  return out
}

function instanced(src, max) {
  const geo = new InstancedBufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array(src.pos), 3))
  geo.setAttribute('aPart', new BufferAttribute(new Float32Array(src.part), 1))
  geo.setAttribute('aInst', new InstancedBufferAttribute(new Float32Array(max * 4), 4))
  geo.setAttribute('aColor', new InstancedBufferAttribute(new Float32Array(max * 3), 3))
  geo.setAttribute('aRot', new InstancedBufferAttribute(new Float32Array(max), 1))
  geo.instanceCount = max
  return geo
}

/**
 * Cánh đồng hoa Tây Bắc ở chân section "Nguồn gốc" (instancing: 1 draw call cho hoa, 1 cho cỏ).
 * Hoa trắng (ban), hồng (tam giác mạch), vàng (cải), tím nhạt; cỏ nhiều sắc xanh.
 */
export class FlowerField extends Effect {
  constructor(engine, palette, { band }) {
    super(engine, 'Cánh đồng hoa')
    this.band = band
    this.grow = 0
    const rnd = createRandom(5)
    const toRgb = (hex) => {
      const c = rawColor(hex)
      return [c.r, c.g, c.b]
    }

    const makeMaterial = (heightScale) =>
      new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        side: DoubleSide,
        uniforms: {
          ...engine.uniforms,
          uBand: { value: new Vector4() },
          uDepthRange: { value: new Vector2(-320, 160) },
          uGrow: { value: 0 },
          uHeight: { value: heightScale },
          uStemDark: { value: rawColor(palette.stemDark) },
          uStemLight: { value: rawColor(palette.stemLight) },
          uCenter: { value: rawColor(palette.flowerCenter) },
          uFogColor: { value: rawColor(palette.forestFar) },
          uClip: { value: new Vector2() },
        },
      })

    // hoa
    const fMax = THREE_CONFIG.flowers.high
    const fGeo = instanced(flowerGeometry(), fMax)
    const fInst = fGeo.attributes.aInst.array
    const fCol = fGeo.attributes.aColor.array
    const fRot = fGeo.attributes.aRot.array
    for (let i = 0; i < fMax; i++) {
      // rải đều theo x (có xáo nhẹ) để cấp thấp vẫn phủ hết bề ngang
      const order = (i * 0.618034) % 1
      fInst.set([order, rnd.next(), rnd.range(0.55, 1), rnd.range(0, 6.28)], i * 4)
      fCol.set(toRgb(rnd.pick(palette.petals)), i * 3)
      fRot[i] = rnd.range(-0.6, 0.6)
    }
    this.flowerMat = makeMaterial(0.78)
    this.flowers = new Mesh(fGeo, this.flowerMat)

    // cỏ
    const gMax = THREE_CONFIG.grass.high
    const gGeo = instanced(grassGeometry(), gMax)
    const gInst = gGeo.attributes.aInst.array
    const gCol = gGeo.attributes.aColor.array
    const gRot = gGeo.attributes.aRot.array
    for (let i = 0; i < gMax; i++) {
      gInst.set([(i * 0.618034 + rnd.next() * 0.02) % 1, rnd.next(), rnd.range(0.25, 0.6), rnd.range(0, 6.28)], i * 4)
      gCol.set(toRgb(rnd.pick(palette.grass)), i * 3)
      gRot[i] = rnd.range(-1.2, 1.2)
    }
    this.grassMat = makeMaterial(0.7)
    this.grass = new Mesh(gGeo, this.grassMat)

    for (const m of [this.flowers, this.grass]) {
      m.frustumCulled = false
      m.renderOrder = 3
      this.group.add(m)
    }
  }

  setQuality(q, engine) {
    const level = engine.reduced ? 'low' : q
    this.flowers.geometry.instanceCount = THREE_CONFIG.flowers[level]
    this.grass.geometry.instanceCount = THREE_CONFIG.grass[level]
    this.count = this.flowers.geometry.instanceCount
  }

  update(dt, engine) {
    const b = this.band()
    const on = THREE_CONFIG.effects.flowers && b?.inView
    this.group.visible = !!on
    this.intensity = on ? 1 : 0
    if (!on) return
    // mọc lên khi dải đồng cỏ vào ~85% màn hình; giảm chuyển động → hiện ngay
    if (b.top < engine.H * 0.85) this.grow = engine.reduced ? 1 : Math.min(1, this.grow + dt * 0.6)
    const pr = engine.pixelRatio
    for (const mat of [this.flowerMat, this.grassMat]) {
      const u = mat.uniforms
      u.uBand.value.set(b.left, b.top, b.width, b.height)
      u.uGrow.value = this.grow
      u.uClip.value.set((engine.H - b.bottom) * pr, (engine.H - b.sectionTop) * pr)
    }
  }
}
