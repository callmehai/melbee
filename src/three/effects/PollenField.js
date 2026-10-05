import { BufferAttribute, BufferGeometry, Points, ShaderMaterial, Vector2 } from 'three'
import { Effect } from '../core/Effect.js'
import { THREE_CONFIG } from '../config.js'
import { NOISE, POLLEN_FRAG, SPACE, rawColor } from '../shaders/index.js'
import { createRandom } from '../utils/random.js'
import { damp } from '../utils/noise.js'

const VERT = /* glsl */ `
${NOISE}
${SPACE}
uniform float uTime;
uniform vec2 uViewport;
uniform float uD;
uniform float uPixelRatio;
uniform vec3 uWind;
uniform vec2 uWindOffset;
uniform float uScrollY;
uniform vec3 uMouse;
uniform sampler2D uBg;
uniform vec2 uBox;
uniform vec2 uDepth;
uniform vec2 uParallax;
uniform float uDensity;
uniform float uSize;
uniform float uOpacity;
uniform float uRise;
uniform float uSwirl;

attribute vec4 aSeed; // pha, tần số x, tần số y, thứ hạng hiển thị
attribute float aSize;

varying float vAlpha;
varying float vDark;

void main() {
  float zt = position.z + 0.5; // 0 = xa, 1 = gần camera
  float z = mix(uDepth.x, uDepth.y, zt);
  vec2 p = position.xy * uBox;
  float t = uTime;

  // trôi chậm: x, y theo sin với tần số + pha riêng từng hạt
  p.x += sin(t * aSeed.y + aSeed.x) * 26.0 + sin(t * aSeed.y * 0.41 + aSeed.x * 2.3) * 14.0;
  p.y += sin(t * aSeed.z + aSeed.x * 1.7) * 18.0 + t * uRise * (0.4 + aSeed.z);

  // trường gió: quãng đã thổi + xoáy nhiễu, gió càng mạnh xoáy càng rõ
  float depth = mix(0.5, 1.3, zt);
  vec2 q = p * 0.0011;
  vec2 swirl = vec2(snoise(vec3(q, t * 0.05)), snoise(vec3(q + 17.0, t * 0.05)));
  p += uWindOffset * depth + swirl * uSwirl * (0.4 + 1.6 * uWind.z);

  // cuộn trang: hạt xa trôi chậm hơn nội dung, hạt gần trôi nhanh hơn → chiều sâu
  p.y += uScrollY * mix(uParallax.x, uParallax.y, zt);

  // quấn vòng trong hộp lớn hơn màn hình → không bao giờ hết hạt, không tạo lại vị trí
  p = mod(p + uBox * 0.5, uBox) - uBox * 0.5;

  // chuột rẽ nhẹ hạt ở lớp gần
  vec2 m = domToCentered(uMouse.xy, uViewport);
  vec2 d = p - m;
  float dl = max(length(d), 1.0);
  p += d / dl * 60.0 * smoothstep(170.0, 0.0, dl) * uMouse.z * zt;

  vec4 mv = modelViewMatrix * vec4(screenToWorld(p, z, uD), 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uSize * uPixelRatio * (uD / -mv.z);

  float shown = smoothstep(aSeed.w, aSeed.w + 0.06, uDensity);
  float twinkle = 0.88 + 0.12 * sin(t * (0.4 + aSeed.y) + aSeed.x * 4.0); // rất nhẹ — không nhấp nháy như sao
  vDark = backgroundDarkness(uBg, gl_Position);
  vAlpha = uOpacity * shown * twinkle * mix(0.45, 1.0, zt);
}
`

// phấn hoa: ít hạt, to, chậm, một màu vàng ấm trên mọi nền (không còn lớp bụi riêng)
const V = {
  seed: 7,
  size: [4, 10],
  opacity: 0.55,
  rise: 2,
  swirl: 18,
  depth: [-700, 320],
  parallax: [0.3, 1.15],
  glow: 1,
}

/**
 * Phấn hoa toàn trang. Toàn bộ chuyển động tính trên GPU từ seed cố định
 * (BufferAttribute) — mỗi khung hình chỉ cập nhật vài uniform.
 * Mật độ đổi theo section bằng "thứ hạng" từng hạt, không phải thêm/bớt bộ đệm.
 */
export class PollenField extends Effect {
  constructor(engine, palette) {
    super(engine, 'Phấn hoa')
    const v = V
    const max = THREE_CONFIG.pollen.high
    const rnd = createRandom(v.seed)
    const pos = new Float32Array(max * 3)
    const seed = new Float32Array(max * 4)
    const size = new Float32Array(max)
    for (let i = 0; i < max; i++) {
      pos[i * 3] = rnd.next() - 0.5
      pos[i * 3 + 1] = rnd.next() - 0.5
      pos[i * 3 + 2] = rnd.next() - 0.5
      seed[i * 4] = rnd.range(0, Math.PI * 2)
      seed[i * 4 + 1] = rnd.range(0.05, 0.22)
      seed[i * 4 + 2] = rnd.range(0.04, 0.18)
      seed[i * 4 + 3] = rnd.next() * 0.97
      // phần lớn hạt nhỏ, một ít hạt lớn
      size[i] = v.size[0] + (v.size[1] - v.size[0]) * Math.pow(rnd.next(), 2.2)
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    geo.setAttribute('aSeed', new BufferAttribute(seed, 4))
    geo.setAttribute('aSize', new BufferAttribute(size, 1))

    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: POLLEN_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        ...engine.uniforms,
        uBox: { value: new Vector2(1, 1) },
        uDepth: { value: new Vector2(...v.depth) },
        uParallax: { value: new Vector2(...v.parallax) },
        uDensity: { value: 0 },
        uSize: { value: 1 },
        uOpacity: { value: v.opacity },
        uRise: { value: v.rise },
        uSwirl: { value: v.swirl },
        uGlow: { value: THREE_CONFIG.bloom ? v.glow : 0 },
        uColorLight: { value: rawColor(palette.pollen) },
        uColorDark: { value: rawColor(palette.pollen) },
      },
    })
    this.points = new Points(geo, this.material)
    this.points.frustumCulled = false
    this.points.renderOrder = 10
    this.group.add(this.points)
  }

  setQuality(q, engine) {
    this.count = THREE_CONFIG.pollen[engine.reduced ? 'low' : q]
    this.points.geometry.setDrawRange(0, this.count)
  }

  resize(engine) {
    this.material.uniforms.uBox.value.set(engine.W * 1.3, engine.H * 1.35)
  }

  update(dt, engine) {
    this.intensity = damp(this.intensity, engine.mood.pollen, 2, dt)
    this.material.uniforms.uDensity.value = this.intensity
    this.group.visible = this.intensity > 0.01 && this.count > 0
  }
}
