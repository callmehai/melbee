import { Shell, PageHead, HoneyCard, UsageInfo, Photo } from './common.jsx'
import Button from '../components/common/Button.jsx'
import { honeys, sizes, giftSet } from '../data/catalog.js'
import { hasAsset } from '../lib/assets.js'
import { page } from '../lib/site.js'

/**
 * /san-pham/ — đích của mã QR trên hộp quà.
 * Người quét cần nhận ra ngay lọ mình đang cầm: cả 4 loại trong một lưới, bấm vào là sang trang chi tiết.
 */
export default function ProductsPage() {
  return (
    <Shell current="products">
      <PageHead
        crumbs={[['Trang chủ', ''], ['Sản phẩm']]}
        title="Mật ong MelBee"
        sub="4 loại mật từ các trang trại ong vùng cao Tây Bắc · 100% mật ong nguyên chất."
      />

      <div className="container">
        <ul className="hgrid">
          {honeys.map((h) => (
            <li key={h.id}>
              <HoneyCard honey={h} sizes={sizes} />
            </li>
          ))}
        </ul>
      </div>

      <div className="container">
        <section className="giftband" aria-labelledby="giftband-title">
          <Photo
            src={hasAsset(giftSet.photo) ? giftSet.photo : giftSet.designFront}
            alt={`${giftSet.name} — mặt hộp`}
            className="giftband__img"
          />
          <div>
            <p className="eyebrow">Hộp quà</p>
            <h2 id="giftband-title">{giftSet.name}</h2>
            <p className="giftband__text">{giftSet.description}</p>
            <Button href={page('hop-qua/')} variant="light">
              Xem hộp quà
            </Button>
          </div>
        </section>
      </div>

      <UsageInfo />
    </Shell>
  )
}
