import { MotionConfig } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar.jsx'
import Footer from '../components/Footer/Footer.jsx'
import SupportWidget from '../components/SupportWidget/SupportWidget.jsx'
import Button, { FacebookButton, ZaloButton } from '../components/common/Button.jsx'
import { brand } from '../config/brand.js'
import { commonInfo, company } from '../data/catalog.js'
import { asset, hasAsset } from '../lib/assets.js'
import { page } from '../lib/site.js'
import './pages.css'

/**
 * Khung chung của các trang con (Sản phẩm, Hộp quà, Câu chuyện, Liên hệ):
 * cùng thanh menu, chân trang, nút Zalo + trợ lý như trang chủ — nhưng không 3D, không nhạc.
 */
export function Shell({ current, children }) {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#noi-dung">
        Bỏ qua tới nội dung
      </a>
      <Navbar current={current} solid />
      <main id="noi-dung" className="subpage">
        {children}
      </main>
      <Footer />
      <SupportWidget />
    </MotionConfig>
  )
}

/** Đường dẫn + tiêu đề trang. crumbs: [['Trang chủ', ''], ['Sản phẩm', 'san-pham/'], ['Hoa ban']] — mục cuối là trang đang xem. */
export function PageHead({ crumbs, title, sub, children }) {
  return (
    <header className="container page-head">
      <Crumbs items={crumbs} />
      <h1>{title}</h1>
      {sub && <p className="page-head__sub">{sub}</p>}
      {children}
    </header>
  )
}

export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Đường dẫn">
      <ol>
        {items.map(([label, path], i) =>
          i < items.length - 1 ? (
            <li key={label}>
              <a href={page(path)}>{label}</a>
            </li>
          ) : (
            <li key={label} aria-current="page">
              {label}
            </li>
          )
        )}
      </ol>
    </nav>
  )
}

/** Ảnh thật nếu có file; chưa có thì khung "Ảnh sắp ra mắt" (logo trên nền tổ ong) — không vẽ hình thay hũ mật. */
export function Photo({ src, alt, className = '', eager = false }) {
  if (hasAsset(src)) {
    return (
      <div className={`photo ${className}`}>
        <img src={asset(src)} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      </div>
    )
  }
  return (
    <div className={`photo is-soon ${className}`} role="img" aria-label={`${alt} — ảnh sắp ra mắt`}>
      <img className="photo__logo" src={asset(brand.logo)} alt="" />
      <span className="photo__tag">Ảnh sắp ra mắt</span>
    </div>
  )
}

/** Giá của một dung tích; chưa có → "Liên hệ" */
export const priceOf = (honey, size) => honey.prices?.[size] || 'Liên hệ'

/** Khoảng dung tích "280 – 730ml" */
export const sizeRange = (sizes) => `${sizes[0].replace('ml', '')} – ${sizes[sizes.length - 1]}`

/** Thẻ một loại mật — cả thẻ là link sang trang chi tiết. */
export function HoneyCard({ honey, sizes, compact = false }) {
  // giá của dung tích nhỏ nhất đã có giá
  const from = sizes.find((s) => honey.prices?.[s])
  return (
    <a className={`hcard ${compact ? 'is-compact' : ''}`} href={page(`san-pham/${honey.id}/`)} id={honey.id}>
      <Photo src={honey.image} alt={honey.name} />
      <h2 className="hcard__name">{honey.short}</h2>
      {!compact && (
        <>
          <p className="hcard__taste">{honey.taste}</p>
          <div className="hcard__meta">
            <span>{sizeRange(sizes)}</span>
            <span>
              Giá: <b>{from ? `từ ${honey.prices[from]}` : 'Liên hệ'}</b>
            </span>
          </div>
          <span className="hcard__go">
            Xem chi tiết <ArrowUpRight size={15} aria-hidden="true" />
          </span>
        </>
      )}
    </a>
  )
}

/** Nút đặt mua: Zalo là nút chính, Facebook phụ, gọi điện là link. */
export function OrderButtons({ zaloLabel = 'Nhắn Zalo đặt mua', call = true }) {
  return (
    <div className="order">
      <div className="order__btns">
        <ZaloButton variant="zalo-solid">{zaloLabel}</ZaloButton>
        <FacebookButton variant="outline">Facebook</FacebookButton>
      </div>
      {call && (
        <p className="order__call">
          Hoặc gọi <a href={`tel:${company.hotline}`}>{company.hotlineDisplay}</a>
        </p>
      )}
    </div>
  )
}

/** Khối "Dùng & bảo quản" — đúng như nhãn in, chung cho cả 4 loại. */
export function UsageInfo({ id = 'thong-tin', title = 'Dùng & bảo quản' }) {
  return (
    <section className="usage" id={id} aria-labelledby={`${id}-title`}>
      <div className="container">
        <h2 id={`${id}-title`} className="sp-h2">
          {title}
        </h2>
        <dl className="usage__grid">
          <div>
            <dt>Cách dùng</dt>
            <dd>
              {commonInfo.usage[0]} {commonInfo.usage[1]}
            </dd>
          </div>
          <div>
            <dt>Mật bị kết tinh?</dt>
            <dd>{commonInfo.crystallize}</dd>
          </div>
          <div>
            <dt>Bảo quản</dt>
            <dd>{commonInfo.storage}</dd>
          </div>
          <div className="is-warn">
            <dt>Lưu ý</dt>
            <dd>{commonInfo.warning}</dd>
          </div>
          <div>
            <dt>Thành phần</dt>
            <dd>{commonInfo.ingredients}</dd>
          </div>
          <div>
            <dt>Hạn dùng</dt>
            <dd>
              {commonInfo.shelfLife} · Xuất xứ {commonInfo.origin}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

/** Dải mời bước tiếp ở cuối trang con. */
export function NextBand({ eyebrow, title, text, href, label, tone = 'forest' }) {
  return (
    <div className="container">
      <section className={`band is-${tone}`}>
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
          {text && <p className="band__text">{text}</p>}
        </div>
        <Button href={href} variant="light">
          {label}
        </Button>
      </section>
    </div>
  )
}

