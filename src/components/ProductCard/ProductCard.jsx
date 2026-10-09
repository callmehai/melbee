import { memo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Media from '../common/Media.jsx'
import OrderMenu from '../common/OrderMenu.jsx'
import { signalCardHover } from '../../three/signals.js'
import './ProductCard.css'

/**
 * Thẻ sản phẩm: không giỏ hàng — chỉ "Xem chi tiết" và "Nhắn tin đặt hàng".
 * feature: thẻ lớn nằm ngang (khi trang chỉ có một sản phẩm) — hiện thêm mô tả và hương vị.
 */
function ProductCard({ product, onOpen, feature = false, badge = false, lead }) {
  const meta = [
    product.size && ['Quy cách', product.size],
    product.price && ['Giá', product.price],
  ].filter(Boolean)
  return (
    <article
      className={`product-card ${feature ? 'is-feature' : ''}`}
      aria-labelledby={`p-${product.id}`}
      onMouseEnter={(e) => signalCardHover(e.currentTarget.querySelector('.product-card__visual'), true)}
      onMouseLeave={(e) => signalCardHover(e.currentTarget.querySelector('.product-card__visual'), false)}
    >
      <button type="button" className="product-card__visual" onClick={() => onOpen(product)} aria-label={`Xem chi tiết ${product.name}`} data-cursor="view">
        <Media
          src={product.image}
          alt={product.name}
          art="jar"
          artProps={{ tone: product.tone, name: product.name }}
        />
        {badge && <span className="product-card__badge">Nổi bật</span>}
      </button>

      <div className="product-card__body">
        {lead}
        <h3 id={`p-${product.id}`} className="product-card__name">
          {product.name}
        </h3>
        <p className="product-card__subtitle">{product.subtitle}</p>
        {feature && <p className="product-card__desc">{product.description}</p>}
        {feature && product.flavor?.length > 0 && (
          <ul className="product-card__tags" aria-label="Hương vị">
            {product.flavor.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
        {meta.length > 0 && (
          <dl className="product-card__meta">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="product-card__actions">
          {/* có trang thông tin riêng → đi thẳng tới đó; không thì mở cửa sổ chi tiết */}
          {product.detailsHref ? (
            <a className="arrow-link product-card__detail" href={product.detailsHref} data-cursor="cta">
              <span>Xem chi tiết</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ) : (
            <button type="button" className="arrow-link product-card__detail" onClick={() => onOpen(product)} data-cursor="cta">
              <span>Xem chi tiết</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          )}
          <OrderMenu size="sm" variant="outline" align="up" perch="top-right" facebook={product.facebookMessage !== false} zalo={product.zaloMessage !== false} />
        </div>
      </div>
    </article>
  )
}

export default memo(ProductCard)
