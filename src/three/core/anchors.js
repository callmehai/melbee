/**
 * Điểm neo: nơi mỗi hiệu ứng bám vào trên trang, tính lại mỗi khung hình từ vị trí DOM thật.
 * Đổi bố cục trang → hiệu ứng tự đi theo; không có toạ độ cứng.
 */
export function createAnchors(engine) {
  const q = (sel) => document.querySelector(sel)
  const els = {
    stage: q('.intro__stage'),
    gift: q('.gift__stage'),
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

    /** Khung "Giọt mật" (.intro__stage) — sân khấu của miếng bánh tổ; null khi khung đang hiện ảnh/tranh thay thế. */
    combStage() {
      if (!els.stage?.isConnected) els.stage = q('.intro__stage')
      const el = els.stage
      if (!el) return null
      const r = el.getBoundingClientRect()
      if (!r.width) return null
      return { el, x: r.left + r.width / 2, top: r.top, bottom: r.bottom, w: r.width, h: r.height, inView: r.bottom > -40 && r.top < engine.H + 40 }
    },

    /** Khung hộp quà 3D (.gift__stage) — hộp nằm giữa khung, nghe chuột/chạm ở đây. */
    giftStage() {
      if (!els.gift?.isConnected) els.gift = q('.gift__stage')
      const el = els.gift
      if (!el) return null
      const r = el.getBoundingClientRect()
      if (!r.width) return null
      return { el, x: r.left + r.width / 2, top: r.top, bottom: r.bottom, w: r.width, h: r.height, inView: r.bottom > -40 && r.top < engine.H + 40 }
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
