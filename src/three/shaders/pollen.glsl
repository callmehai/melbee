// Hạt phấn hoa / bụi nắng: lõi tròn mềm + quầng sáng nhẹ (thay bloom post-process).
// Màu đổi theo nền: hổ phách đậm trên nền sáng, kem vàng trên nền tối.
uniform vec3 uColorLight;
uniform vec3 uColorDark;
uniform float uGlow;

varying float vAlpha;
varying float vDark;

void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  if (r > 1.0) discard;
  float core = smoothstep(0.55, 0.0, r);
  float halo = pow(1.0 - r, 2.2) * uGlow;
  vec3 col = mix(uColorLight, uColorDark, vDark);
  float a = (core + halo * 0.45) * vAlpha * mix(0.85, 1.2, vDark);
  if (a < 0.003) discard;
  gl_FragColor = vec4(col, a);
}
