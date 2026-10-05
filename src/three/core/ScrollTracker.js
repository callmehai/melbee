import { SCENES } from '../config.js'

/**
 * Theo dõi cuộn: vị trí, vận tốc (px/giây, đã làm mượt), tiến độ toàn trang
 * và từng section có data-scene: đang chiếm bao nhiêu phần màn hình, đã cuộn qua bao nhiêu.
 */
export class ScrollTracker {
  constructor() {
    this.y = window.scrollY
    this.velocity = 0
    this.progress = 0
    this.active = null
    this.sections = []
    this.byName = {}
    this.collect()
  }

  collect() {
    this.sections = [...document.querySelectorAll('[data-scene]')].map((el) => ({
      name: el.dataset.scene,
      el,
      dark: !!SCENES[el.dataset.scene]?.dark,
      top: 0,
      bottom: 0,
      height: 0,
      visibility: 0, // phần màn hình section đang chiếm (0–1)
      progress: 0, // 0 khi mép trên vừa chạm đáy màn hình → 1 khi mép dưới rời đỉnh màn hình
      inView: false,
    }))
    this.byName = Object.fromEntries(this.sections.map((s) => [s.name, s]))
  }

  get(name) {
    return this.byName[name]
  }

  update(dt, vh) {
    const y = window.scrollY
    const raw = dt > 0 ? (y - this.y) / dt : 0
    this.y = y
    this.velocity += (raw - this.velocity) * (1 - Math.exp(-dt * 6))
    if (Math.abs(this.velocity) < 0.5) this.velocity = 0
    const max = document.documentElement.scrollHeight - window.innerHeight
    this.progress = max > 0 ? Math.min(1, y / max) : 0

    let best = 0
    for (const s of this.sections) {
      const r = s.el.getBoundingClientRect()
      s.top = r.top
      s.bottom = r.bottom
      s.height = r.height
      s.inView = r.bottom > 0 && r.top < vh
      s.visibility = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh
      s.progress = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))
      if (s.visibility > best) {
        best = s.visibility
        this.active = s.name
      }
    }
  }
}
