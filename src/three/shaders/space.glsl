// Camera đặt ở z = uD nên tại mặt phẳng z = 0, một đơn vị thế giới = một pixel CSS.
// Nhờ vậy mọi hiệu ứng bám đúng vị trí phần tử DOM (section, ảnh, timeline).

// Toạ độ kiểu DOM (gốc trên-trái, y hướng xuống) → gốc ở tâm màn hình, y hướng lên.
vec2 domToCentered(vec2 p, vec2 viewport) {
  return vec2(p.x - viewport.x * 0.5, viewport.y * 0.5 - p.y);
}

// Điểm màn hình (gốc ở tâm) đặt ở độ sâu z, sao cho chiếu ra vẫn đúng chỗ đó trên màn hình.
vec3 screenToWorld(vec2 s, float z, float d) {
  return vec3(s * (d - z) / d, z);
}

// Nền dưới một điểm sáng hay tối (0 = sáng, 1 = tối) — đọc từ dải texture engine cập nhật theo cuộn.
float backgroundDarkness(sampler2D bg, vec4 clipPos) {
  float y = clamp(0.5 - clipPos.y / clipPos.w * 0.5, 0.0, 1.0);
  return texture2D(bg, vec2(0.5, y)).r;
}
