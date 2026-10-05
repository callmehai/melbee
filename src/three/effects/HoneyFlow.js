import { BufferAttribute, BufferGeometry, CatmullRomCurve3, DataTexture, FloatType, NearestFilter, Points, RGBAFormat, ShaderMaterial, Vector2, Vector3 } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { POLLEN_FRAG, SPACE, rawColor } from '../shaders/index.js'
import { clamp, damp } from '../utils/noise.js'
import { createRandom } from '../utils/random.js'

const SAMPLES = 512

// Đọc một điểm trên đường đi (texture mẫu) — nội suy tuyến tính giữa 2 mẫu kề nhau.
const PATH = /* glsl */ `
uniform sampler2D uPath;
vec2 pathAt(float t) {
  float f = clamp(t, 0.0, 1.0) * ${SAMPLES - 1}.0;
  float i = floor(f);
  vec2 a = texture2D(uPath, vec2((i + 0.5) / ${SAMPLES}.0, 0.5)).xy;
  vec2 b = texture2D(uPath, vec2((min(i + 1.0, ${SAMPLES - 1}.0) + 0.5) / ${SAMPLES}.0, 0.5)).xy;
  return mix(a, b, f - i);
}
`

const VERT = /* glsl */ `
${SPACE}
${PATH}
uniform float uTime;
uniform vec2 uViewport;
uniform float uD;
uniform float uPixelRatio;
uniform sampler2D uBg;
uniform vec2 uOrigin; // góc trên-trái timeline (px CSS)
uniform float uFill; // dòng mật đã chảy tới đâu (0–1 theo đường đi)
uniform float uIntensity;
uniform float uLateral;

attribute vec4 aSeed; // vị trí đầu, tốc độ, lệch ngang, cỡ
attribute float aKind; // 0 = trong dòng, 1 = hạt tách khỏi dòng

varying float vAlpha;
varying float vDark;

void main() {
  float t = fract(aSeed.x + uTime * aSeed.y);
  vec2 p = pathAt(t);
  vec2 tangent = normalize(pathAt(t + 0.004) - p + vec2(0.0, 0.0001));
  vec2 normal = vec2(-tangent.y, tangent.x);

  float lat = aSeed.z * uLateral + sin(uTime * 2.0 + aSeed.x * 50.0) * 1.5;
  float alpha = 1.0;
  if (aKind > 0.5) {
    // thỉnh thoảng một giọt nhỏ tách khỏi dòng, trôi ra ngoài rồi tan
    float life = fract(aSeed.x * 7.0 + uTime * 0.12 * (1.0 + aSeed.y * 20.0));
    lat += life * life * 70.0 * sign(aSeed.z);
    p.y += life * 18.0;
    alpha = 1.0 - life;
  }
  p += normal * lat;

  vec2 s = domToCentered(uOrigin + p, uViewport);
  float z = (aSeed.w - 0.5) * 60.0;
  vec4 mv = modelViewMatrix * vec4(screenToWorld(s, z, uD), 1.0);
  gl_Position = projectionMatrix * mv;

  // chỉ hiện phần dòng đã "chảy" tới; mũi dòng sáng và to hơn
  float behind = smoothstep(uFill + 0.004, uFill - 0.01, t);
  float head = smoothstep(0.05, 0.0, abs(uFill - t));
  gl_PointSize = (2.6 + aSeed.w * 4.0 + head * 3.5) * uPixelRatio * (uD / -mv.z);
  vDark = backgroundDarkness(uBg, gl_Position);
  vAlpha = alpha * behind * uIntensity * (0.6 + 0.4 * aSeed.w + head * 0.4);
}
`

// Hạt sáng ở mỗi mốc quy trình: bừng lên khi dòng mật chảy tới
const BEAD_VERT = /* glsl */ `
${SPACE}
${PATH}
uniform float uTime;
uniform vec2 uViewport;
uniform float uD;
uniform float uPixelRatio;
uniform sampler2D uBg;
uniform vec2 uOrigin;
uniform float uFill;
uniform float uIntensity;
attribute float aT;
varying float vAlpha;
varying float vDark;
void main() {
  vec2 s = domToCentered(uOrigin + pathAt(aT), uViewport);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(screenToWorld(s, 0.0, uD), 1.0);
  float lit = smoothstep(aT - 0.01, aT + 0.01, uFill);
  float pulse = 0.85 + 0.15 * sin(uTime * 1.6 + aT * 20.0);
  gl_PointSize = 70.0 * pulse * uPixelRatio;
  vDark = backgroundDarkness(uBg, gl_Position);
  vAlpha = lit * uIntensity * 0.9;
}
`

/**
 * Dòng mật chảy dọc trục timeline "Quy trình": Mùa hoa → Đàn ong → Thu mật → Lọc → Đóng chai.
 * Đường đi là CatmullRomCurve3 qua từng mốc (lượn nhẹ giữa các mốc), lấy mẫu vào texture;
 * toàn bộ hạt chạy trên GPU. Dòng chỉ chảy tới chỗ người xem đã cuộn tới.
 */
export class HoneyFlow extends Effect {
  constructor(engine, palette, { timeline }) {
    super(engine, 'Dòng mật')
    this.el = timeline()
    this.fill = 0
    this.pathData = new Float32Array(SAMPLES * 4)
    this.pathTex = new DataTexture(this.pathData, SAMPLES, 1, RGBAFormat, FloatType)
    this.pathTex.magFilter = NearestFilter
    this.pathTex.minFilter = NearestFilter
    this.ys = new Float32Array(SAMPLES)
    this.height = 1

    const max = THREE_CONFIG.honeyFlow.high
    const rnd = createRandom(19)
    const seed = new Float32Array(max * 4)
    const kind = new Float32Array(max)
    for (let i = 0; i < max; i++) {
      seed.set([rnd.next(), rnd.range(0.018, 0.034), rnd.range(-1, 1), rnd.next()], i * 4)
      kind[i] = rnd.next() < 0.12 ? 1 : 0
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(new Float32Array(max * 3), 3))
    geo.setAttribute('aSeed', new BufferAttribute(seed, 4))
    geo.setAttribute('aKind', new BufferAttribute(kind, 1))

    const shared = {
      ...engine.uniforms,
      uPath: { value: this.pathTex },
      uOrigin: { value: new Vector2() },
      uFill: { value: 0 },
      uIntensity: { value: 0 },
      uLateral: { value: 5 },
      uGlow: { value: THREE_CONFIG.bloom ? 1 : 0 },
      uColorLight: { value: rawColor(palette.honeyMid) },
      uColorDark: { value: rawColor(palette.honeyLight) },
    }
    const common = { fragmentShader: POLLEN_FRAG, transparent: true, depthWrite: false, depthTest: false, uniforms: shared }
    this.material = new ShaderMaterial({ ...common, vertexShader: VERT })
    this.points = new Points(geo, this.material)
    this.points.frustumCulled = false
    this.points.renderOrder = 6

    this.beadGeo = new BufferGeometry()
    this.beadMat = new ShaderMaterial({ ...common, vertexShader: BEAD_VERT })
    this.beads = new Points(this.beadGeo, this.beadMat)
    this.beads.frustumCulled = false
    this.beads.renderOrder = 6
    this.group.add(this.points, this.beads)

    if (this.el) {
      this.ro = new ResizeObserver(() => this.buildPath())
      this.ro.observe(this.el)
    }
  }

  /** Dựng đường đi qua tâm các mốc (toạ độ tương đối với timeline). */
  buildPath() {
    const el = this.el
    if (!el) return
    const box = el.getBoundingClientRect()
    const dots = [...el.querySelectorAll('.step__dot')].map((d) => {
      const r = d.getBoundingClientRect()
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }
    })
    if (!dots.length) return
    const trackX = dots[0].x
    const amp = box.width < 700 ? 0 : 12
    const pts = [new Vector3(trackX, 0, 0)]
    dots.forEach((d, i) => {
      const prevY = i ? dots[i - 1].y : 0
      pts.push(new Vector3(trackX + (i % 2 ? amp : -amp), (prevY + d.y) / 2, 0))
      pts.push(new Vector3(d.x, d.y, 0))
    })
    pts.push(new Vector3(trackX, box.height, 0))
    const curve = new CatmullRomCurve3(pts, false, 'centripetal')
    const samples = curve.getSpacedPoints(SAMPLES - 1)
    samples.forEach((p, i) => {
      this.pathData[i * 4] = p.x
      this.pathData[i * 4 + 1] = p.y
      this.ys[i] = p.y
    })
    this.pathTex.needsUpdate = true
    this.height = box.height
    this.material.uniforms.uLateral.value = amp ? 4 : 2.5

    // vị trí (theo t) của từng mốc → hạt sáng
    const ts = dots.map((d) => {
      let best = 0
      let bestD = Infinity
      samples.forEach((p, i) => {
        const dd = (p.x - d.x) ** 2 + (p.y - d.y) ** 2
        if (dd < bestD) {
          bestD = dd
          best = i
        }
      })
      return best / (SAMPLES - 1)
    })
    this.beadGeo.deleteAttribute('position')
    this.beadGeo.deleteAttribute('aT')
    this.beadGeo.setAttribute('position', new BufferAttribute(new Float32Array(ts.length * 3), 3))
    this.beadGeo.setAttribute('aT', new BufferAttribute(new Float32Array(ts), 1))
    this.ready = true
  }

  /** Chiều cao đã cuộn tới (px trong timeline) → t trên đường đi. */
  tAtY(y) {
    let lo = 0
    let hi = SAMPLES - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (this.ys[mid] < y) lo = mid + 1
      else hi = mid
    }
    return lo / (SAMPLES - 1)
  }

  setQuality(q) {
    this.count = THREE_CONFIG.effects.honeyFlow ? THREE_CONFIG.honeyFlow[q] : 0
    this.points.geometry.setDrawRange(0, this.count)
  }

  resize() {
    this.buildPath()
  }

  update(dt, engine) {
    if (!this.el || !this.count) {
      this.group.visible = false
      return
    }
    if (!this.ready) this.buildPath()
    const r = this.el.getBoundingClientRect()
    const H = engine.H
    const inView = r.bottom > -100 && r.top < H + 100
    this.intensity = damp(this.intensity, inView ? 1 : 0, 3, dt)
    this.group.visible = this.ready && this.intensity > 0.01
    if (!this.group.visible) return

    // cùng nhịp với vạch vàng của timeline (framer-motion: 'start 75%' → 'end 65%')
    const progress = engine.reduced ? 1 : clamp((H * 0.75 - r.top) / (r.height + H * 0.1), 0, 1)
    this.fill = damp(this.fill, this.tAtY(progress * this.height), 4, dt)
    const u = this.material.uniforms
    u.uOrigin.value.set(r.left, r.top)
    u.uFill.value = this.fill
    u.uIntensity.value = this.intensity
  }

  dispose() {
    this.ro?.disconnect()
    super.dispose()
  }
}
