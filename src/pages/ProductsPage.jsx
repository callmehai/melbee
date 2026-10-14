import { Shell, PageHead, HoneyCard, UsageInfo, Photo } from './common.jsx'
import Button from '../components/common/Button.jsx'
import { honeys, giftBoxes, giftBoxFee } from '../data/catalog.js'
import { page } from '../lib/site.js'
import Reveal from '../components/common/Reveal.jsx'

/**
 * /san-pham/ — đích của mã QR trên hộp quà.
 * Người quét cần nhận ra ngay lọ mình đang cầm: cả 4 loại mật + bánh tổ trong một lưới, bấm vào là sang trang chi tiết.
 */
/** Giá set rẻ nhất trong bảng giá (Set 2) */
const setFrom = () => `${Math.min(...giftBoxes.map((b) => b.price)).toLocaleString('vi-VN')} ₫`

export default function ProductsPage() {
  return (
    <Shell current="products">
      <PageHead
        crumbs={[['Trang chủ', ''], ['Sản phẩm']]}
        title="Mật ong MelBee"
        sub="Bốn loại mật và bánh tổ hoa ban từ các trang trại ong vùng cao Tây Bắc · 100% mật ong nguyên chất."
      />

      <div className="container">
        <ul className="hgrid" style={{ '--cols': honeys.length }}>
          {honeys.map((h, i) => (
            <Reveal as="li" key={h.id} delay={i * 0.08}>
              <HoneyCard honey={h} />
            </Reveal>
          ))}
        </ul>
      </div>

      <div className="container">
        <Reveal as="section" className="giftband" aria-labelledby="giftband-title">
          <Photo src={giftBoxes[0].photo} alt={`${giftBoxes[0].name} MelBee`} className="giftband__img" />
          <div>
            <p className="eyebrow">Hộp quà</p>
            <h2 id="giftband-title">Hộp quà 2 · 3 · 4 lọ</h2>
            <p className="giftband__text">
              Hộp cứng nâu trầm chữ nhũ vàng, kèm túi giấy đồng bộ. Các set 2 · 3 · 4 lọ từ {setFrom()}, hoặc tự chọn
              loại mật cho từng lọ với giá các lọ cộng {giftBoxFee.toLocaleString('vi-VN')} ₫ hộp và túi.
            </p>
            <Button href={page('hop-qua/')} variant="light">
              Xem hộp quà
            </Button>
          </div>
        </Reveal>
      </div>

      <UsageInfo />
    </Shell>
  )
}
