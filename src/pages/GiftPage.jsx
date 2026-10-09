import { Shell, PageHead } from './common.jsx'
import GiftSet from '../components/GiftSet/GiftSet.jsx'
import Reveal from '../components/common/Reveal.jsx'
import { giftSet, giftMessage } from '../data/catalog.js'
import { asset } from '../lib/assets.js'

/** /hop-qua/ — set quà: hộp 3D + chọn 2 lọ mật + đặt; lời gửi in trong nắp hộp. */
export default function GiftPage() {
  return (
    <Shell current="gift">
      <PageHead
        crumbs={[['Trang chủ', ''], ['Hộp quà']]}
        title="Hộp quà MelBee"
        sub="Mật ong Tây Bắc trong hộp quà chỉn chu — để biếu, để tặng, để gửi một lời chúc."
      />

      <div className="container gift-main">
        <GiftSet />
      </div>

      <section className="letter" aria-labelledby="letter-title">
        <div className="container letter__in">
          <Reveal className="letter__text">
            <p className="eyebrow">Mở nắp hộp</p>
            <h2 id="letter-title" className="sp-h2">
              Lời gửi từ núi rừng
            </h2>
            {giftMessage.map((p) => (
              <p key={p.slice(0, 24)} className="letter__p">
                {p}
              </p>
            ))}
          </Reveal>
          <Reveal effect="slide-right" delay={0.1}>
            <img className="letter__img" src={asset(giftSet.designInside)} alt="Mặt trong nắp hộp: lời gửi in trên nền vàng mật hoạ tiết tổ ong" loading="lazy" width="1386" height="935" />
          </Reveal>
        </div>
      </section>

    </Shell>
  )
}
