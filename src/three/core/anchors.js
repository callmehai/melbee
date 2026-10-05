/**
 * Điểm neo: nơi mỗi hiệu ứng bám vào trên trang, tính lại mỗi khung hình từ vị trí DOM thật.
 * Đổi bố cục trang → hiệu ứng tự đi theo; không có toạ độ cứng.
 */
export function createAnchors(engine) {
  const q = (sel) => document.querySelector(sel)
  const els = {
    introFrame: q('.intro__frame'),
    meadow: q('.origin__meadow'),
    blooms: [...document.querySelectorAll('.hero__branch [data-bloom]')],
  }
  const center = (el) => {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }
  }

  return {
    section: (name) => engine.scroll.get(name),

    /** Mặt trời trong tranh của một section (mốc data-sun trong SVG) — tia nắng toả ra từ đây. */
    sun(name) {
      const el = q(`[data-scene="${name}"] [data-sun]`)
      return () => (el && el.getBoundingClientRect().width ? center(el) : null)
    },

    /** Những bông hoa ban trên cành ở Hero (mốc data-bloom) — chỗ ong ghé. */
    heroBlooms() {
      const s = engine.scroll.get('hero')
      if (!s || !els.blooms.length) return null
      const targets = els.blooms.map((el) => {
        const c = center(el)
        return { x: c.x, y: c.y - s.top, z: 60 }
      })
      return { sx: 0, sy: s.top, targets, visibility: s.visibility, inView: s.inView }
    },

    /** Đầu dòng mật trong tranh của khung "Giọt mật" (mốc data-drip-tip trong SVG). */
    introDrip() {
      const tip = els.introFrame?.querySelector('[data-drip-tip]')
      if (!tip) return null
      const r = tip.getBoundingClientRect()
      if (!r.width) return null
      return { x: r.left + r.width / 2, y: r.top, width: r.width, inView: r.bottom > -80 && r.top < engine.H + 80 }
    },

    /** Dải đồng hoa ở chân "Nguồn gốc" (.origin__meadow) — chỗ cho hoa, cỏ, núi xa, sương. */
    meadow() {
      const s = engine.scroll.get('origin')
      if (!s || !els.meadow) return null
      const r = els.meadow.getBoundingClientRect()
      if (r.height < 120) return null // không có lớp Three.js → dải này chỉ là khoảng thở
      return {
        left: 0,
        top: r.top,
        width: engine.W,
        height: r.height,
        bottom: s.bottom,
        sectionTop: s.top,
        inView: r.bottom > 0 && r.top < engine.H,
        visibility: s.visibility,
      }
    },
  }
}
