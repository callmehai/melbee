import { BufferAttribute, BufferGeometry, LineSegments, ShaderMaterial, Vector2 } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { NOISE, SPACE, rawColor } from '../shaders/index.js'
import { createRandom } from '../utils/random.js'
import { damp } from '../utils/noise.js'

const VERT = /* glsl */ `
${NOISE}
${SPACE}
uniform float uTime;
uniform vec2 uViewport;
uniform float uD;
uniform vec3 uWind;
uniform vec2 uWindOffset;
uniform float uScrollY;
uniform sampler2D uBg;
uniform vec2 uBox;
uniform float uLength;
uniform float uIntensity;

attribute vec4 aSeed; // pha, tốc độ, độ dài, thứ hạng
attribute float aEnd; // 0 = đầu vệt, 1 = đuôi vệt

varying float vAlpha;
varying float vDark;

void main() {
  float zt = position.z + 0.5;
  float z = mix(-500.0, 250.0, zt);
  vec2 p = position.xy * uBox;
  float t = uTime;

  // vệt gió đi nhanh hơn phấn hoa, cong theo cùng trường nhiễu
  p += uWindOffset * (1.6 + aSeed.y);
  p.y += sin(t * 0.5 + aSeed.x) * 22.0 + uScrollY * mix(0.3, 1.1, zt);
  p = mod(p + uBox * 0.5, uBox) - uBox * 0.5;

  vec2 dir = normalize(uWind.xy + vec2(0.0001, 0.0));
  float bend = snoise(vec3(p * 0.0009, t * 0.08));
  vec2 ldir = normalize(dir + vec2(-dir.y, dir.x) * bend * 0.6);
  float len = uLength * (0.5 + aSeed.z) * (0.4 + uWind.z * 1.4);
  p -= ldir * len * aEnd;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(screenToWorld(p, z, uD), 1.0);
  vDark = backgroundDarkness(uBg, gl_Position);

  float gate = smoothstep(0.28, 0.9, uWind.z); // chỉ hiện khi gió đủ mạnh
  float shown = step(aSeed.w, uIntensity);
  float flicker = 0.5 + 0.5 * sin(t * 0.7 + aSeed.x * 5.0);
  vAlpha = (1.0 - aEnd) * gate * shown * flicker * mix(0.3, 1.0, zt) * 0.32;
}
`

const FRAG = /* glsl */ `
uniform vec3 uColorLight;
uniform vec3 uColorDark;
varying float vAlpha;
varying float vDark;
void main() {
  gl_FragColor = vec4(mix(uColorLight, uColorDark, vDark), vAlpha);
}
`

/** Vệt gió mảnh: chỉ hiện rõ ở "Nguồn gốc" và khi cuộn nhanh (gió mạnh). */
export class WindParticles extends Effect {
  constructor(engine, palette) {
    super(engine, 'Vệt gió')
    const max = THREE_CONFIG.windStreaks.high
    const rnd = createRandom(33)
    const pos = new Float32Array(max * 2 * 3)
    const seed = new Float32Array(max * 2 * 4)
    const end = new Float32Array(max * 2)
    for (let i = 0; i < max; i++) {
      const base = [rnd.next() - 0.5, rnd.next() - 0.5, rnd.next() - 0.5]
      const s = [rnd.range(0, 6.28), rnd.range(0, 1), rnd.next(), rnd.next() * 0.95]
      for (let k = 0; k < 2; k++) {
        const j = i * 2 + k
        pos.set(base, j * 3)
        seed.set(s, j * 4)
        end[j] = k
      }
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    geo.setAttribute('aSeed', new BufferAttribute(seed, 4))
    geo.setAttribute('aEnd', new BufferAttribute(end, 1))
    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        ...engine.uniforms,
        uBox: { value: new Vector2(1, 1) },
        uLength: { value: 90 },
        uIntensity: { value: 0 },
        uColorLight: { value: rawColor(palette.pollenOnLight) },
        uColorDark: { value: rawColor(palette.dustOnDark) },
      },
    })
    this.lines = new LineSegments(geo, this.material)
    this.lines.frustumCulled = false
    this.lines.renderOrder = 4
    this.group.add(this.lines)
  }

  setQuality(q, engine) {
    this.count = engine.reduced || !THREE_CONFIG.wind ? 0 : THREE_CONFIG.windStreaks[q]
    this.lines.geometry.setDrawRange(0, this.count * 2)
  }

  resize(engine) {
    this.material.uniforms.uBox.value.set(engine.W * 1.4, engine.H * 1.4)
  }

  update(dt, engine) {
    // mật độ theo gió của section + vận tốc cuộn
    const target = Math.min(1, engine.mood.wind * 0.8 + Math.abs(engine.scroll.velocity) / 2500)
    this.intensity = damp(this.intensity, target, 2, dt)
    this.material.uniforms.uIntensity.value = this.intensity
    this.group.visible = this.count > 0 && this.intensity > 0.02 && engine.wind.strength > 0.25
  }
}
