import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'framer-motion'
import { Check, Copy, ZoomIn } from 'lucide-react'
import OrderMenu from '../common/OrderMenu.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import GiftBox3D from '../../pages/giftbox3d/GiftBox3D.jsx'
import Lightbox from '../Lightbox/Lightbox.jsx'
import { giftBoxes, giftSet, honeys } from '../../data/catalog.js'
import { giftSection } from '../../data/giftbox.js'
import { asset } from '../../lib/assets.js'
import './GiftSet.css'

const vnd = (n) => `${n.toLocaleString('vi-VN')} ₫`
const byId = (id) => honeys.find((h) => h.id === id)

/** Lời nhắn mô tả hộp — chép sẵn để khách dán vào Zalo / Facebook. */
function message(box) {
  return [
    `Chào MelBee, mình muốn đặt ${box.set} · ${box.name} (${box.size}):`,
    ...box.preset.map((id, i) => `• ${byId(id).name} ${box.slots[i]}`),
    '• Hộp cứng + túi giấy MELBEE',
    `Giá trọn bộ: ${vnd(box.price)}`,
  ].join('\n')
}

const setAlt = (b) => `${b.set} MelBee: ${b.name} mở nắp, các lọ mật trong khay`
/** Ảnh minh hoạ các set — xem lớn trong Lightbox, ← → chuyển giữa các set */
const setPhotos = giftBoxes
  .filter((b) => b.photoSet)
  .map((b) => ({ id: b.id, image: b.photoSet, alt: setAlt(b), caption: `${b.set} · ${b.name} · ảnh minh hoạ` }))

/** Hộp 3D xoay được · ảnh minh hoạ cả set (set nào có ảnh mới hiện nút chuyển), bấm ảnh để xem lớn */
function BoxVisual({ box }) {
  const [picked, setView] = useState('3d')
  const [zoom, setZoom] = useState(null)
  // đổi sang hộp chưa có ảnh set thì quay về 3D
  const view = box.photoSet ? picked : '3d'
  return (
    <figure className="giftset__visual">
      {view === '3d' ? (
        <GiftBox3D
          key={box.id}
          layout={box.id}
          jars={box.preset.map((id) => ({ color: byId(id).color, name: byId(id).short, ...byId(id).label }))}
          fallback={<img src={asset(box.photo)} alt={`${box.name} MelBee`} />}
        />
      ) : (
        // khung vuông như hộp 3D: ảnh ngang hay dọc đều cùng cỡ, phần thừa là chính ảnh đó làm mờ
        <button
          type="button"
          className="giftset__photo"
          style={{ '--bg': `url("${asset(box.photoSet)}")` }}
          onClick={() => setZoom(setPhotos.findIndex((p) => p.id === box.id))}
          aria-label={`Xem lớn: ${setAlt(box)}`}
        >
          <img key={box.id} src={asset(box.photoSet)} alt="" />
          <span className="giftset__zoom" aria-hidden="true">
            <ZoomIn size={16} /> Phóng to
          </span>
        </button>
      )}
      {box.photoSet && (
        <div className="giftset__views" role="group" aria-label="Cách xem hộp">
          {[
            ['3d', 'Xoay 3D'],
            ['set', 'Ảnh set'],
          ].map(([v, label]) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
              {label}
            </button>
          ))}
        </div>
      )}
      <figcaption>
        {box.name} · {box.size} · {view === 'set' ? 'ảnh minh hoạ' : 'bản thiết kế'}
      </figcaption>
      {/* gắn vào body: khung ảnh dính (sticky) tạo lớp xếp riêng, để trong đó thì thanh menu đè lên */}
      {createPortal(
        <AnimatePresence>
          {zoom !== null && <Lightbox items={setPhotos} index={zoom} onChange={setZoom} onClose={() => setZoom(null)} />}
        </AnimatePresence>,
        document.body,
      )}
    </figure>
  )
}

/**
 * Hộp quà MelBee: chọn set 2 · 3 · 4 lọ. Mỗi set cố định loại mật và giá theo bảng giá (khách không đổi mật từng lọ).
 * Dùng ở trang chủ và trang Hộp quà.
 */
export default function GiftSet() {
  // ?set=hop-4 (từ bảng hộp quà ở trang Sản phẩm) → mở sẵn set đó
  const [boxId, setBoxId] = useState(() => {
    const want = new URLSearchParams(window.location.search).get('set')
    return giftBoxes.some((b) => b.id === want) ? want : giftBoxes[0].id
  })
  const [copied, setCopied] = useState(false)
  const box = giftBoxes.find((b) => b.id === boxId)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message(box))
      setCopied(true)
      setTimeout(() => setCopied(false), 4000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="giftset">
      <BoxVisual box={box} />

      <div className="giftset__panel">
        <fieldset className="giftset__boxes">
          <legend className="giftset__label">Chọn hộp</legend>
          {giftBoxes.map((b) => (
            <label key={b.id} className={b.id === box.id ? 'is-on' : ''}>
              <input type="radio" name="giftbox" value={b.id} checked={b.id === box.id} onChange={() => setBoxId(b.id)} />
              <b>{b.name}</b>
              <small>{vnd(b.price)}</small>
            </label>
          ))}
        </fieldset>

        <p className="giftset__desc">{giftSet.description}</p>

        <div className="giftset__label">Mật trong hộp</div>
        <ul className="giftset__jars">
          {box.preset.map((id, i) => {
            const h = byId(id)
            return (
              <li key={`${box.id}-${i}`}>
                <span className="giftset__swatch" style={{ '--c': h.color }} aria-hidden="true" />
                <div className="giftset__slot">
                  <small>
                    Lọ {i + 1} · {box.slots[i]}
                  </small>
                  <b>{h.name}</b>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="giftset__sum">
          <ul>
            <li>
              Hộp cứng + túi giấy MELBEE<span>Đã gồm</span>
            </li>
          </ul>
          <p className="giftset__total">
            <span>
              {box.set} · {box.name}
            </span>
            <b>{vnd(box.price)}</b>
          </p>
          <p className="giftset__note">Giá trọn bộ theo set. MelBee xác nhận lại giá khi nhận đơn.</p>
        </div>

        <div className="giftset__actions">
          <OrderMenu label="Đặt hộp quà" align="up" hint="Thông tin hộp quà đã được sao chép — chỉ cần dán vào khung chat." onPick={copy} />
          <button type="button" className="giftset__copy" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Đã sao chép' : 'Sao chép thông tin đơn'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Khối "Hộp quà" của trang chủ. */
export function GiftSection() {
  return (
    <section id="hop-qua" data-scene="gift" className="section" aria-labelledby="gift-title">
      <div className="container">
        <SectionHeading id="gift-title" eyebrow={giftSection.eyebrow} title={giftSection.title} subtitle={giftSection.subtitle} />
        <div className="giftset-gap">
          <GiftSet />
        </div>
      </div>
    </section>
  )
}
