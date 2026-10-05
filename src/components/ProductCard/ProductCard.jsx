import { memo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Media from '../common/Media.jsx'
import OrderMenu from '../common/OrderMenu.jsx'
import { signalCardHover } from '../../three/signals.js'
import './ProductCard.css'

/** Thẻ sản phẩm: không giỏ hàng — chỉ "Xem chi tiết" và "Nhắn tin đặt hàng". */
function ProductCard({ product, onOpen, index = 0 }) {
  return (
    <article
      className="product-card"
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
          tag="Ảnh sản phẩm đang cập nhật"
        />
        <span className="product-card__overlay" aria-hidden="true">
          <span>
            Xem chi tiết <ArrowUpRight size={15} />
          </span>
        </span>
        {product.featured && <span className="product-card__badge">Nổi bật</span>}
        <span className="product-card__no" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </button>

      <div className="product-card__body">
        <h3 id={`p-${product.id}`} className="product-card__name">
          {product.name}
        </h3>
        <p className="product-card__subtitle">{product.subtitle}</p>
        <dl className="product-card__meta">
          {product.size && (
            <div>
              <dt>Quy cách</dt>
              <dd>{product.size}</dd>
            </div>
          )}
          {product.price && (
            <div>
              <dt>Giá</dt>
              <dd>{product.price}</dd>
            </div>
          )}
        </dl>
        <div className="product-card__actions">
          <button type="button" className="arrow-link product-card__detail" onClick={() => onOpen(product)} data-cursor="cta">
            <span>Xem chi tiết</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          <OrderMenu size="sm" variant="outline" align="up" facebook={product.facebookMessage !== false} zalo={product.zaloMessage !== false} />
        </div>
      </div>
    </article>
  )
}

export default memo(ProductCard)
