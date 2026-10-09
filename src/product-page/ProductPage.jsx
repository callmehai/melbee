import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react'
import Button, { FacebookButton, ZaloButton } from '../components/common/Button.jsx'
import { brand } from '../config/brand.js'
import { honeys, sizes, giftMessage, commonInfo, company } from '../data/catalog.js'
import './ProductPage.css'

// trang nằm ở /san-pham/ → file trong public/ ở thư mục cha
const root = (p) => '../' + p

/**
 * Trang thông tin sản phẩm — đích của mã QR in trên hộp quà.
 * Người quét là người cầm hộp trên tay: mở nhanh trên điện thoại, đọc được ngay, không hiệu ứng nặng.
 */
export default function ProductPage() {
  return (
    <>
      <header className="pp-bar">
        <a className="pp-bar__brand" href={root('')}>
          <img src={root(brand.logo)} alt="" width="36" height="36" />
          <span>
            <b>{brand.shortName}</b>
            <small>{brand.name}</small>
          </span>
        </a>
        <a className="pp-bar__home" href={root('')}>
          <ArrowLeft size={16} aria-hidden="true" />
          Trang chủ
        </a>
      </header>

      <main>
        <section className="pp-hero">
          <div className="pp-wrap pp-hero__inner">
            <div className="pp-hero__text">
              <p className="pp-eyebrow">MelBee Specialty Honey</p>
              <h1>Mật ngọt từ hoa, tinh hoa từ rừng</h1>
              <p className="pp-hero__lead">100% mật ong nguyên chất từ các trang trại ong vùng cao Tây Bắc. Chọn loại mật bạn đang cầm trên tay:</p>
              <nav className="pp-jump" aria-label="Các loại mật">
                <ul>
                  {honeys.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`}>
                        <i style={{ background: h.color }} aria-hidden="true" />
                        {h.name.replace('Mật ong ', '')}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <img className="pp-hero__img" src={root('assets/images/products/honey-01.jpg')} alt="Hũ mật ong MelBee" width="1122" height="1402" />
          </div>
        </section>

        <div className="pp-wrap pp-list">
          {honeys.map((h, i) => (
            <article key={h.id} id={h.id} className="pp-honey" style={{ '--c': h.color }}>
              <div className="pp-honey__head">
                <div>
                  <p className="pp-honey__no">0{i + 1}</p>
                  <h2>{h.name}</h2>
                  <p className="pp-honey__en" lang="en">
                    {h.nameEn}
                  </p>
                </div>
              </div>
              <p className="pp-honey__desc">{h.description}</p>
              <ul className="pp-chips">
                {h.traits.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <ul className="pp-honey__hl">
                {h.highlights.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="pp-honey__meta">
                100% nguyên chất · Thể tích thực {sizes.join(' / ')}
              </p>
            </article>
          ))}
        </div>

        <section className="pp-info" aria-labelledby="pp-info-title">
          <div className="pp-wrap">
            <h2 id="pp-info-title">Thông tin sản phẩm</h2>
            <p className="pp-info__sub">Áp dụng cho cả 4 loại mật MelBee.</p>
            <dl className="pp-info__grid">
              <div>
                <dt>Thành phần</dt>
                <dd>{commonInfo.ingredients}</dd>
              </div>
              <div>
                <dt>Hướng dẫn sử dụng</dt>
                <dd>
                  <ul>
                    {commonInfo.usage.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
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
                <dt>Hạn sử dụng · Xuất xứ</dt>
                <dd>
                  {commonInfo.shelfLife}
                  <br />
                  Xuất xứ: {commonInfo.origin}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="pp-wrap pp-letter" aria-label="Lời gửi từ MelBee">
          <p className="pp-eyebrow">Lời gửi từ MelBee</p>
          {giftMessage.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </section>

        <section className="pp-wrap pp-contact" aria-labelledby="pp-contact-title">
          <h2 id="pp-contact-title">Đặt mua &amp; tư vấn</h2>
          <p>Nhắn tin cho MelBee để đặt thêm mật, đặt hộp quà hoặc hỏi về sản phẩm.</p>
          <div className="pp-contact__btns">
            <ZaloButton />
            <FacebookButton />
            <Button href={`tel:${company.hotline}`} variant="outline" icon={<Phone size={18} aria-hidden="true" />}>
              Gọi {company.hotlineDisplay}
            </Button>
          </div>
        </section>
      </main>

      <footer className="pp-foot">
        <div className="pp-wrap">
          <p className="pp-foot__name">
            {company.name} <span>· {company.nameEn}</span>
          </p>
          <ul>
            <li>
              <MapPin size={15} aria-hidden="true" /> {company.address}
            </li>
            <li>
              <Phone size={15} aria-hidden="true" /> <a href={`tel:${company.hotline}`}>{company.hotlineDisplay}</a>
            </li>
            <li>
              <Mail size={15} aria-hidden="true" /> <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
          </ul>
          <a className="pp-foot__home" href={root('')}>
            Khám phá câu chuyện MelBee →
          </a>
        </div>
      </footer>
    </>
  )
}
