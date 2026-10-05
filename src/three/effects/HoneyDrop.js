import { LatheGeometry, Mesh, MeshPhysicalMaterial, PlaneGeometry, ShaderMaterial, Vector2, Color } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { DISTORTION, HONEY_FRAG, NOISE, rawColor } from '../shaders/index.js'
import { clamp, damp } from '../utils/noise.js'

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

const HALO_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const HALO_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float r = length(vUv - 0.5) * 2.0;
  float a = pow(max(0.0, 1.0 - r), 2.4) * uOpacity;
  if (a < 0.002) discard;
  gl_FragColor = vec4(uColor, a);
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

/**
 * Giọt mật 3D. Mặc định dùng shader mật ong tự viết (honey.glsl) — vì canvas trong suốt
 * nằm trên trang web, transmission của MeshPhysicalMaterial không "nhìn" được nội dung DOM
 * phía sau nên trông tối và đục. honeyShader: false → dùng MeshPhysicalMaterial (clearcoat).
 *
 * mode 'hero': lơ lửng ở Hero, đàn ong lượn quanh.
 * mode 'reveal': rơi từ trên xuống khi cuộn tới section "Mật ong" (scale 0→1, mờ → rõ, xoay nhẹ),
 * bay đi khi cuộn qua. Không tạo/huỷ object — chỉ đổi giá trị.
 */
export class HoneyDrop extends Effect {
  constructor(engine, palette, { name, anchor, mode = 'hero', renderOrder = 8 }) {
    super(engine, name)
    this.anchor = anchor
    this.mode = mode
    this.enter = 0
    this.leave = 0
    sharedGeometry ||= dropGeometry()
    geometryUsers++
    this.geometry = sharedGeometry

    if (THREE_CONFIG.honeyShader) {
      this.material = new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: `${NOISE}\n${HONEY_FRAG}`,
        transparent: true,
        uniforms: {
          uTime: engine.uniforms.uTime,
          uOpacity: { value: 0 },
          uGlow: { value: THREE_CONFIG.bloom ? 1 : 0.4 },
          uDistort: { value: engine.reduced ? 0.3 : 1 },
          uDeep: { value: rawColor(palette.honeyDeep) },
          uMid: { value: rawColor(palette.honeyMid) },
          uLight: { value: rawColor(palette.honeyLight) },
        },
      })
    } else {
      this.material = new MeshPhysicalMaterial({
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
      engine.ensureLights()
    }
    this.mesh = new Mesh(this.geometry, this.material)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = renderOrder

    this.halo = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader: HALO_VERT,
        fragmentShader: HALO_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: { uColor: { value: rawColor(palette.honeyLight) }, uOpacity: { value: 0 } },
      })
    )
    this.halo.frustumCulled = false
    this.halo.renderOrder = renderOrder - 1
    this.group.add(this.halo, this.mesh)
    this.count = 1
  }

  update(dt, engine) {
    const a = THREE_CONFIG.effects.honeyDrop ? this.anchor() : null
    const H = engine.H
    let show = 0
    let offsetY = 0
    let spin = 0
    let scale = 1

    if (a && this.mode === 'reveal') {
      // vào: mép trên khung ảnh đi từ 95% → 45% chiều cao màn hình
      const e = clamp((H * 0.95 - a.top) / (H * 0.5), 0, 1)
      // ra: mép dưới khung ảnh đi lên quá 35% màn hình
      const l = clamp((H * 0.35 - a.bottom) / (H * 0.35), 0, 1)
      const speed = engine.reduced ? 20 : 3
      this.enter = damp(this.enter, e, speed, dt)
      this.leave = damp(this.leave, l, speed, dt)
      const back = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2) // easeOutBack
      scale = back(this.enter) * (1 - this.leave * 0.3)
      show = this.enter * (1 - this.leave)
      offsetY = -(1 - this.enter) * 180 - this.leave * 120
      spin = (1 - this.enter) * 2.2
    } else if (a) {
      show = a.inView ? clamp(a.visibility * 1.4, 0, 1) : 0
    }

    this.intensity = damp(this.intensity, show, 3, dt)
    this.group.visible = !!a && this.intensity > 0.01
    if (!this.group.visible) return

    const t = engine.time
    const r = a.r * Math.max(0.001, scale)
    const float = engine.reduced ? 0 : Math.sin(t * 0.8) * 6
    engine.toWorld(a.sx, a.sy + offsetY + float, 0, this.mesh.position)
    this.mesh.scale.setScalar(r)
    this.mesh.rotation.set(Math.sin(t * 0.35) * 0.06, t * 0.25 + spin, Math.sin(t * 0.5) * 0.08)

    const dark = engine.isDarkAt(a.sy)
    this.halo.position.copy(this.mesh.position)
    this.halo.position.z -= 1
    this.halo.scale.setScalar(r * (dark ? 6 : 4.5))
    this.halo.material.uniforms.uOpacity.value = (THREE_CONFIG.bloom ? (dark ? 0.32 : 0.22) : 0) * this.intensity

    if (this.material.isShaderMaterial) this.material.uniforms.uOpacity.value = this.intensity
    else this.material.opacity = this.intensity * 0.92
  }

  dispose() {
    this.group.remove(this.mesh)
    this.material.dispose()
    super.dispose()
    // hình học dùng chung giữa các giọt: chỉ huỷ khi giọt cuối cùng bị dọn
    if (--geometryUsers === 0) {
      sharedGeometry.dispose()
      sharedGeometry = null
    }
  }
}
