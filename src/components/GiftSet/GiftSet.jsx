import { useState } from 'react'
import { Check, ChevronDown, Copy, RotateCcw } from 'lucide-react'
import OrderMenu from '../common/OrderMenu.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import GiftBox3D from '../../pages/giftbox3d/GiftBox3D.jsx'
import { giftBoxes, giftBoxFee, giftSet, honeys } from '../../data/catalog.js'
import { giftSection } from '../../data/giftbox.js'
import { asset } from '../../lib/assets.js'
import './GiftSet.css'

const vnd = (n) => `${n.toLocaleString('vi-VN')} ₫`
const byId = (id) => honeys.find((h) => h.id === id)
/** Loại mật có bán lọ cỡ này (bánh tổ không vào hộp lọ) */
const fits = (size) => honeys.filter((h) => h.prices?.[size])
/** Giá chọn lẻ = giá các lọ + hộp & túi */
const loose = (box, jars) => jars.reduce((sum, id, i) => sum + byId(id).prices[box.slots[i]], giftBoxFee)
const isPresetOf = (box, jars) => jars.every((id, i) => id === box.preset[i])
/** Đúng set trong bảng giá → giá set cố định; khách đổi mật → giá chọn lẻ */
const total = (box, jars) => (isPresetOf(box, jars) && box.price ? box.price : loose(box, jars))

/** Lời nhắn mô tả hộp — chép sẵn để khách dán vào Zalo / Facebook. */
function message(box, jars) {
  return [
    `Chào MelBee, mình muốn đặt ${box.name} (${box.size}):`,
    ...jars.map((id, i) => `• ${byId(id).name} ${box.slots[i]} — ${vnd(byId(id).prices[box.slots[i]])}`),
    `• Hộp cứng + túi giấy — ${vnd(giftBoxFee)}`,
    `${isPresetOf(box, jars) ? `Giá trọn bộ ${box.set}` : 'Tạm tính'}: ${vnd(total(box, jars))}`,
  ].join('\n')
}

/** Hộp 3D xoay được · ảnh thiết kế hộp đóng · ảnh mở nắp */
function BoxVisual({ box, jars, openKey }) {
  const views = [
    ['3d', 'Xoay 3D'],
    ['closed', 'Ảnh hộp'],
    ['open', 'Ảnh mở nắp'],
  ]
  const [view, setView] = useState('3d')
  return (
    <figure className="giftset__visual">
      {view === '3d' ? (
        <GiftBox3D
          key={box.id}
          layout={box.id}
          jarColors={jars.map((id) => byId(id).color)}
          openKey={openKey}
          fallback={<img src={asset(box.photo)} alt={`${box.name} MelBee`} />}
        />
      ) : (
        <div className="giftset__photo">
          <img
            key={box.id + view}
            src={asset(view === 'open' ? box.photoOpen : box.photo)}
            alt={view === 'open' ? `${box.name} MelBee mở nắp: lót vàng mật, lời gửi in trong nắp` : `${box.name} MelBee, ${box.size}`}
            width="1000"
            height="1000"
          />
        </div>
      )}
      <div className="giftset__views" role="group" aria-label="Cách xem hộp">
        {views.map(([v, label]) => (
          <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
            {label}
          </button>
        ))}
      </div>
      <figcaption>
        {box.name} · {box.size} · bản thiết kế
      </figcaption>
    </figure>
  )
}

/**
 * Hộp quà MelBee: chọn hộp 2 · 3 · 4 lọ, đổi loại mật từng ô (đúng cỡ lọ của khay trong hộp),
 * giá = các lọ + 100.000 ₫ hộp và túi. Mặc định là các set trong bảng giá. Dùng ở trang chủ và trang Hộp quà.
 */
export default function GiftSet() {
  const [boxId, setBoxId] = useState(giftBoxes[0].id)
  const [chosen, setChosen] = useState(() => Object.fromEntries(giftBoxes.map((b) => [b.id, b.preset])))
  const [opened, setOpened] = useState(undefined)
  const [copied, setCopied] = useState(false)

  const box = giftBoxes.find((b) => b.id === boxId)
  const jars = chosen[box.id]
  const isPreset = isPresetOf(box, jars)
  const saving = loose(box, jars) - total(box, jars)

  const setJar = (i, id) => {
    setChosen((c) => ({ ...c, [box.id]: c[box.id].map((v, j) => (j === i ? id : v)) }))
    setOpened((k) => (k || 0) + 1) // đổi mật → hộp 3D mở nắp cho thấy lọ bên trong
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message(box, jars))
      setCopied(true)
      setTimeout(() => setCopied(false), 4000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="giftset">
      <BoxVisual box={box} jars={jars} openKey={opened} />

      <div className="giftset__panel">
        <fieldset className="giftset__boxes">
          <legend className="giftset__label">Chọn hộp</legend>
          {giftBoxes.map((b) => (
            <label key={b.id} className={b.id === box.id ? 'is-on' : ''}>
              <input type="radio" name="giftbox" value={b.id} checked={b.id === box.id} onChange={() => setBoxId(b.id)} />
              <b>{b.name}</b>
              <small>
                {vnd(total(b, chosen[b.id]))}
                {loose(b, chosen[b.id]) > total(b, chosen[b.id]) && <em>Ưu đãi</em>}
              </small>
            </label>
          ))}
        </fieldset>

        <p className="giftset__desc">{giftSet.description}</p>

        <div className="giftset__label">
          Mật trong hộp
          {!isPreset && (
            <button type="button" className="giftset__reset" onClick={() => setChosen((c) => ({ ...c, [box.id]: box.preset }))}>
              <RotateCcw size={13} aria-hidden="true" /> Dùng lại {box.set}
            </button>
          )}
        </div>
        <ul className="giftset__jars">
          {box.slots.map((size, i) => {
            const h = byId(jars[i])
            const selectId = `${box.id}-slot-${i}`
            return (
              <li key={selectId}>
                <span className="giftset__swatch" style={{ '--c': h.color }} aria-hidden="true" />
                <label className="giftset__slot" htmlFor={selectId}>
                  <small>
                    Lọ {i + 1} · {size}
                  </small>
                  <span className="giftset__select">
                    <select id={selectId} value={h.id} onChange={(e) => setJar(i, e.target.value)}>
                      {fits(size).map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.short}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} aria-hidden="true" />
                  </span>
                </label>
                <span className="giftset__price">{vnd(h.prices[size])}</span>
              </li>
            )
          })}
        </ul>

        <div className="giftset__sum">
          <ul>
            <li>
              Hộp cứng + túi giấy MELBEE<span>{vnd(giftBoxFee)}</span>
            </li>
            {saving > 0 && (
              <li className="giftset__saving">
                Ưu đãi {box.set}
                <span>−{vnd(saving)}</span>
              </li>
            )}
          </ul>
          <p className="giftset__total">
            <span>{isPreset ? `${box.set} · ${box.name}` : box.name}</span>
            <b>{vnd(total(box, jars))}</b>
          </p>
          <p className="giftset__note">
            {isPreset
              ? `Giá trọn bộ ${box.set}${saving > 0 ? ` — tiết kiệm ${vnd(saving)} so với mua lẻ` : ''}.`
              : 'Bộ tự chọn: tổng giá các lọ cộng 100.000 ₫ hộp và túi.'}{' '}
            MelBee xác nhận lại giá khi nhận đơn.
          </p>
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
