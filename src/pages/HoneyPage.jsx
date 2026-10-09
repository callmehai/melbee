import { useId, useState } from 'react'
import { Shell, Crumbs, Photo, HoneyCard, OrderButtons, jarPrice, vnd } from './common.jsx'
import { honeys, sizes, commonInfo } from '../data/catalog.js'
import { page } from '../lib/site.js'
import Reveal from '../components/common/Reveal.jsx'

const TABS = ['Mô tả & gợi ý dùng', 'Cách dùng', 'Bảo quản & lưu ý']

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
            {commonInfo.usage.map((t) => (
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
            <div>
              <dt>Mật bị kết tinh?</dt>
              <dd>{commonInfo.crystallize}</dd>
            </div>
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

/** /san-pham/<id>/ — một loại mật: xem có hợp không và đặt mua. */
export default function HoneyPage({ id }) {
  const honey = honeys.find((h) => h.id === id) || honeys[0]
  const others = honeys.filter((h) => h.id !== honey.id)
  const [size, setSize] = useState(sizes[1])
  const price = jarPrice(honey, size)

  return (
    <Shell current="products">
      <div className="container detail-crumbs">
        <Crumbs items={[['Trang chủ', ''], ['Sản phẩm', 'san-pham/'], [honey.short]]} />
      </div>

      <div className="container detail">
        <Photo src={honey.image} alt={honey.name} className="detail__photo" eager />

        <div className="detail__info">
          <p className="eyebrow">{honey.group}</p>
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
            <legend>Dung tích</legend>
            <div className="sizes__row">
              {sizes.map((s) => (
                <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <p className="price">
            <b>{price || 'Liên hệ'}</b>
            {price ? (
              <>
                <em>/ lọ {size}</em>
                {honey.pricePerLiter && <span>{vnd(honey.pricePerLiter)} / lít</span>}
              </>
            ) : (
              <span>Nhắn MelBee để được báo giá lọ {size}</span>
            )}
          </p>

          <OrderButtons />
        </div>
      </div>

      <InfoTabs honey={honey} />

      <section className="container others" aria-labelledby="others-title">
        <div className="others__head">
          <h2 id="others-title" className="sp-h2">
            Loại mật khác
          </h2>
          <a className="arrow-link" href={page('san-pham/')}>
            <span>Tất cả sản phẩm</span>
          </a>
        </div>
        <ul className="hgrid is-three">
          {others.map((h, i) => (
            <Reveal as="li" key={h.id} delay={i * 0.08}>
              <HoneyCard honey={h} sizes={sizes} compact />
            </Reveal>
          ))}
        </ul>
      </section>
    </Shell>
  )
}
