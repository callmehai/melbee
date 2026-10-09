import { useEffect, useRef, useState } from 'react'
import { Box, PackageOpen } from 'lucide-react'
import { hasWebGL } from '../../three/utils/performance.js'
import { afterPageTransition } from '../../lib/pageTransition.js'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { asset } from '../../lib/assets.js'
import { brand } from '../../config/brand.js'
import './GiftBox3D.css'

const texUrl = (name) => asset(`assets/images/gift/3d/${name}`)
// ảnh các mặt hộp — tải ngay khi vào trang, song song với three.js (tên khớp với scene.js)
const TEXTURES = ['lid-top.jpg', 'lid-flap.jpg', 'lid-back.jpg', 'base-bottom.jpg', 'base-long.jpg', 'base-short.jpg', '../hop-mat-trong.jpg']

/**
 * Hộp quà set 2 lọ 380ml 3D, dựng từ file in.
 * Vừa vào trang là tải three.js + ảnh các mặt hộp song song; trong lúc chờ hiện logo "Đang mở hộp quà…".
 * Máy không có WebGL → hiện `fallback` (ảnh bản thiết kế mặt hộp).
 *
 * jarColors: màu mật 2 lọ (theo loại khách chọn) · openKey: đổi giá trị → mở nắp (vd sau khi chọn mật)
 */
export default function GiftBox3D({ fallback, jarColors = [], openKey }) {
  const canvas = useRef(null)
  const api = useRef(null)
  const colors = useRef(jarColors)
  const [state, setState] = useState(() => (hasWebGL() ? 'loading' : 'off')) // loading | ready | off
  const [open, setOpen] = useState(false)
  const touch = useMediaQuery('(hover: none)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (state === 'off') return
    let alive = true
    // tải ngay, song song: code 3D (three.js) + ảnh các mặt hộp
    TEXTURES.forEach((n) => (new Image().src = texUrl(n)))
    const scene = import('./scene.js')
    ;(async () => {
      try {
        const { createGiftBox } = await scene
        await afterPageTransition()
        if (!alive) return
        api.current = createGiftBox(canvas.current, {
          url: texUrl,
          logo: asset(brand.logo),
          jarColors: colors.current,
          reducedMotion: reduced,
          onReady: (err) => alive && setState(err ? 'off' : 'ready'),
          onOpenChange: (v) => alive && setOpen(v),
        })
      } catch {
        if (alive) setState('off')
      }
    })()
    return () => {
      alive = false
      api.current?.dispose()
      api.current = null
    }
    // tạo cảnh một lần; màu mật, mở nắp cập nhật qua api bên dưới
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const colorKey = jarColors.join(',')
  useEffect(() => {
    colors.current = jarColors
    api.current?.setJarColors(jarColors)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorKey])

  useEffect(() => {
    if (openKey !== undefined) api.current?.setOpen(true)
  }, [openKey])

  return (
    <div className={`box3d is-${state}`}>
      {state === 'off' ? (
        <div className="box3d__fallback">{fallback}</div>
      ) : (
        <>
          <div className="box3d__loading" aria-hidden={state === 'ready'}>
            <img src={asset(brand.logo)} alt="" />
            <span>Đang mở hộp quà…</span>
          </div>
          <canvas ref={canvas} className="box3d__canvas" aria-label="Hộp quà MelBee 3D — kéo để xoay, chạm để mở nắp" role="img" />
        </>
      )}
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
