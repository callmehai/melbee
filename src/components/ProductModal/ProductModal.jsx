import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Media from '../common/Media.jsx'
import { ArrowLink, FacebookButton, ZaloButton } from '../common/Button.jsx'
import { useDialog } from '../common/useDialog.js'
import './ProductModal.css'

/** Chi tiết sản phẩm — modal. Không có "thêm vào giỏ": đặt hàng qua Facebook / Zalo. */
export default function ProductModal({ product, onClose }) {
  const ref = useDialog(onClose)
  const titleId = `modal-${product.id}`

  return (
    <motion.div className="pmodal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onClick={onClose}>
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="pmodal__panel"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="pmodal__close" onClick={onClose} aria-label="Đóng chi tiết sản phẩm" data-autofocus>
          <X size={22} />
        </button>

        <div className="pmodal__visual">
          <Media src={product.image} alt={product.name} art="jar" artProps={{ tone: product.tone, name: product.name }} eager tag="Ảnh sản phẩm đang cập nhật" />
        </div>

        <div className="pmodal__content">
          <p className="eyebrow">{product.subtitle}</p>
          <h2 id={titleId} className="pmodal__title">
            {product.name}
          </h2>

          {(product.size || product.price) && (
            <dl className="pmodal__facts">
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
          )}

          <p className="pmodal__desc">{product.description}</p>

          {product.origin && (
            <section className="pmodal__block">
              <h3>Nguồn gốc</h3>
              <p>{product.origin}</p>
            </section>
          )}
          {product.flavor?.length > 0 && (
            <section className="pmodal__block">
              <h3>Hương vị &amp; đặc điểm</h3>
              <ul className="pmodal__chips">
                {product.flavor.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}
          {product.usage?.length > 0 && (
            <section className="pmodal__block">
              <h3>Cách sử dụng</h3>
              <ul className="pmodal__list">
                {product.usage.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}

          {product.detailsHref && (
            <p className="pmodal__more">
              <ArrowLink href={product.detailsHref}>Thành phần, cách dùng, bảo quản</ArrowLink>
            </p>
          )}

          <div className="pmodal__cta">
            <p>Nhắn tin để đặt hàng hoặc được tư vấn:</p>
            <div>
              {product.facebookMessage !== false && <FacebookButton />}
              {product.zaloMessage !== false && <ZaloButton />}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
