import { useId, useState } from 'react'
import { Shell, Crumbs, Photo, HoneyCard, OrderButtons, priceOf, perUnit, vnd } from './common.jsx'
import { honeys, sizesOf, commonInfo, giftBoxes } from '../data/catalog.js'
import { page } from '../lib/site.js'
import Reveal from '../components/common/Reveal.jsx'
import { asset } from '../lib/assets.js'

const TABS = ['Mô tả', 'Cách dùng', 'Bảo quản'] // ngắn để vừa một hàng trên điện thoại

/** Tab Mô tả / Cách dùng / Bảo quản — mũi tên trái phải chuyển tab như tab chuẩn. */
function InfoTabs({ honey }) {
  const [tab, setTab] = useState(0)
  const id = useId()
  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const next = (tab + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length
    setTab(next)
    document.getElementById(`${id}-tab-${next}`)?.focus()
  }
  return (
    <section className="container dtabs" aria-label="Thông tin sản phẩm">
      <div role="tablist" className="dtabs__list" onKeyDown={onKey}>
        {TABS.map((t, i) => (
          <button
            key={t}
            id={`${id}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={tab === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={tab === i ? 0 : -1}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-panel-${tab}`} aria-labelledby={`${id}-tab-${tab}`} className="dtabs__panel">
        {tab === 0 && (
          <ul className="dots">
            {honey.highlights.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        {tab === 1 && (
          <ul className="dots">
            {(honey.usage || commonInfo.usage).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        {tab === 2 && (
          <dl className="dtabs__dl">
            <div>
              <dt>Bảo quản</dt>
              <dd>{commonInfo.storage}</dd>
            </div>
            {!honey.comb && (
              <div>
                <dt>Mật bị kết tinh?</dt>
                <dd>{commonInfo.crystallize}</dd>
              </div>
            )}
            <div>
              <dt>Lưu ý</dt>
              <dd>
                <b>{commonInfo.warning}</b>
              </dd>
            </div>
            <div>
              <dt>Thành phần · hạn dùng</dt>
              <dd>
                {commonInfo.ingredients} {commonInfo.shelfLife} · Xuất xứ {commonInfo.origin}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  )
}

/**
 * Định vị của MelBee là quà biếu → mỗi loại mật dẫn sang các set có loại đó (ảnh set + giá trọn bộ).
 * Loại không nằm trong set nào (Khoái rừng, bánh tổ) vẫn có lối sang trang Hộp quà.
 */
function InSets({ honey }) {
  const sets = giftBoxes.filter((b) => b.preset.includes(honey.id))
  return (
    <section className="container insets" aria-labelledby="insets-title">
      <div className="insets__head">
        <p className="eyebrow">Làm quà biếu</p>
        <h2 id="insets-title" className="sp-h2">
          {sets.length ? `${honey.short} có trong ${sets.length > 1 ? `${sets.length} set quà` : 'set quà'}` : 'Gửi tặng trong hộp quà MelBee'}
        </h2>
        <p>
          {sets.length
            ? 'Hộp cứng nâu trầm nhũ vàng, khay định hình, thìa gỗ lấy mật và túi giấy đồng bộ — giá trọn bộ đã gồm hộp và túi.'
            : 'Các set quà phối sẵn mật Hoa ban, Hoa rừng, Hoa nhãn và Hang đá trong hộp cứng nâu trầm nhũ vàng. Muốn thêm loại này vào quà, nhắn MelBee để được tư vấn.'}
        </p>
      </div>
      {sets.length > 0 ? (
        <ul className="insets__list">
          {sets.map((b, i) => (
            <Reveal as="li" key={b.id} delay={i * 0.08}>
              <a className="insets__card" href={page(`hop-qua/?set=${b.id}`)}>
                <span className="insets__img">
                  <img src={asset(b.photoSet)} alt={`${b.set} ${b.title}`} loading="lazy" decoding="async" width="1448" height="1086" />
                </span>
                <span className="insets__set">
                  {b.set} · {b.name}
                </span>
                <b>{b.title}</b>
                <span className="insets__price">{vnd(b.price)}</span>
              </a>
            </Reveal>
          ))}
        </ul>
      ) : (
        <a className="btn btn--outline" href={page('hop-qua/')}>
          Xem các hộp quà
        </a>
      )}
    </section>
  )
}

/** /san-pham/<id>/ — một loại mật: xem có hợp không và đặt mua. */
export default function HoneyPage({ id }) {
  const honey = honeys.find((h) => h.id === id) || honeys[0]
  const others = honeys.filter((h) => h.id !== honey.id)
  const sizes = sizesOf(honey)
  // mặc định lọ 380ml (cỡ của hộp quà) nếu loại này có, không thì cỡ đầu tiên
  const [size, setSize] = useState(sizes.includes('380ml') ? '380ml' : sizes[0])
  const price = priceOf(honey, size)

  return (
    <Shell current="products">
      <div className="container detail-crumbs">
        <Crumbs items={[['Trang chủ', ''], ['Sản phẩm', 'san-pham/'], [honey.short]]} />
      </div>

      <div className="container detail">
        <Photo src={honey.image} alt={honey.name} className="detail__photo" eager />

        <div className="detail__info">
          <p className="eyebrow">{honey.group}</p>
          {honey.award && <p className="award">{honey.award}</p>}
          <h1>{honey.name}</h1>
          <p className="detail__en" lang="en">
            {honey.nameEn}
          </p>
          <p className="detail__desc">{honey.description}</p>
          <ul className="chips">
            {honey.traits.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <fieldset className="sizes">
            <legend>{sizes.every((s) => s.endsWith('ml')) ? 'Dung tích' : 'Quy cách'}</legend>
            <div className="sizes__row">
              {sizes.map((s) => (
                <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <p className="price">
            <b>{price ? vnd(price) : 'Giá đang cập nhật'}</b>
            {price ? <em>{perUnit(size)}</em> : <span>Nhắn MelBee để được báo giá lọ {size}</span>}
          </p>
          {honey.codes?.[size] && <p className="detail__code">Mã sản phẩm: {honey.codes[size]}</p>}

          <OrderButtons />
        </div>
      </div>

      <InfoTabs honey={honey} />

      <InSets honey={honey} />

      <section className="container others" aria-labelledby="others-title">
        <div className="others__head">
          <h2 id="others-title" className="sp-h2">
            Loại mật khác
          </h2>
          <a className="arrow-link" href={page('san-pham/')}>
            <span>Tất cả sản phẩm</span>
          </a>
        </div>
        <ul className="hgrid is-others" style={{ '--cols': others.length }}>
          {others.map((h, i) => (
            <Reveal as="li" key={h.id} delay={i * 0.08}>
              <HoneyCard honey={h} compact />
            </Reveal>
          ))}
        </ul>
      </section>
    </Shell>
  )
}
