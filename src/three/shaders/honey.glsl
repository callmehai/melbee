// Shader mật ong — không cần đúng vật lý, chỉ cần "nhìn giống mật":
// chỗ dày đậm màu hổ phách, viền mỏng sáng vàng, vân nhớt chuyển động chậm bên trong,
// ánh sáng tụ ở đáy giọt, fresnel ở viền và một điểm phản chiếu như cửa sổ.
uniform float uTime;
uniform float uOpacity;
uniform float uGlow;
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uLight;

varying vec3 vNormal;
varying vec3 vView;
varying vec3 vObj;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = pow(1.0 - ndv, 3.0);
  float thick = pow(ndv, 0.8);

  // vân mật nhớt bên trong
  float swirl = snoise(vec3(vObj.xy * 2.2 + vec2(0.0, uTime * 0.12), vObj.z * 2.2 + uTime * 0.05));
  float fine = snoise(vObj * 5.0 + uTime * 0.1);

  vec3 col = mix(uLight, uMid, smoothstep(0.08, 0.7, thick));
  col = mix(col, uDeep, smoothstep(0.55, 1.0, thick) * (0.62 + 0.25 * swirl));

  // ánh sáng tụ lại ở đáy giọt (như nắng xuyên qua mật)
  float caustic = smoothstep(-0.15, -0.95, vObj.y) * (0.6 + 0.4 * swirl) * thick;
  col += uLight * caustic * 0.6 * uGlow;
  col += 0.05 * fine;

  // điểm phản chiếu: mặt trời chung của trang (thấp bên phải)
  vec3 L = normalize(vec3(0.62, 0.38, 0.69));
  vec3 H = normalize(L + V);
  float nh = max(dot(N, H), 0.0);
  float spec = pow(nh, 90.0) * 1.3 + pow(nh, 14.0) * 0.1;
  col += vec3(1.0, 0.97, 0.9) * spec;

  // viền sáng (fresnel)
  col += uLight * fresnel * 0.55;

  float alpha = clamp(0.8 + fresnel * 0.35 + spec, 0.0, 1.0);
  alpha *= mix(0.55, 1.0, smoothstep(0.0, 0.12, ndv)); // mép mềm
  gl_FragColor = vec4(col, alpha * uOpacity);
}
