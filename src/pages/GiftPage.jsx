import { Shell, PageHead } from './common.jsx'
import GiftSet from '../components/GiftSet/GiftSet.jsx'
import Reveal from '../components/common/Reveal.jsx'
import { giftSet, giftMessage } from '../data/catalog.js'
import { asset } from '../lib/assets.js'

/** /hop-qua/ — hộp quà 2 · 3 · 4 lọ: chọn set (loại mật cố định), đặt; túi giấy đi kèm; lời gửi in trong nắp hộp. */
export default function GiftPage() {
  return (
    <Shell current="gift">
      <PageHead
        crumbs={[['Trang chủ', ''], ['Hộp quà']]}
        title="Hộp quà MelBee"
        sub="Hộp 2, 3 hoặc 4 lọ mật ong Tây Bắc, kèm túi giấy đồng bộ — để biếu, để tặng, để gửi một lời chúc."
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
            Túi giấy đồng bộ
          </h2>
          <p>
            Túi giấy nâu trầm, chữ MELBEE nhũ vàng nổi, hoạ tiết hoa và ong đồng bộ với nắp hộp, quai dây vàng. Mỗi hộp
            quà đi kèm một túi vừa vặn, đã gồm trong giá set.
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
            <p className="letter__intro">In ở mặt trong nắp mỗi hộp quà, trên nền vàng mật hoạ tiết tổ ong: mở hộp là người nhận đọc được ngay.</p>
          </Reveal>
          {/* nắp hộp: nền là file in đã xoá chữ (chữ in sẵn trong ảnh nhỏ, nhoè), lời gửi đặt lên bằng chữ thật → nét, đọc được, đổi lời không cần sửa ảnh */}
          <Reveal effect="slide-right" delay={0.1}>
            <figure className="lid" style={{ '--bg': `url("${asset(giftSet.designInsideBg)}")`, '--bg-tall': `url("${asset(giftSet.designInsideTall)}")` }}>
              <blockquote className="lid__text">
                {giftMessage.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </blockquote>
              <figcaption className="sr-only">Mặt trong nắp hộp quà MELBEE: lời gửi in trên nền vàng mật hoạ tiết tổ ong</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

    </Shell>
  )
}
