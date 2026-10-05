/**
 * Điểm neo: nơi mỗi hiệu ứng bám vào trên trang, tính lại mỗi khung hình từ vị trí DOM thật.
 * Đổi bố cục trang → hiệu ứng tự đi theo; không có toạ độ cứng.
 */
export function createAnchors(engine) {
  const q = (sel) => document.querySelector(sel)
  const els = {
    introFrame: q('.intro__frame'),
    originPhotos: q('.origin__photos'),
    timeline: q('.timeline'),
  }
  const narrow = () => engine.W < 760

  return {
    section: (name) => engine.scroll.get(name),

    /** Chủ thể Hero: giọt mật + đàn ong lượn quanh, ở khoảng trống bên phải chữ. */
    heroSubject() {
      const s = engine.scroll.get('hero')
      if (!s) return null
      const n = narrow()
      return {
        sx: engine.W * (n ? 0.8 : 0.75),
        sy: s.top + s.height * (n ? 0.19 : 0.4),
        r: Math.min(engine.W, s.height) * (n ? 0.05 : 0.062),
        visibility: s.visibility,
        inView: s.inView,
      }
    },

    /** Mép trái khung ảnh vòm ở section "Mật ong là gì". */
    introDrop() {
      const el = els.introFrame
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        sx: r.left + r.width * 0.06,
        sy: r.top + r.height * 0.3,
        r: Math.max(26, r.width * 0.12),
        top: r.top,
        bottom: r.bottom,
      }
    },

    /** Dải đồng cỏ: từ đáy ảnh "Nguồn gốc" tới đáy section — chỗ cho hoa, cỏ, núi xa, sương. */
    meadow() {
      const s = engine.scroll.get('origin')
      if (!s) return null
      const photos = els.originPhotos?.getBoundingClientRect()
      const top = photos ? photos.bottom + 6 : s.bottom - 200
      return {
        left: 0,
        top,
        width: engine.W,
        height: Math.max(40, s.bottom - top),
        bottom: s.bottom,
        sectionTop: s.top,
        inView: s.bottom > 0 && top < engine.H,
        visibility: s.visibility,
      }
    },

    timeline: () => els.timeline,
  }
}
