/**
 * CẤU HÌNH ÂM THANH NỀN — tiếng rừng Tây Bắc, rất nhẹ, chỉ tạo không khí.
 *
 * File thật trong public/assets/audio/ (Mixkit — Free License, dùng thương mại, không cần ghi nguồn):
 *   ambient-forest.mp3  ← "Quiet forest ambience" (#1220)
 *   wind.mp3            ← "Wind blowing ambience" (#2658)
 *   river.mp3           ← "River water flow and surroundings" (#2452)
 * Mỗi file đã được cắt thành vòng lặp liền (crossfade đầu–cuối 4 giây) và chuẩn hoá độ to (−20 LUFS).
 * Thiếu file nào thì lớp đó im lặng, các lớp còn lại vẫn chạy.
 */
export const AUDIO_LAYERS = {
  forest: { file: 'assets/audio/ambient-forest.mp3', volume: 0.12 },
  wind: { file: 'assets/audio/wind.mp3', volume: 0.06 },
  river: { file: 'assets/audio/river.mp3', volume: 0.035 },
}

/**
 * Âm lượng từng lớp theo section (khoá trùng data-scene trên thẻ <section>).
 * Đổi section → tự crossfade ~1,5 giây sang mức mới.
 */
export const AUDIO_SCENES = {
  hero: { forest: 0.12, wind: 0.06, river: 0 }, // rừng + gió rõ nhất
  honey: { forest: 0.1, wind: 0.05, river: 0.01 },
  products: { forest: 0.04, wind: 0.02, river: 0 }, // lắng xuống để tập trung vào sản phẩm
  story: { forest: 0.1, wind: 0.05, river: 0.015 },
  origin: { forest: 0.14, wind: 0.08, river: 0.04 }, // vùng núi: gió + suối rõ hơn
  process: { forest: 0.1, wind: 0.05, river: 0.02 },
  values: { forest: 0.09, wind: 0.045, river: 0.015 },
  lifestyle: { forest: 0.1, wind: 0.045, river: 0.015 },
  gallery: { forest: 0.08, wind: 0.04, river: 0.015 },
  testimonials: { forest: 0.08, wind: 0.04, river: 0.01 },
  cta: { forest: 0.12, wind: 0.05, river: 0.02 },
  footer: { forest: 0.1, wind: 0.04, river: 0.015 },
}

export const AUDIO_CONFIG = {
  enabled: true,
  mobileVolume: 0.75, // điện thoại nhỏ hơn 25%
  crossfade: 0.5, // hằng số thời gian (giây) — đạt ~95% mức mới sau ~1,5 giây
  fadeIn: 1.2, // bật âm thanh: mờ dần lên (giây)
  fadeOut: 0.5, // tắt âm thanh: mờ dần xuống (giây)
  windBoost: 0.8, // gió (từ lớp Three.js) mạnh nhất → lớp gió to thêm tối đa 80%
}
