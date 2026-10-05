import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, Copy, Minus, Plus } from 'lucide-react'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import OrderMenu from '../common/OrderMenu.jsx'
import { THREE_CONFIG } from '../../three/config.js'
import { useThreeStatus } from '../../three/store.js'
import { boxColors, boxSizes, cardLimit, giftSection, honeyTones, jarProducts } from '../../data/giftbox.js'
import { products } from '../../data/products.js'
import { setGift, useGift } from '../../lib/giftbox.js'
import './GiftBuilder.css'

const STEPS = ['Kiểu hộp', 'Màu hộp', 'Mật bên trong', 'Thiệp']
const jars = jarProducts.map((id) => products.find((p) => p.id === id)).filter(Boolean)
const money = (s) => Number(String(s || '').replace(/\D/g, '')) || 0
const vnd = (n) => `${n.toLocaleString('vi-VN')} ₫`

/** Hình lục giác nhỏ (biểu tượng hộp / ô màu, có thể kèm dải ruy băng ngang). */
function Hex({ size = 40, fill = 'none', stroke = 'currentColor', inner, band, id, children }) {
  const pts = (r) =>
    [0, 1, 2, 3, 4, 5]
      .map((k) => {
        const a = (k * Math.PI) / 3
        return `${(20 + r * Math.cos(a)).toFixed(2)},${(20 + r * Math.sin(a)).toFixed(2)}`
      })
      .join(' ')
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {band && (
        <clipPath id={`hex-${id}`}>
          <polygon points={pts(18)} />
        </clipPath>
      )}
      <polygon points={pts(18)} fill={fill} stroke={stroke} strokeWidth="1.5" />
      {inner && <polygon points={pts(13)} fill="none" stroke={inner} strokeWidth="1.2" />}
      {band && <rect x="0" y="25" width="40" height="5" fill={band} clipPath={`url(#hex-${id})`} />}
      {children}
    </svg>
  )
}

/** Mô tả hộp thành lời nhắn — khách dán vào Facebook / Zalo. */
function message(g, size, color, counts, total) {
  const lines = [`Chào MelBee, mình muốn đặt một hộp quà:`, `• ${size.name} (lục giác) · màu ${color.name}`]
  for (const p of jars) if (counts[p.id]) lines.push(`• ${counts[p.id]} × ${p.name}${p.size ? ` (${p.size})` : ''}`)
  if (g.card.on) {
    const text = g.card.text.trim()
    lines.push(`• Thiệp: ${text ? `“${text}”` : '(chưa viết lời nhắn)'}${g.card.from.trim() ? ` — ${g.card.from.trim()}` : ''}`)
  }
  lines.push(`Tạm tính trên web: ${vnd(total)}`)
  return lines.join('\n')
}

/** Sân khấu của hộp 3D (lớp Three.js vẽ đè lên đúng khung này và nghe chuột/chạm ở đây). */
function GiftStage({ g, size, label }) {
  const [played, setPlayed] = useState(false)
  return (
    <div
      className={`gift__stage ${played ? 'is-played' : ''} is-${size.id}`}
      role="img"
      aria-label={label}
      data-cursor="grab"
      data-cursor-label={g.open ? 'Đóng' : 'Mở'}
      onPointerDown={() => setPlayed(true)}
    >
      <span className="gift__hint" aria-hidden="true">
        <span className="gift__hint-mouse">{giftSection.hint.mouse}</span>
        <span className="gift__hint-touch">{giftSection.hint.touch}</span>
      </span>
    </div>
  )
}

export default function GiftBuilder() {
  const g = useGift()
  const [step, setStep] = useState(0)
  const [copied, setCopied] = useState(false)
  const three = useThreeStatus()
  const live = THREE_CONFIG.enabled && THREE_CONFIG.effects.giftBox && three !== 'unavailable'
  if (!jars.length) return null

  const size = boxSizes.find((s) => s.id === g.size) || boxSizes[0]
  const color = boxColors.find((c) => c.id === g.color) || boxColors[0]
  const counts = {}
  for (const id of g.jars) counts[id] = (counts[id] || 0) + 1
  const filled = g.jars.length
  const total = money(size.fee) + g.jars.reduce((sum, id) => sum + money(products.find((p) => p.id === id)?.price), 0)
  const summary = `${size.name} màu ${color.name}, ${filled} hũ mật${g.card.on ? ', kèm thiệp' : ''}`

  // bước "mật bên trong" và "thiệp" mở nắp cho thấy bên trong; kiểu hộp, màu hộp thì đóng lại để ngắm vỏ
  const go = (i) => {
    setStep(i)
    setGift({ open: i >= 2 })
  }
  const add = (id) => filled < size.slots && setGift({ jars: [...g.jars, id], open: true })
  const remove = (id) => {
    const i = g.jars.lastIndexOf(id)
    if (i >= 0) setGift({ jars: g.jars.filter((_, j) => j !== i), open: true })
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message(g, size, color, counts, total))
      setCopied(true)
      setTimeout(() => setCopied(false), 4000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="hop-qua" data-scene="gift" className="section gift" aria-labelledby="gift-title">
      <div className="container">
        <SectionHeading id="gift-title" eyebrow={giftSection.eyebrow} title={giftSection.title} subtitle={giftSection.subtitle} />

        <div className="gift__grid">
          <Reveal className="gift__visual" effect="scale" duration={1.1}>
            {live ? <GiftStage g={g} size={size} label={`Hộp quà 3D: ${summary}`} /> : <Media art="gift" alt={`Hộp quà: ${summary}`} className="gift__fallback" />}
            <div className="gift__bar">
              {live && (
                <button type="button" className="gift__lid" onClick={() => setGift({ open: !g.open })} aria-pressed={g.open} data-bee-perch="top-right">
                  {g.open ? 'Đóng nắp' : 'Mở nắp'}
                </button>
              )}
              <p className="gift__caption">
                {size.name} · {color.name} · {filled}/{size.slots} hũ{g.card.on ? ' · có thiệp' : ''}
              </p>
            </div>
          </Reveal>

          <Reveal className="gift__panel" delay={0.1}>
            <ol className="gift__steps">
              {STEPS.map((s, i) => (
                <li key={s}>
                  <button type="button" className={i === step ? 'is-on' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}>
                    <span className="gift__no">{i < step ? <Check size={13} strokeWidth={2.4} /> : String(i + 1).padStart(2, '0')}</span>
                    <span>{s}</span>
                  </button>
                </li>
              ))}
            </ol>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                className="gift__body"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: [0.22, 0.8, 0.24, 1] }}
              >
                {step === 0 && (
                  <>
                    <h3 className="gift__h">Chọn kiểu hộp</h3>
                    <p className="gift__lead">Hộp lục giác như một ô tổ ong, giấy bồi cứng in nhũ dãy núi Tây Bắc, thắt nơ satin; khay tổ ong bên trong giữ chặt từng hũ.</p>
                    <div className="gift__options">
                      {boxSizes.map((s) => (
                        <button type="button" key={s.id} className={`gift__option ${g.size === s.id ? 'is-on' : ''}`} aria-pressed={g.size === s.id} onClick={() => setGift({ size: s.id, open: false })}>
                          <Hex size={s.slots > 1 ? 46 : 34} inner="currentColor" />
                          <b>{s.name}</b>
                          <small>{s.note}</small>
                          <em>{s.fee}</em>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <h3 className="gift__h">Chọn màu hộp</h3>
                    <p className="gift__lead">Ba màu giấy, nhũ in và ruy băng satin phối theo — xoay hộp để xem nhũ bắt nắng.</p>
                    <div className="gift__swatches">
                      {boxColors.map((c) => (
                        <button type="button" key={c.id} className={`gift__swatch ${g.color === c.id ? 'is-on' : ''}`} aria-pressed={g.color === c.id} onClick={() => setGift({ color: c.id, open: false })}>
                          <Hex size={54} fill={c.paper} stroke={c.foil} inner={c.foil} band={c.ribbon} id={c.id} />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h3 className="gift__h">Chọn mật bên trong</h3>
                    <p className="gift__lead">
                      {size.name} vừa {size.slots} hũ. {filled < size.slots ? `Còn trống ${size.slots - filled} ô.` : 'Đã đầy hộp.'}
                    </p>
                    <ul className="gift__jars">
                      {jars.map((p) => {
                        const tone = honeyTones[p.tone] || honeyTones.amber
                        const n = counts[p.id] || 0
                        return (
                          <li key={p.id} className={n ? 'is-on' : ''}>
                            <span className="gift__jar" style={{ '--h1': tone.light, '--h2': tone.mid, '--h3': tone.deep }} aria-hidden="true" />
                            <span className="gift__jar-text">
                              <b>{p.name}</b>
                              <small>
                                {p.size}
                                {p.size && p.price && ' · '}
                                {p.price && <span>{p.price}</span>}
                              </small>
                            </span>
                            <span className="gift__stepper">
                              <button type="button" onClick={() => remove(p.id)} disabled={!n} aria-label={`Bớt một hũ ${p.name}`}>
                                <Minus size={15} />
                              </button>
                              <output aria-live="polite">{n}</output>
                              <button type="button" onClick={() => add(p.id)} disabled={filled >= size.slots} aria-label={`Thêm một hũ ${p.name}`}>
                                <Plus size={15} />
                              </button>
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h3 className="gift__h">Viết thiệp</h3>
                    <label className="gift__toggle">
                      <input type="checkbox" checked={g.card.on} onChange={(e) => setGift({ card: { ...g.card, on: e.target.checked }, open: true })} />
                      <span>Kèm thiệp viết tay — gài ở mặt trong nắp</span>
                    </label>
                    {g.card.on && (
                      <div className="gift__card">
                        <label>
                          <span>Lời nhắn</span>
                          <textarea
                            rows={3}
                            maxLength={cardLimit}
                            value={g.card.text}
                            placeholder="Chúc bố mẹ một mùa xuân thật khoẻ…"
                            onChange={(e) => setGift({ card: { ...g.card, text: e.target.value }, open: true })}
                          />
                          <small>
                            {g.card.text.length}/{cardLimit}
                          </small>
                        </label>
                        <label>
                          <span>Ký tên</span>
                          <input type="text" maxLength={40} value={g.card.from} placeholder="Con gái" onChange={(e) => setGift({ card: { ...g.card, from: e.target.value }, open: true })} />
                        </label>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="gift__inside">
              <p className="gift__label">Trong hộp có</p>
              <ul>
                <li>
                  {size.name} lục giác · {color.name}
                  <span>{size.fee}</span>
                </li>
                {jars
                  .filter((p) => counts[p.id])
                  .map((p) => (
                    <li key={p.id}>
                      {counts[p.id]} × {p.name}
                      <span>{vnd(money(p.price) * counts[p.id])}</span>
                    </li>
                  ))}
                {!filled && <li className="is-empty">Chưa có hũ mật nào</li>}
                {g.card.on && (
                  <li>
                    Thiệp viết tay<span>Tặng kèm</span>
                  </li>
                )}
              </ul>
              <p className="gift__total">
                <span>Tạm tính</span>
                <b>{vnd(total)}</b>
              </p>
              <p className="gift__note">{giftSection.note}</p>
            </div>

            <div className="gift__actions">
              {step > 0 && (
                <button type="button" className="gift__back" onClick={() => go(step - 1)}>
                  <ChevronLeft size={16} /> Quay lại
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="btn btn--solid" onClick={() => go(step + 1)} data-cursor="cta">
                  <span>Tiếp tục</span>
                  <ChevronRight size={17} />
                </button>
              ) : (
                <OrderMenu
                  label="Gửi mẫu hộp"
                  align="up"
                  hint="Lời nhắn mô tả hộp được chép sẵn — mở khung chat rồi dán vào là xong."
                  onPick={copy}
                />
              )}
            </div>
            {step === STEPS.length - 1 && (
              <button type="button" className="gift__copy" onClick={copy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Đã chép lời nhắn — dán vào khung chat để gửi' : 'Chỉ chép lời nhắn'}
              </button>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
