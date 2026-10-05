/**
 * CẤU HÌNH LỚP THREE.JS — bật/tắt hiệu ứng, chỉnh mật độ ở đây; không cần sửa code hiệu ứng.
 *
 * Cấp chất lượng (high | medium | low) được chọn tự động theo thiết bị (utils/performance.js)
 * và tự hạ cấp khi FPS thấp kéo dài. Ép một cấp để thử: thêm ?quality=low vào URL.
 */
export const THREE_CONFIG = {
  enabled: true,

  // ── số lượng theo cấp chất lượng ──────────────────────────
  pollen: { high: 200, medium: 120, low: 60 }, // phấn hoa: ít, to, một màu vàng ấm
  bees: { high: 8, medium: 4, low: 0 }, // ong chỉ ghé hoa (cành hoa ban ở Hero, đồng hoa ở Nguồn gốc)
  flowers: { high: 70, medium: 40, low: 16 },
  grass: { high: 280, medium: 150, low: 60 }, // cỏ quanh hoa
  goldenParticles: { high: 90, medium: 55, low: 24 }, // bụi nắng chiều ở CTA + quanh thẻ sản phẩm

  // độ phân giải canvas tối đa (devicePixelRatio bị chặn ở mức này; điện thoại tối đa 1.5)
  maxPixelRatio: { high: 2, medium: 1.5, low: 1 },

  bloom: true, // quầng sáng mềm quanh hạt phấn, giọt mật (vẽ trong shader, không post-process)
  mouseParallax: true, // camera nghiêng rất nhẹ theo chuột (chỉ máy có chuột)
  maxParallaxRotation: 0.03, // radian
  wind: true, // trường gió chung, nhẹ: phấn hoa trôi, hoa lay (không phụ thuộc tốc độ cuộn)
  honeyShader: true, // false → MeshPhysicalMaterial thay cho shader mật ong tự viết
  beeInteraction: true, // ong né chuột (tắt trên điện thoại)
  autoQuality: true, // FPS thấp kéo dài → tự hạ một cấp

  // ── bật/tắt từng hiệu ứng ─────────────────────────────────
  // Three.js chủ yếu làm KHÔNG KHÍ (nắng, sương, phấn, ong, hoa). Vật thể duy nhất là miếng bánh tổ
  // ở "Giọt mật" — người xem cầm lắc được, nên nó là một phần câu chuyện chứ không phải đồ trình diễn.
  effects: {
    pollen: true,
    lightRays: true, // chỉ ở Hero và CTA, cùng hướng với mặt trời trong tranh (thấp bên phải)
    atmosphere: true, // sương + dãy núi xa
    flowers: true,
    bees: true,
    honeycomb: true, // miếng bánh tổ 3D lắc được, mật chảy thành sợi rồi nhỏ giọt (section "Giọt mật")
    goldenParticles: true,
  },
}

/**
 * "Tâm trạng" từng section — khoá trùng thuộc tính data-scene trên thẻ <section>.
 * Giá trị 0–1. Khi cuộn, các giá trị được trộn mượt theo phần section đang chiếm màn hình.
 * dark: nền tối dưới canvas (shader dùng để chỉnh độ sáng hạt).
 */
export const SCENES = {
  hero: { pollen: 0.55, wind: 0.3 },
  origin: { pollen: 0.8, wind: 0.45 },
  honey: { pollen: 0.2, wind: 0.15 },
  story: { pollen: 0.3, wind: 0.15 },
  process: { pollen: 0.12, wind: 0.15 },
  products: { pollen: 0.05, wind: 0.1 }, // tối giản — sản phẩm là nhân vật chính
  values: { pollen: 0.15, wind: 0.15 },
  lifestyle: { pollen: 0.3, wind: 0.2 },
  gallery: { pollen: 0.1, wind: 0.1 },
  testimonials: { pollen: 0.15, wind: 0.1 },
  cta: { pollen: 0.4, wind: 0.25 },
  footer: { dark: true, pollen: 0.05, wind: 0.1 },
}

/** Màu dùng trong shader (giữ đúng tông thương hiệu ở src/styles/variables.css). */
export const PALETTE = {
  pollen: '#d49a2c', // một màu vàng ấm trên mọi nền → đọc ra là cùng một lớp phấn chạy xuyên trang
  honeyDeep: '#7a3d05',
  honeyMid: '#c9811c',
  honeyLight: '#ffd27a',
  rayWarm: '#ffd88a',
  rayMorning: '#f7cf86',
  // núi xa + sương ban ngày (Nguồn gốc): xanh lam nhạt, càng xa càng nhạt
  ridgeFar: '#b3c4cb',
  ridgeNear: '#97ada9',
  mist: '#f1f1e8',
  meadowGround: '#f6f1e4', // màu nền ở chân đồng hoa — hoa tan vào đây, không bị cắt ngang
  meadowFar: '#c3cdbf',
  stemDark: '#3b5a3c',
  stemLight: '#7d9a5c',
  flowerCenter: '#d79a2b',
  // hoa vùng cao Tây Bắc: cải vàng, tam giác mạch hồng phấn, ban/mận trắng
  petals: ['#f1cb3a', '#e9bc2a', '#f4d65e', '#f3c9d1', '#eaaebd', '#f8f3e8', '#f6e6ea'],
  grass: ['#4e6e47', '#5a7a4c', '#6b8a56', '#7c9860'],
}
