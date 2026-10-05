import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import './Cursor.css'

/**
 * Con trỏ hình con ong (chỉ máy có chuột; điện thoại tự tắt).
 * - Ong vỗ cánh, đầu luôn quay theo hướng chuột di chuyển (quay đầu mượt khi đổi chiều).
 * - Trên ảnh bấm được ([data-cursor="view"]: thẻ sản phẩm, gallery) → hiện nhãn "XEM".
 * - Trên thứ cầm lắc được ([data-cursor="grab"]: miếng bánh tổ) → hiện nhãn lấy từ data-cursor-label.
 * - Trên nút ([data-cursor="cta"]) → ong to lên một chút.
 */
export default function Cursor() {
  const enabled = useMediaQuery('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  const ref = useRef(null)
  const beeRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    const bee = beeRef.current
    document.documentElement.classList.add('has-bee-cursor')
    let x = -100
    let y = -100
    let px = x
    let py = y
    let svx = 0 // vận tốc đã làm mượt
    let svy = 0
    let face = 1 // 1 = đầu quay trái (hình gốc), -1 = quay phải
    let flip = 1 // giá trị scaleX đang chuyển dần → hiệu ứng "quay đầu"
    let tilt = 0
    let raf = 0
    const move = (e) => {
      x = e.clientX
      y = e.clientY
      el.classList.add('is-on')
      const t = e.target instanceof Element ? e.target.closest('[data-cursor], a[href], button:not(:disabled)') : null
      el.dataset.state = t ? t.dataset.cursor || 'cta' : ''
      const label = t?.dataset.cursorLabel || 'Xem'
      if (labelRef.current.textContent !== label) labelRef.current.textContent = label
    }
    const leave = () => el.classList.remove('is-on')
    const down = () => el.classList.add('is-down')
    const up = () => el.classList.remove('is-down')
    const loop = () => {
      // vị trí bám sát chuột (con trỏ phải chính xác); hướng bay được làm mượt
      svx += (x - px - svx) * 0.25
      svy += (y - py - svy) * 0.25
      px = x
      py = y
      const speed = Math.hypot(svx, svy)
      // đầu ong luôn hướng theo chiều di chuyển ngang
      if (svx > 0.8) face = -1
      else if (svx < -0.8) face = 1
      flip += (face - flip) * 0.22
      // ngóc lên / chúc xuống theo hướng dọc (chỉ khi đang bay)
      const target = speed > 0.6 ? Math.max(-40, Math.min(40, (-Math.atan2(svy, Math.abs(svx) + 0.001) * 180) / Math.PI)) : 0
      tilt += (target - tilt) * 0.15
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      bee.style.transform = `scaleX(${flip.toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-bee-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <div className="cursor__scale">
        <svg ref={beeRef} className="cursor__bee" viewBox="-30 -30 60 60" width="40" height="40">
          <g className="cursor__wings">
            <ellipse className="wing wing--l" cx="-5" cy="-11" rx="9" ry="13" transform="rotate(-28 -5 -11)" />
            <ellipse className="wing wing--r" cx="6" cy="-11" rx="8" ry="12" transform="rotate(26 6 -11)" />
          </g>
          <ellipse cx="2" cy="2" rx="15" ry="10.5" fill="#E4B25A" />
          <path d="M-4 -8 Q-6 2 -4 12 M3 -9 Q1 2 3 12 M10 -7 Q9 2 10 10" stroke="#1E1C18" strokeWidth="3.4" fill="none" />
          <path d="M16 1 L22 2.5 L16 5 Z" fill="#1E1C18" />
          <circle cx="-14" cy="0" r="7.5" fill="#1E1C18" />
          <circle cx="-16.5" cy="-2" r="1.6" fill="#fff" />
          <path d="M-17 -6 Q-22 -15 -19 -18 M-13 -7 Q-14 -16 -10 -18" stroke="#1E1C18" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <span ref={labelRef} className="cursor__label">
        Xem
      </span>
    </div>
  )
}
