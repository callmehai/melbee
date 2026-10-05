import { Color, LatheGeometry, MeshPhysicalMaterial, ShaderMaterial, Vector2 } from 'three'
import { THREE_CONFIG } from '../config.js'
import { DISTORTION, HONEY_FRAG, NOISE, rawColor } from '../shaders/index.js'

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

/** Hình giọt mật dùng chung (giọt treo và giọt rơi ở bánh tổ). Nhớ gọi releaseDropGeometry khi dọn. */
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
