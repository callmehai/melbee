import { useEffect, useState } from 'react'
import { ScrollTracker } from './core/ScrollTracker.js'

/**
 * Tiến độ cuộn cho component React: toàn trang (0–1), vận tốc (px/giây),
 * section đang chiếm màn hình nhiều nhất và tiến độ từng section (theo data-scene).
 * Lớp Three.js dùng chung ScrollTracker này mỗi khung hình; hook chỉ cập nhật khi có cuộn.
 */
export function useScrollProgress() {
  const [state, setState] = useState({ progress: 0, velocity: 0, active: null, sections: {} })

  useEffect(() => {
    const tracker = new ScrollTracker()
    let raf = 0
    let last = performance.now()
    const read = () => {
      raf = 0
      const now = performance.now()
      tracker.update(Math.max(0.001, (now - last) / 1000), window.innerHeight)
      last = now
      setState({
        progress: tracker.progress,
        velocity: tracker.velocity,
        active: tracker.active,
        sections: Object.fromEntries(tracker.sections.map((s) => [s.name, { visibility: s.visibility, progress: s.progress, inView: s.inView }])),
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return state
}
