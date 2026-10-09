import { useState } from 'react'
import { Check, Copy, Minus, Plus } from 'lucide-react'
import OrderMenu from '../common/OrderMenu.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import GiftBox3D from '../../pages/giftbox3d/GiftBox3D.jsx'
import { giftSet, honeys } from '../../data/catalog.js'
import { giftSection } from '../../data/giftbox.js'
import { asset } from '../../lib/assets.js'
import { page } from '../../lib/site.js'
import './GiftSet.css'

const SLOTS = 2
const SIZE = '380ml'

/** Giá một lọ 380ml: giá đặt riêng, không thì tính từ giá lít (làm tròn nghìn); chưa có → null */
function jarPrice(h) {
  if (h.prices?.[SIZE]) return Number(String(h.prices[SIZE]).replace(/\D/g, ''))
  if (!h.pricePerLiter) return null
  return Math.round((h.pricePerLiter * parseInt(SIZE, 10)) / 1000 / 1000) * 1000
}
const vnd = (n) => `${n.toLocaleString('vi-VN')} ₫`

/** Lời nhắn mô tả set quà — chép sẵn để khách dán vào Zalo / Facebook. */
function message(picked, known, missing) {
  const lines = [`Chào MelBee, mình muốn đặt ${giftSet.name}:`]
  for (const [h, n] of picked) {
    const p = jarPrice(h)
    lines.push(`• ${n} × ${h.name} (${SIZE})${p ? ` — ${vnd(p * n)}` : ''}`)
  }
  if (known) lines.push(`Tạm tính ${missing ? 'các lọ đã có giá' : 'mật'} trên web: ${vnd(known)} (chưa gồm hộp)`)
  return lines.join('\n')
}

/**
 * Set quà 2 lọ 380ml: hộp 3D thật (dựng từ file in) + chọn 2 lọ trong 4 loại mật.
 * Chọn mật → nắp tự mở, màu mật trong lọ đổi theo. Dùng ở trang chủ và trang Hộp quà.
 */
export default function GiftSet() {
  const [jars, setJars] = useState(['khoai-rung', 'hang-da'])
  const [opened, setOpened] = useState(undefined)
  const [copied, setCopied] = useState(false)

  const counts = {}
  for (const id of jars) counts[id] = (counts[id] || 0) + 1
  const picked = honeys.filter((h) => counts[h.id]).map((h) => [h, counts[h.id]])
  const known = picked.reduce((sum, [h, n]) => sum + (jarPrice(h) || 0) * n, 0)
  const missing = picked.some(([h]) => !jarPrice(h)) || jars.length < SLOTS
  const colors = jars.map((id) => honeys.find((h) => h.id === id)?.color)

  const change = (next) => {
    setJars(next)
    setOpened((k) => (k || 0) + 1) // chọn mật → mở nắp cho thấy lọ bên trong
  }
  const add = (id) => jars.length < SLOTS && change([...jars, id])
  const remove = (id) => {
    const i = jars.lastIndexOf(id)
    if (i >= 0) change(jars.filter((_, j) => j !== i))
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message(picked, known, missing))
      setCopied(true)
      setTimeout(() => setCopied(false), 4000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="giftset">
      <figure className="giftset__visual">
        <GiftBox3D
          jarColors={colors}
          openKey={opened}
          fallback={<img src={asset(giftSet.designFront)} alt={`${giftSet.name} — mặt hộp`} />}
        />
        <figcaption>Hộp 3D dựng theo bản thiết kế in · 22 × 15 × 10 cm</figcaption>
      </figure>

      <div className="giftset__panel">
        <p className="eyebrow">Set quà</p>
        <h3 className="giftset__name">{giftSet.name}</h3>
        <p className="giftset__desc">{giftSet.description}</p>

        <h4 className="giftset__label">
          Chọn {SLOTS} lọ mật{' '}
          <span>
            {jars.length}/{SLOTS}
          </span>
        </h4>
        <ul className="giftset__jars">
          {honeys.map((h) => {
            const n = counts[h.id] || 0
            const p = jarPrice(h)
            return (
              <li key={h.id} className={n ? 'is-on' : ''}>
                <span className="giftset__swatch" style={{ '--c': h.color }} aria-hidden="true" />
                <a className="giftset__jar" href={page(`san-pham/${h.id}/`)}>
                  <b>{h.short}</b>
                  <small>
                    {SIZE} · {p ? vnd(p) : 'Liên hệ'}
                  </small>
                </a>
                <span className="giftset__stepper">
                  <button type="button" onClick={() => remove(h.id)} disabled={!n} aria-label={`Bớt một lọ ${h.short}`}>
                    <Minus size={15} />
                  </button>
                  <output aria-live="polite">{n}</output>
                  <button type="button" onClick={() => add(h.id)} disabled={jars.length >= SLOTS} aria-label={`Thêm một lọ ${h.short}`}>
                    <Plus size={15} />
                  </button>
                </span>
              </li>
            )
          })}
        </ul>

        <div className="giftset__sum">
          <ul>
            <li>
              Hộp quà MelBee · nắp gập in nhũ vàng<span>{giftSet.price || 'Liên hệ'}</span>
            </li>
            {picked.map(([h, n]) => (
              <li key={h.id}>
                {n} × {h.name}
                <span>{jarPrice(h) ? vnd(jarPrice(h) * n) : 'Liên hệ'}</span>
              </li>
            ))}
            {!jars.length && <li className="is-empty">Chưa chọn lọ mật nào</li>}
          </ul>
          <p className="giftset__total">
            <span>Tạm tính mật</span>
            <b>{known ? vnd(known) : 'Liên hệ'}</b>
          </p>
          <p className="giftset__note">
            {missing ? 'Chưa đủ giá để tính trọn hộp — ' : 'Chưa gồm giá hộp — '}MelBee xác nhận giá khi nhắn tin.
          </p>
        </div>

        <div className="giftset__actions">
          <OrderMenu label="Gửi đơn hộp quà" align="up" hint="Lời nhắn mô tả hộp được chép sẵn — mở khung chat rồi dán vào là xong." onPick={copy} />
          <button type="button" className="giftset__copy" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Đã chép lời nhắn' : 'Chép lời nhắn'}
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
