/**
 * CẤU HÌNH ÂM THANH NỀN.
 *
 * Đang dùng: nhạc nền public/assets/audio/music.mp3 ← Mixkit "Wedding 01" (#657, Free License —
 * dùng thương mại được, không cần ghi nguồn); đã cắt khoảng lặng đầu/cuối, chuẩn hoá độ to, 128kbps.
 *
 * stream: true → phát trực tiếp từ file (không giải mã cả bài vào bộ nhớ) — hợp với bài nhạc dài.
 * Không có stream → giải mã vào bộ nhớ, lặp liền mạch tuyệt đối — hợp với đoạn tiếng thiên nhiên ngắn.
 *
 * Muốn quay lại tiếng rừng / gió / suối (file vẫn còn trong public/assets/audio/), thêm lại:
 *   forest: { file: 'assets/audio/ambient-forest.mp3', volume: 0.12 },
 *   wind: { file: 'assets/audio/wind.mp3', volume: 0.06 },
 *   river: { file: 'assets/audio/river.mp3', volume: 0.035 },
 * và thêm mức forest / wind / river cho từng section trong AUDIO_SCENES.
 * Thiếu file nào thì lớp đó im lặng, trang vẫn chạy.
 */
export const AUDIO_LAYERS = {
  music: { file: 'assets/audio/music.mp3', volume: 0.3, stream: true },
}

/**
 * Âm lượng từng lớp theo section (khoá trùng data-scene trên thẻ <section>).
 * Section không có trong bảng → dùng volume mặc định ở AUDIO_LAYERS.
 * Đổi section → tự crossfade ~1,5 giây sang mức mới.
 */
export const AUDIO_SCENES = {
  hero: { music: 0.3 },
  products: { music: 0.2 }, // nhỏ lại một chút để tập trung vào sản phẩm
  origin: { music: 0.3 },
  cta: { music: 0.3 },
}

export const AUDIO_CONFIG = {
  enabled: true,
  autoplay: true, // mặc định bật: phát ngay khi vào trang nếu trình duyệt cho phép, không thì ở lần bấm/chạm đầu tiên
  mobileVolume: 0.75, // điện thoại nhỏ hơn 25%
  crossfade: 0.5, // hằng số thời gian (giây) — đạt ~95% mức mới sau ~1,5 giây
  fadeIn: 1.2, // bật âm thanh: mờ dần lên (giây)
  fadeOut: 0.5, // tắt âm thanh: mờ dần xuống (giây)
  windBoost: 0.8, // chỉ áp dụng cho lớp tên "wind": gió (từ lớp Three.js) mạnh nhất → to thêm tối đa 80%
}
