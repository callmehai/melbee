import { useEffect, useRef } from 'react'

/** Phấn hoa lơ lửng rất nhẹ (canvas 2D, ~40 hạt). Tắt khi prefers-reduced-motion. */
export default function Pollen({ count = 40 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const parts = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.5,
      vy: 0.00008 + Math.random() * 0.00018,
      ph: Math.random() * Math.PI * 2,
      a: 0.2 + Math.random() * 0.45,
    }))

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(tick)
    })
    io.observe(canvas)

    function tick(t) {
      raf = 0
      if (!visible) return
      ctx.clearRect(0, 0, w, h)
      for (const p of parts) {
        p.y -= p.vy * 16
        if (p.y < -0.05) {
          p.y = 1.05
          p.x = Math.random()
        }
        const x = (p.x + Math.sin(t * 0.0003 + p.ph) * 0.02) * w
        const y = p.y * h
        const tw = 0.6 + 0.4 * Math.sin(t * 0.002 + p.ph * 3)
        const g = ctx.createRadialGradient(x, y, 0, x, y, p.r * 3)
        g.addColorStop(0, `rgba(255, 214, 140, ${p.a * tw})`)
        g.addColorStop(1, 'rgba(255, 214, 140, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, p.r * 3, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [count])

  return <canvas ref={ref} className="pollen" aria-hidden="true" />
}
