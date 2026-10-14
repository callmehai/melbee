import { Shell, PageHead } from './common.jsx'
import GiftSet from '../components/GiftSet/GiftSet.jsx'
import Reveal from '../components/common/Reveal.jsx'
import { giftSet, giftMessage } from '../data/catalog.js'
import { asset } from '../lib/assets.js'

/** /hop-qua/ — hộp quà 2 · 3 · 4 lọ: chọn hộp, chọn mật từng ô, đặt; túi giấy đi kèm; lời gửi in trong nắp hộp. */
export default function GiftPage() {
  return (
    <Shell current="gift">
      <PageHead
        crumbs={[['Trang chủ', ''], ['Hộp quà']]}
        title="Hộp quà MelBee"
        sub="Hộp 2, 3 hoặc 4 lọ mật ong Tây Bắc, kèm túi giấy cùng bộ — để biếu, để tặng, để gửi một lời chúc."
      />

      <div className="container gift-main">
        <GiftSet />
      </div>

      <section className="container bag" aria-labelledby="bag-title">
        <Reveal className="bag__photo">
          <img src={asset(giftSet.bag)} alt="Túi giấy MELBEE màu nâu, chữ nhũ vàng, hoa và ong vẽ nét vàng, quai dây vàng" loading="lazy" width="1000" height="872" />
        </Reveal>
        <Reveal className="bag__text" delay={0.1}>
          <p className="eyebrow">Đi kèm mỗi hộp</p>
          <h2 id="bag-title" className="sp-h2">
            Túi giấy cùng bộ
          </h2>
          <p>
            Túi nâu trầm, chữ MELBEE nhũ vàng nổi, hoa và ong vẽ nét vàng như trên nắp hộp, quai dây vàng. Túi vừa cỡ từng
            hộp, đã tính trong 100.000 ₫ tiền hộp và túi.
          </p>
        </Reveal>
      </section>

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
