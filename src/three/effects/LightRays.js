import { Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { rawColor } from '../shaders/index.js'
import { damp } from '../utils/noise.js'

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Tia nắng xuyên rừng: các dải sáng toả từ một nguồn ngoài góc, trôi rất chậm.
const FRAG = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform vec2 uSize;
uniform vec2 uSource;
uniform vec2 uDirection;
uniform vec3 uColor;
varying vec2 vUv;

void main() {
  vec2 d = (vUv - uSource) * uSize;
  float dist = length(d) / max(uSize.x, uSize.y);
  float ang = atan(d.y, d.x);
  float t = uTime;
  float rays = smoothstep(0.35, 1.0, sin(ang * 11.0 + sin(ang * 3.0 + t * 0.07) * 1.6 + t * 0.03)) * 0.7
             + smoothstep(0.55, 1.0, sin(ang * 23.0 - t * 0.045 + 1.3)) * 0.45
             + smoothstep(0.7, 1.0, sin(ang * 5.0 + t * 0.02 + 2.0)) * 0.5;
  float cone = smoothstep(0.45, 1.0, dot(normalize(d), normalize(uDirection)));
  float fall = smoothstep(1.3, 0.05, dist) * smoothstep(0.0, 0.1, dist);
  float breath = 0.8 + 0.2 * sin(t * 0.21);
  float edge = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x)
             * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.97, vUv.y);
  float a = rays * cone * fall * breath;
  a += smoothstep(0.5, 0.0, dist) * 0.45; // vầng sáng quanh nguồn
  a *= edge * uIntensity;
  if (a < 0.002) discard;
  gl_FragColor = vec4(uColor, a);
}
`

/**
 * Tia nắng mờ phủ lên một section. Không dùng post-process: một mặt phẳng + shader,
 * opacity rất thấp, mỗi section một bản (hero, câu chuyện, nguồn gốc, CTA).
 */
export class LightRays extends Effect {
  constructor(engine, palette, { section, strength = 0.1, onLight = false, source = [0.92, 1.04], direction = [-0.55, -1] }) {
    super(engine, `Tia nắng · ${section}`)
    this.section = section
    this.strength = strength
    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: engine.uniforms.uTime,
        uIntensity: { value: 0 },
        uSize: { value: new Vector2(1, 1) },
        uSource: { value: new Vector2(...source) },
        uDirection: { value: new Vector2(...direction) },
        uColor: { value: rawColor(onLight ? palette.rayOnLight : palette.rayWarm) },
      },
    })
    this.mesh = new Mesh(new PlaneGeometry(1, 1), this.material)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 1
    this.group.add(this.mesh)
    this.count = 1
  }

  update(dt, engine) {
    const s = engine.scroll.get(this.section)
    const on = THREE_CONFIG.effects.lightRays && s?.inView
    this.intensity = damp(this.intensity, on ? this.strength * Math.min(1, s.visibility * 1.6) : 0, 1.5, dt)
    this.group.visible = !!s && this.intensity > 0.002
    if (!this.group.visible) return
    engine.toWorld(engine.W / 2, s.top + s.height / 2, 0, this.mesh.position)
    this.mesh.scale.set(engine.W, s.height, 1)
    this.material.uniforms.uSize.value.set(engine.W, s.height)
    this.material.uniforms.uIntensity.value = this.intensity
  }
}
