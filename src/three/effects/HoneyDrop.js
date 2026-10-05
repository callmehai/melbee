import { Color, LatheGeometry, Mesh, MeshPhysicalMaterial, ShaderMaterial, Vector2 } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { DISTORTION, HONEY_FRAG, NOISE, rawColor } from '../shaders/index.js'
import { damp, smoothstep } from '../utils/noise.js'

const VERT = /* glsl */ `
${NOISE}
${DISTORTION}
uniform float uTime;
uniform float uDistort;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vObj;
void main() {
  vec3 p = viscousDistort(position, normal, uTime, uDistort);
  vObj = p;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = -mv.xyz;
  vNormal = normalMatrix * normal;
  gl_Position = projectionMatrix * mv;
}
`

/** Biên dạng giọt nước: đáy tròn, đỉnh nhọn — xoay quanh trục Y (LatheGeometry). */
function dropGeometry() {
  const pts = []
  const N = 64
  for (let i = 0; i <= N; i++) {
    const t = Math.PI - (i / N) * Math.PI // từ đáy (π) lên đỉnh (0)
    const x = Math.sin(t) * Math.pow(Math.sin(t / 2), 1.35) * 0.95
    const y = Math.cos(t) * 1.15 + 0.15
    pts.push(new Vector2(Math.max(0, x), y))
  }
  return new LatheGeometry(pts, 72)
}

let sharedGeometry = null
let geometryUsers = 0

/** Hình giọt mật dùng chung (giọt ở "Mật ong", giọt nhỏ từ tổ ong). Nhớ gọi releaseDropGeometry khi dọn. */
export function acquireDropGeometry() {
  sharedGeometry ||= dropGeometry()
  geometryUsers++
  return sharedGeometry
}

export function releaseDropGeometry() {
  if (--geometryUsers === 0) {
    sharedGeometry.dispose()
    sharedGeometry = null
  }
}

/**
 * Vật liệu mật ong. Mặc định là shader tự viết (honey.glsl) — vì canvas trong suốt nằm trên
 * trang web, transmission của MeshPhysicalMaterial không "nhìn" được nội dung DOM phía sau
 * nên trông tối và đục. honeyShader: false → MeshPhysicalMaterial (clearcoat).
 */
export function createHoneyMaterial(engine, palette, tone = {}) {
  if (THREE_CONFIG.honeyShader) {
    return new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: `${NOISE}\n${HONEY_FRAG}`,
      transparent: true,
      uniforms: {
        uTime: engine.uniforms.uTime,
        uOpacity: { value: 0 },
        uGlow: { value: (THREE_CONFIG.bloom ? 1 : 0.4) * (tone.glow ?? 1) },
        uDistort: { value: engine.reduced ? 0.3 : 1 },
        uDeep: { value: rawColor(tone.deep || palette.honeyDeep) },
        uMid: { value: rawColor(tone.mid || palette.honeyMid) },
        uLight: { value: rawColor(tone.light || palette.honeyLight) },
      },
    })
  }
  engine.ensureLights()
  return new MeshPhysicalMaterial({
    color: new Color(palette.honeyMid),
    emissive: new Color(palette.honeyDeep),
    emissiveIntensity: 0.35,
    roughness: 0.12,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    ior: 1.49,
    sheen: 0.4,
    sheenColor: new Color(palette.honeyLight),
    transparent: true,
    opacity: 0,
  })
}

export function setHoneyOpacity(material, v) {
  if (material.isShaderMaterial) material.uniforms.uOpacity.value = v
  else material.opacity = v * 0.92
}

/**
 * Giọt mật nhỏ xuống từ đầu dòng mật trong tranh tổ ong (section "Mật ong là gì"):
 * hình thành ở đầu dòng, kéo dài cổ, rơi rồi tan — lặp lại. Vị trí lấy từ mốc vô hình
 * data-drip-tip trong SVG nên luôn khớp tranh dù ảnh co giãn; màu lấy theo gradient của tranh.
 * Có ảnh thật thay tranh (không còn mốc) → giọt tự ẩn.
 */
export class HoneyDrop extends Effect {
  constructor(engine, palette, { name, anchor, tone, period = 5.5, renderOrder = 8 }) {
    super(engine, name)
    this.anchor = anchor
    this.period = period
    this.geometry = acquireDropGeometry()
    this.material = createHoneyMaterial(engine, palette, tone)
    this.mesh = new Mesh(this.geometry, this.material)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = renderOrder
    this.group.add(this.mesh)
    this.count = 1
  }

  update(dt, engine) {
    const a = THREE_CONFIG.effects.honeyDrop ? this.anchor() : null
    this.intensity = damp(this.intensity, a?.inView ? 1 : 0, 3, dt)
    this.group.visible = !!a && this.intensity > 0.01
    if (!this.group.visible) return

    // 0–65% thành hình, 65–85% kéo dài cổ, 85–100% rơi và tan
    const p = engine.reduced ? 0.55 : (engine.time % this.period) / this.period
    const grow = 0.3 + 0.7 * smoothstep(0, 0.65, p)
    const neck = 1 + 0.4 * smoothstep(0.5, 0.85, p)
    const fall = p > 0.85 ? (p - 0.85) * this.period : 0 // giây kể từ lúc rơi
    // thân giọt (rộng ~1.5 đơn vị) bằng bề ngang dòng mật trong tranh
    const size = (a.width / 1.5) * grow
    // đỉnh giọt (y ≈ 1.3) lồng vào đầu dòng mật, phần thân treo bên dưới
    const top = a.y - a.width * 0.45
    const sy = top + 1.3 * size * neck + 0.5 * 1400 * fall * fall
    engine.toWorld(a.x, sy, 0, this.mesh.position)
    this.mesh.scale.set(size, size * neck, size)
    this.mesh.rotation.set(0, engine.time * 0.3, 0)
    setHoneyOpacity(this.material, this.intensity * (1 - smoothstep(0.9, 1, p)))
  }

  dispose() {
    this.group.remove(this.mesh)
    this.material.dispose()
    super.dispose()
    releaseDropGeometry()
  }
}
