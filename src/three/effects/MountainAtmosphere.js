import { Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { NOISE, rawColor } from '../shaders/index.js'
import { damp } from '../utils/noise.js'

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Dãy núi xa (2 lớp, lớp xa nhạt hơn) + sương trôi theo gió. Ghép bằng phép "over" alpha thẳng.
const FRAG = /* glsl */ `
${NOISE}
uniform float uTime;
uniform vec2 uWindOffset;
uniform float uIntensity;
uniform vec2 uSize;
uniform float uRidges;
uniform float uFogAmount;
uniform float uSeed;
uniform vec3 uFar;
uniform vec3 uNear;
uniform vec3 uFog;
varying vec2 vUv;

void over(inout vec3 col, inout float a, vec3 c, float ca) {
  float na = ca + a * (1.0 - ca);
  col = (c * ca + col * a * (1.0 - ca)) / max(na, 0.0001);
  a = na;
}

void main() {
  vec2 uv = vUv;
  float x = uv.x * uSize.x / 900.0; // tần số theo px → núi không bị kéo giãn trên màn rộng
  vec3 col = vec3(0.0);
  float a = 0.0;

  if (uRidges > 0.0) {
    float h1 = 0.6 + 0.3 * fbm(vec2(x * 1.7, 1.3), uSeed);
    float h2 = 0.36 + 0.26 * fbm(vec2(x * 2.6 + 4.0, 7.1), uSeed);
    float aa = 1.5 / uSize.y;
    over(col, a, uFar, smoothstep(h1 + aa, h1 - aa, uv.y) * 0.55 * uRidges);
    // sương đọng ở chân dãy xa
    over(col, a, uFog, smoothstep(h1, h1 - 0.25, uv.y) * smoothstep(h2 - 0.1, h2 + 0.1, uv.y) * 0.35 * uRidges);
    over(col, a, uNear, smoothstep(h2 + aa, h2 - aa, uv.y) * 0.7 * uRidges);
    // chân núi chìm hẳn vào sương → nửa dưới dải là nền của section, không có khối / cạnh cứng
    a *= smoothstep(0.05, 0.5, uv.y);
  }

  vec2 fp = vec2(x * 1.6 - uWindOffset.x * 0.0012 - uTime * 0.012, uv.y * 2.6 + uTime * 0.01);
  float f = smoothstep(-0.15, 0.75, fbm(fp, uSeed + 3.0));
  float band = smoothstep(0.0, 0.35, uv.y) * smoothstep(1.0, 0.45, uv.y);
  over(col, a, uFog, f * band * uFogAmount);

  a *= uIntensity * smoothstep(0.0, 0.03, uv.x) * smoothstep(1.0, 0.97, uv.x);
  if (a < 0.002) discard;
  gl_FragColor = vec4(col, a);
}
`

/**
 * Không khí núi rừng: sương + dãy núi xa, đặt trong một dải hình chữ nhật lấy từ DOM.
 * - Hero: chỉ sương sớm trôi ở chân tranh (tranh đã có núi).
 * - Nguồn gốc: núi xa xanh lam + sương ở dải đồng hoa, nằm SAU hoa (z âm, có depth test).
 */
export class MountainAtmosphere extends Effect {
  constructor(engine, palette, { name, band, ridges = false, fog = 0.2, fogColor = palette.mist, far = palette.ridgeFar, near = palette.ridgeNear, z = 0, strength = 1, seed = 1 }) {
    super(engine, name)
    this.band = band
    this.z = z
    this.strength = strength
    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: engine.uniforms.uTime,
        uWindOffset: engine.uniforms.uWindOffset,
        uIntensity: { value: 0 },
        uSize: { value: new Vector2(1, 1) },
        uRidges: { value: ridges ? 1 : 0 },
        uFogAmount: { value: fog },
        uSeed: { value: seed },
        uFar: { value: rawColor(far) },
        uNear: { value: rawColor(near) },
        uFog: { value: rawColor(fogColor) },
      },
    })
    this.mesh = new Mesh(new PlaneGeometry(1, 1), this.material)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 2
    this.group.add(this.mesh)
    this.count = 1
  }

  update(dt, engine) {
    const b = this.band()
    const on = THREE_CONFIG.effects.atmosphere && b?.inView
    this.intensity = damp(this.intensity, on ? this.strength : 0, 1.5, dt)
    this.group.visible = !!b && this.intensity > 0.002
    if (!this.group.visible) return
    const k = engine.scaleAt(this.z)
    engine.toWorld(b.left + b.width / 2, b.top + b.height / 2, this.z, this.mesh.position)
    this.mesh.scale.set(b.width * k, b.height * k, 1)
    this.material.uniforms.uSize.value.set(b.width, b.height)
    this.material.uniforms.uIntensity.value = this.intensity
  }
}
