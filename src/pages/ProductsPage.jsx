import { Shell, PageHead, HoneyCard, UsageInfo } from './common.jsx'
import GiftBand from '../components/GiftBand/GiftBand.jsx'
import { honeys } from '../data/catalog.js'
import Reveal from '../components/common/Reveal.jsx'

/**
 * /san-pham/ — đích của mã QR trên hộp quà.
 * Người quét cần nhận ra ngay lọ mình đang cầm: cả 5 loại mật + bánh tổ trong một lưới, bấm vào là sang trang chi tiết.
 */
export default function ProductsPage() {
  return (
    <Shell current="products">
      <PageHead
        crumbs={[['Trang chủ', ''], ['Sản phẩm']]}
        title="Mật ong MelBee"
        sub="Năm loại mật và bánh tổ hoa ban từ các trang trại ong vùng cao Tây Bắc · 100% mật ong nguyên chất."
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
        <Reveal>
          <GiftBand />
        </Reveal>
      </div>

      <UsageInfo />
    </Shell>
  )
}
