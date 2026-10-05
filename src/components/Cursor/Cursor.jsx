import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import './Cursor.css'

/**
 * Con trỏ phụ rất nhẹ (chỉ desktop có chuột): vòng tròn đi theo chuột.
 * Trên ảnh ([data-cursor="view"]) → hiện "VIEW". Trên nút ([data-cursor="cta"]) → phóng nhẹ.
 */
export default function Cursor() {
  const enabled = useMediaQuery('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  const ref = useRef(null)

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    let x = -100
    let y = -100
    let cx = x
    let cy = y
    let raf = 0
    let shown = false
    const move = (e) => {
      x = e.clientX
      y = e.clientY
      if (!shown) {
        cx = x
        cy = y
        shown = true
        el.classList.add('is-on')
      }
      const t = e.target instanceof Element ? e.target.closest('[data-cursor]') : null
      el.dataset.state = t ? t.dataset.cursor : ''
    }
    const leave = () => {
      shown = false
      el.classList.remove('is-on')
    }
    const loop = () => {
      cx += (x - cx) * 0.2
      cy += (y - cy) * 0.2
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span className="cursor__ring">
        <span className="cursor__label">View</span>
      </span>
    </div>
  )
}
