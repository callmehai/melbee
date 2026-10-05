import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createExperience } from './experience.js'
import { detectDevice } from './utils/performance.js'
import { setThreeStatus } from './store.js'
import './three.css'

// Bảng debug chỉ có ở bản dev (?debug=true); bản production loại bỏ hoàn toàn khi build.
const DebugPanel = import.meta.env.DEV ? lazy(() => import('./debug/DebugPanel.jsx')) : null
const debug = import.meta.env.DEV && new URLSearchParams(window.location.search).get('debug') === 'true'

/** Canvas WebGL dùng chung cho cả trang + vòng đời engine (tạo, giảm chuyển động, dọn dẹp). */
export default function ThreeScene() {
  const canvasRef = useRef(null)
  const [engine, setEngine] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let instance
    try {
      instance = createExperience(canvas, { ...detectDevice(), reducedMotion: motion.matches })
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[MelBee] Không khởi tạo được WebGL:', err)
      setThreeStatus('unavailable')
      return
    }
    setEngine(instance)
    if (debug) window.__melbeeEngine = instance // soi trong DevTools (chỉ bản dev)
    setThreeStatus('running')
    const show = requestAnimationFrame(() => canvas.classList.add('is-ready'))

    const onMotion = () => instance.setReducedMotion(motion.matches)
    motion.addEventListener('change', onMotion)
    // mất ngữ cảnh WebGL (driver, tab nền lâu) → ẩn lớp này, trang quay về giao diện cũ
    const onLost = (e) => {
      e.preventDefault()
      instance.stop()
      canvas.classList.remove('is-ready')
      setThreeStatus('unavailable')
    }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      cancelAnimationFrame(show)
      motion.removeEventListener('change', onMotion)
      canvas.removeEventListener('webglcontextlost', onLost)
      instance.dispose()
      setEngine(null)
      setThreeStatus('idle')
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="three-canvas" aria-hidden="true" />
      {debug && engine && (
        <Suspense fallback={null}>
          <DebugPanel engine={engine} />
        </Suspense>
      )}
    </>
  )
}
