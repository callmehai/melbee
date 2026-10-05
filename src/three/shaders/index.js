import { Color, LinearSRGBColorSpace } from 'three'
import NOISE from './noise.glsl?raw'
import SPACE from './space.glsl?raw'
import POLLEN_FRAG from './pollen.glsl?raw'
import DISTORTION from './distortion.glsl?raw'
import HONEY_FRAG from './honey.glsl?raw'

export { NOISE, SPACE, POLLEN_FRAG, DISTORTION, HONEY_FRAG }

/**
 * Màu dùng thẳng trong ShaderMaterial (shader tự viết không chuyển không gian màu),
 * nên giữ nguyên giá trị hex để màu hiện ra đúng như trong bảng màu thương hiệu.
 */
export const rawColor = (hex) => new Color().setHex(parseInt(hex.slice(1), 16), LinearSRGBColorSpace)

// mật: dày → hổ phách đậm, mỏng → vàng sáng; nắng xuyên qua thành vầng sáng; bóng như mặt nước phản chiếu trời
export const HONEY = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uLight;
uniform vec3 uLightDir;
vec3 honeyColor(vec3 N, vec3 V, float thick, float glow) {
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  vec3 col = mix(uLight, uMid, smoothstep(0.0, 0.6, thick));
  col = mix(col, uDeep, smoothstep(0.55, 1.0, thick));
  col += uLight * glow * 0.55;
  vec3 R = reflect(-V, N);
  vec3 env = mix(vec3(0.45, 0.32, 0.17), vec3(1.0, 0.97, 0.9), smoothstep(-0.3, 0.8, R.y));
  col = mix(col, env, (0.04 + 0.96 * pow(1.0 - ndv, 4.0)) * 0.6);
  // mảng trời sáng phía trên bên phải phản chiếu trên mặt mật cong → mỗi ô một ánh lấp lánh nhỏ
  col += vec3(1.0, 0.98, 0.92) * smoothstep(0.93, 0.985, dot(R, normalize(vec3(0.5, 0.62, 0.6)))) * 0.5;
  float nh = max(dot(N, normalize(uLightDir + V)), 0.0);
  col += vec3(1.0, 0.97, 0.9) * (pow(nh, 70.0) * 1.1 + pow(nh, 12.0) * 0.1);
  return col;
}
`
