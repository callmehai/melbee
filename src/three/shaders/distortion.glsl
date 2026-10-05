// Biến dạng nhớt cho bề mặt chất lỏng (giọt mật): đỉnh dịch theo pháp tuyến bằng nhiễu chậm,
// phần đáy nặng hơn nên chùng xuống nhịp nhàng như mật sắp nhỏ giọt.
vec3 viscousDistort(vec3 p, vec3 n, float t, float amount) {
  float w = snoise(p * 1.6 + vec3(0.0, t * 0.35, t * 0.2));
  float sag = smoothstep(0.1, -1.0, p.y) * (0.5 + 0.5 * sin(t * 0.9)) * 0.06;
  return p + n * w * 0.045 * amount - vec3(0.0, sag, 0.0) * amount;
}
