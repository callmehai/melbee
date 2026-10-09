import { Check } from 'lucide-react'
import { Shell, PageHead, Photo, OrderButtons, NextBand } from './common.jsx'
import { giftSet, giftMessage, honeys } from '../data/catalog.js'
import { asset, hasAsset } from '../lib/assets.js'
import { page } from '../lib/site.js'

/** /hop-qua/ — set quà: trong hộp có gì, hộp trông ra sao, lời gửi bên trong, đặt thế nào. */
export default function GiftPage() {
  const hasPhoto = hasAsset(giftSet.photo)
  return (
    <Shell current="gift">
      <PageHead
        crumbs={[['Trang chủ', ''], ['Hộp quà']]}
        title="Hộp quà MelBee"
        sub="Mật ong Tây Bắc trong hộp quà chỉn chu — để biếu, để tặng, để gửi một lời chúc."
      />

      <div className="container gift-main">
        <figure className="gift-main__fig">
          <Photo src={hasPhoto ? giftSet.photo : giftSet.designFront} alt={`${giftSet.name} — mặt hộp`} className="gift-main__photo" eager />
          {!hasPhoto && <figcaption>Bản thiết kế mặt hộp · ảnh chụp sắp ra mắt</figcaption>}
        </figure>

        <div className="gift-main__info">
          <p className="eyebrow">Set quà</p>
          <h2 className="gift-main__name">{giftSet.name}</h2>
          <p className="detail__desc">{giftSet.description}</p>

          <h3 className="sp-h3">Trong hộp có</h3>
          <ul className="checks">
            {giftSet.contents.map((t) => (
              <li key={t}>
                <Check size={16} aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>

          <h3 className="sp-h3">Loại mật</h3>
          <p className="gift-main__honeys">
            {honeys.map((h, i) => (
              <span key={h.id}>
                <a href={page(`san-pham/${h.id}/`)}>{h.short}</a>
                {i < honeys.length - 1 && ' · '}
              </span>
            ))}
            <br />
            <small>Nhắn MelBee để được tư vấn loại mật trong set.</small>
          </p>

          <p className="price">
            <b>{giftSet.price || 'Liên hệ'}</b>
          </p>
          <OrderButtons zaloLabel="Nhắn Zalo đặt hộp quà" />
        </div>
      </div>

      <section className="letter" aria-labelledby="letter-title">
        <div className="container letter__in">
          <div className="letter__text">
            <p className="eyebrow">Mở nắp hộp</p>
            <h2 id="letter-title" className="sp-h2">
              Lời gửi từ núi rừng
            </h2>
            {giftMessage.map((p) => (
              <p key={p.slice(0, 24)} className="letter__p">
                {p}
              </p>
            ))}
          </div>
          <img className="letter__img" src={asset(giftSet.designInside)} alt="Mặt trong nắp hộp: lời gửi in trên nền vàng mật hoạ tiết tổ ong" loading="lazy" width="1386" height="935" />
        </div>
      </section>

      <NextBand
        eyebrow="Tự chọn hộp quà"
        title="Muốn một hộp theo ý mình?"
        text="Chọn kiểu hộp, màu hộp, loại mật và vài dòng trên thiệp ở trang chủ, rồi gửi mẫu cho MelBee qua tin nhắn."
        href={page('#hop-qua')}
        label="Gói thử hộp quà"
      />
    </Shell>
  )
}
