import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import ProductCard from '../ProductCard/ProductCard.jsx'
import ProductModal from '../ProductModal/ProductModal.jsx'
import { products } from '../../data/products.js'
import { productsSection } from '../../data/sections.js'
import { hasAsset } from '../../lib/assets.js'
import './ProductShowcase.css'

// chỉ sản phẩm đã có ảnh thật — hũ minh hoạ làm cả hàng trông như bản nháp
const shown = products.filter((p) => hasAsset(p.image))

export default function ProductShowcase() {
  const [active, setActive] = useState(null)
  if (!shown.length) return null
  const single = shown.length === 1

  return (
    <section
      id="san-pham"
      data-scene="products"
      className={`section products ${single ? 'is-single' : ''}`}
      aria-labelledby={single ? `p-${shown[0].id}` : 'products-title'}
    >
      <div className="container">
        {/* một sản phẩm: bỏ tiêu đề lớn, tên sản phẩm là tiêu đề → cả hũ mật nằm trọn trong một màn hình */}
        {!single && (
          <div className="products__head">
            <SectionHeading id="products-title" eyebrow={productsSection.eyebrow} title={productsSection.title} subtitle={productsSection.subtitle} />
          </div>
        )}
        <ul className={`products__grid ${single ? 'is-single' : ''}`}>
          {shown.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 4) * 0.1}>
              <ProductCard
                product={p}
                onOpen={setActive}
                feature={single}
                badge={!single && p.featured}
                lead={single && <p className="eyebrow">{productsSection.eyebrow}</p>}
              />
            </Reveal>
          ))}
        </ul>
        <Reveal as="p" className="products__note">
          {productsSection.note}
        </Reveal>
      </div>
      <AnimatePresence>{active && <ProductModal key={active.id} product={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </section>
  )
}
