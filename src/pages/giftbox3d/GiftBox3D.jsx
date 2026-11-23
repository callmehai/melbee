import { useEffect, useRef, useState } from 'react'
import { ArrowUpFromLine, Box, PackageOpen, RotateCcw, RotateCw, ScanEye, SlidersHorizontal } from 'lucide-react'
import { hasWebGL } from '../../three/utils/performance.js'
import { afterPageTransition } from '../../lib/pageTransition.js'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { asset } from '../../lib/assets.js'
import { brand } from '../../config/brand.js'
import './GiftBox3D.css'

const texUrl = (name) => asset(`assets/images/gift/3d/${name}`)
// ảnh các mặt hộp — tải song song với three.js (tên khớp với scene.js)
const TEXTURES = ['lid-top.jpg', '../hop-mat-trong.jpg', '../hop-mat-truoc.jpg']

/**
 * Hộp quà 3D (hộp 2 · 3 · 4 lọ — layout: id hộp, xem layouts.js). Đổi hộp → dựng lại cảnh (dùng key ở chỗ gọi).
 * Khung sắp hiện thì tải three.js + ảnh các mặt hộp song song; trong lúc chờ hiện logo "Đang mở hộp quà…".
 * Máy không có WebGL → hiện `fallback` (ảnh bản thiết kế mặt hộp).
 *
 * jars: từng lọ theo set { color: màu mật, bg / ink: màu nhãn, name } · openKey: đổi giá trị → mở nắp
 */
export default function GiftBox3D({ layout = 'hop-2', fallback, jars = [], openKey }) {
  const canvas = useRef(null)
  const api = useRef(null)
  const jarList = useRef(jars)
  const [state, setState] = useState(() => (hasWebGL() ? 'loading' : 'off')) // loading | ready | off
  const [amount, setAmount] = useState(1) // mức mở nắp 0 → 1 — vào trang là hộp đã mở (như ảnh set)
  const [lifted, setLifted] = useState(false) // lọ đang nhấc lên khỏi khay
  const [top, setTop] = useState(false) // nhìn từ trên xuống
  const [more, setMore] = useState(false) // mở thêm: nhấc lọ, nhìn từ trên, mức mở nắp (gọn mặc định — nhiều nút trông như phần mềm)
  const open = amount >= 0.5
  const touch = useMediaQuery('(hover: none)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (state === 'off') return
    let alive = true
    const start = async () => {
      // song song: code 3D (three.js) + ảnh các mặt hộp
      TEXTURES.forEach((n) => (new Image().src = texUrl(n)))
      const scene = import('./scene.js')
      try {
        const { createGiftBox } = await scene
        await afterPageTransition()
        if (!alive) return
        api.current = createGiftBox(canvas.current, {
          layout,
          url: texUrl,
          jars: jarList.current,
          reducedMotion: reduced,
          startOpen: true,
          onReady: (err) => alive && setState(err ? 'off' : 'ready'),
          onOpenChange: (v) => alive && setAmount(v),
          onLiftChange: (v) => alive && setLifted(v),
        })
      } catch {
        if (alive) setState('off')
      }
    }
    // chỉ tải khi khung hộp còn cách màn hình ~1,5 màn: trang Hộp quà tải ngay, trang chủ đợi cuộn tới gần
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        start()
      },
      { rootMargin: '150% 0px' },
    )
    io.observe(canvas.current)
    return () => {
      alive = false
      io.disconnect()
      api.current?.dispose()
      api.current = null
    }
    // tạo cảnh một lần (đổi set thì dựng lại nhờ key ở chỗ gọi); mở nắp cập nhật qua api bên dưới
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (openKey !== undefined) api.current?.setOpen(1)
  }, [openKey])

  const toggleTop = () => {
    api.current?.setTop(!top)
    setTop(!top)
  }

  return (
    <div className="box3d-wrap">
      <div className={`box3d is-${state}`}>
        {state === 'off' ? (
          <div className="box3d__fallback">{fallback}</div>
        ) : (
          <>
            <div className="box3d__loading" aria-hidden={state === 'ready'}>
              <img src={asset(brand.logo)} alt="" />
              <span>Đang mở hộp quà…</span>
            </div>
            <canvas
              ref={canvas}
              className="box3d__canvas"
              aria-label="Hộp quà MelBee 3D — kéo để xoay, chạm để đóng / mở nắp; các nút bên dưới để xoay, mở nắp, nhấc lọ lên"
              role="img"
            />
          </>
        )}
      </div>

      {/* bảng điều khiển dưới khung (không đè lên hộp) — học từ trang thiết kế hộp quà A Sỉn */}
      {state === 'ready' && (
        <div className="box3d__ctrl">
          <div className="box3d__row">
            <button type="button" className="box3d__icon" onClick={() => api.current?.rotate(-1)} aria-label="Xoay hộp sang trái">
              <RotateCcw size={17} aria-hidden="true" />
            </button>
            <button type="button" className="box3d__main" onClick={() => api.current?.toggle()}>
              {open ? <Box size={16} aria-hidden="true" /> : <PackageOpen size={16} aria-hidden="true" />}
              {open ? 'Đóng nắp' : 'Mở nắp'}
            </button>
            <button type="button" className="box3d__icon" onClick={() => api.current?.rotate(1)} aria-label="Xoay hộp sang phải">
              <RotateCw size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="box3d__icon"
              aria-expanded={more}
              aria-controls="box3d-more"
              onClick={() => setMore((m) => !m)}
              aria-label={more ? 'Ẩn tuỳ chọn xem thêm' : 'Tuỳ chọn xem thêm: nhấc lọ, nhìn từ trên, mức mở nắp'}
              title="Xem thêm"
            >
              <SlidersHorizontal size={17} aria-hidden="true" />
            </button>
          </div>
          {more && (
            <div className="box3d__more" id="box3d-more">
              <div className="box3d__row">
                <button type="button" className="box3d__chip" aria-pressed={lifted} onClick={() => api.current?.setLift(!lifted)}>
                  <ArrowUpFromLine size={15} aria-hidden="true" />
                  Nhấc lọ lên
                </button>
                <button type="button" className="box3d__chip" aria-pressed={top} onClick={toggleTop}>
                  <ScanEye size={15} aria-hidden="true" />
                  Nhìn từ trên
                </button>
              </div>
              <label className="box3d__range">
                <span>Mở nắp</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(amount * 100)}
                  onChange={(e) => api.current?.setOpen(e.target.value / 100)}
                  style={{ '--v': `${Math.round(amount * 100)}%` }}
                />
                <output>{Math.round(amount * 100)}%</output>
              </label>
            </div>
          )}
          {/* gợi ý nằm dưới bảng nút (không đè lên hộp) */}
          <p className="box3d__hint">{touch ? 'Vuốt ngang để xoay · chạm hộp để mở / đóng nắp' : 'Kéo để xoay · bấm hộp để mở / đóng nắp'}</p>
        </div>
      )}
    </div>
  )
}
