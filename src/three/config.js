/**
 * CẤU HÌNH LỚP THREE.JS — bật/tắt hiệu ứng, chỉnh mật độ ở đây; không cần sửa code hiệu ứng.
 *
 * Cấp chất lượng (high | medium | low) được chọn tự động theo thiết bị (utils/performance.js)
 * và tự hạ cấp khi FPS thấp kéo dài. Ép một cấp để thử: thêm ?quality=low vào URL.
 */
export const THREE_CONFIG = {
  enabled: true,

  // ── số lượng theo cấp chất lượng ──────────────────────────
  pollen: { high: 1000, medium: 500, low: 150 }, // phấn hoa / bụi nắng
  dust: { high: 420, medium: 220, low: 60 }, // bụi rất nhỏ
  windStreaks: { high: 140, medium: 70, low: 0 }, // vệt gió
  bees: { high: 25, medium: 12, low: 0 },
  flowers: { high: 50, medium: 25, low: 10 },
  grass: { high: 280, medium: 150, low: 60 }, // cỏ quanh hoa
  honeyFlow: { high: 700, medium: 380, low: 140 }, // hạt dòng mật ở "Quy trình"
  goldenParticles: { high: 220, medium: 120, low: 50 }, // hạt vàng ở CTA + quanh thẻ sản phẩm

  // độ phân giải canvas tối đa (devicePixelRatio bị chặn ở mức này; điện thoại tối đa 1.5)
  maxPixelRatio: { high: 2, medium: 1.5, low: 1 },

  bloom: true, // quầng sáng mềm quanh hạt phấn, giọt mật (vẽ trong shader, không post-process)
  mouseParallax: true, // camera nghiêng rất nhẹ theo chuột (chỉ máy có chuột)
  maxParallaxRotation: 0.03, // radian
  wind: true, // trường gió chung: phấn hoa, vệt gió, hoa lay
  windScrollFactor: 0.6, // cuộn nhanh → gió mạnh: strength = base + scrollVelocity × hệ số
  honeyShader: true, // false → MeshPhysicalMaterial thay cho shader mật ong tự viết
  beeInteraction: true, // ong né chuột (tắt trên điện thoại)
  autoQuality: true, // FPS thấp kéo dài → tự hạ một cấp

  // ── bật/tắt từng hiệu ứng ─────────────────────────────────
  effects: {
    pollen: true,
    dust: true,
    windStreaks: true,
    lightRays: true,
    atmosphere: true, // sương + dãy núi xa
    flowers: true,
    bees: true,
    honeycomb: true, // tổ ong 3D ở Hero (có giọt mật nhỏ xuống từ đáy)
    honeyDrop: true, // giọt mật ở section "Mật ong là gì"
    honeyFlow: true,
    goldenParticles: true,
  },
}

/**
 * "Tâm trạng" từng section — khoá trùng thuộc tính data-scene trên thẻ <section>.
 * Giá trị 0–1. Khi cuộn, các giá trị được trộn mượt theo phần section đang chiếm màn hình,
 * nên không phải hiệu ứng nào cũng chạy cùng lúc.
 * dark: nền tối → hạt sáng màu kem; nền sáng → hạt màu hổ phách đậm.
 */
export const SCENES = {
  hero: { dark: true, pollen: 0.55, dust: 0.2, wind: 0.35 },
  honey: { pollen: 0.3, dust: 0.25, wind: 0.2 },
  products: { pollen: 0.06, dust: 0.05, wind: 0.1 }, // tối giản — sản phẩm là nhân vật chính
  story: { pollen: 0.7, dust: 1, wind: 0.25 },
  origin: { dark: true, pollen: 0.8, dust: 0.3, wind: 1 },
  process: { pollen: 0.18, dust: 0.1, wind: 0.2 },
  values: { pollen: 0.3, dust: 0.15, wind: 0.2 },
  lifestyle: { pollen: 0.6, dust: 0.3, wind: 0.3 },
  gallery: { pollen: 0.12, dust: 0.3, wind: 0.1 },
  testimonials: { pollen: 0.25, dust: 0.1, wind: 0.15 },
  cta: { dark: true, pollen: 0.35, dust: 0.15, wind: 0.3 },
  footer: { dark: true, pollen: 0.1, dust: 0.05, wind: 0.1 },
}

/** Màu dùng trong shader (giữ đúng tông thương hiệu ở src/styles/variables.css). */
export const PALETTE = {
  pollenOnLight: '#b8771a',
  pollenOnDark: '#ffdd96',
  dustOnLight: '#9c8466',
  dustOnDark: '#f6e7c8',
  honeyDeep: '#7a3d05',
  honeyMid: '#c9811c',
  honeyLight: '#ffd27a',
  rayWarm: '#ffd88a',
  rayOnLight: '#e3a63c',
  forestFar: '#3d5543',
  forestNear: '#1b2a20',
  forestFog: '#c9d4b6',
  stemDark: '#26402c',
  stemLight: '#5f7d4c',
  flowerCenter: '#e0a22e',
  wax: ['#d99a32', '#e3a83c', '#cf8e2a', '#e8b448'], // sáp ong (thành ô)
  waxCap: '#f1d38a', // nắp sáp
  combBack: '#7a4310', // đáy ô trống
  petals: ['#f4efe4', '#f3c6cf', '#e8a7b8', '#eac25a', '#cdb6e2', '#f7e4b0'],
  grass: ['#2f4b33', '#3b5a3a', '#4c6b43', '#5a7748'],
}
