import { useEffect, useRef, useState } from 'react'
import { Box, PackageOpen } from 'lucide-react'
import { hasWebGL } from '../../three/utils/performance.js'
import { pageTransitionDone } from '../../lib/pageTransition.js'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { asset } from '../../lib/assets.js'
import { brand } from '../../config/brand.js'
import './GiftBox3D.css'

/**
 * Hộp quà 3D dựng từ file in. Three.js chỉ tải khi khung sắp hiện trên màn hình và sau hiệu ứng chuyển trang.
 * Chưa tải xong / máy không có WebGL → hiện `fallback` (ảnh bản thiết kế mặt hộp).
 */
export default function GiftBox3D({ fallback }) {
  const wrap = useRef(null)
  const canvas = useRef(null)
  const api = useRef(null)
  const [state, setState] = useState('idle') // idle | ready | off
  const [open, setOpen] = useState(false)
  const touch = useMediaQuery('(hover: none)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (!hasWebGL()) {
      setState('off')
      return
    }
    let alive = true
    const load = async () => {
      try {
        await pageTransitionDone
        const { createGiftBox } = await import('./scene.js')
        if (!alive) return
        api.current = createGiftBox(canvas.current, {
          url: (name) => asset(`assets/images/gift/3d/${name}`),
          logo: asset(brand.logo),
          reducedMotion: reduced,
          onReady: (err) => alive && setState(err ? 'off' : 'ready'),
          onOpenChange: (v) => alive && setOpen(v),
        })
      } catch {
        if (alive) setState('off')
      }
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        load()
      },
      { rootMargin: '300px' }
    )
    io.observe(wrap.current)
    return () => {
      alive = false
      io.disconnect()
      api.current?.dispose()
      api.current = null
    }
    // reduced chỉ đọc lúc tạo cảnh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={wrap} className={`box3d is-${state}`}>
      <div className="box3d__fallback">{fallback}</div>
      {state !== 'off' && <canvas ref={canvas} className="box3d__canvas" aria-label="Hộp quà MelBee 3D — kéo để xoay, chạm để mở nắp" role="img" />}
      {state === 'ready' && (
        <div className="box3d__bar">
          <span className="box3d__hint">{touch ? 'Vuốt ngang để xoay · chạm hộp để mở nắp' : 'Kéo để xoay mọi hướng · bấm hộp để mở nắp'}</span>
          <button type="button" className="box3d__btn" onClick={() => api.current?.toggle()} aria-pressed={open}>
            {open ? <Box size={16} aria-hidden="true" /> : <PackageOpen size={16} aria-hidden="true" />}
            {open ? 'Đóng nắp' : 'Mở nắp'}
          </button>
        </div>
      )}
    </div>
  )
}
