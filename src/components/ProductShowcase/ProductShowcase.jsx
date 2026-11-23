import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import { ArrowLink } from '../common/Button.jsx'
import { HoneyCard } from '../../pages/common.jsx'
import { honeys } from '../../data/catalog.js'
import { productsSection } from '../../data/sections.js'
import { page } from '../../lib/site.js'
import './ProductShowcase.css'

/**
 * Khối Sản phẩm trang chủ: đủ 5 loại mật + bánh tổ bằng đúng thẻ, đúng ảnh lọ của trang Sản phẩm.
 * Trước đây là một thẻ lớn dùng ảnh lọ nhãn kem kiểu khác (honey-01.jpg) → khách thấy hai bộ nhãn, nhận diện lệch nhau.
 */
export default function ProductShowcase() {
  return (
    <section id="san-pham" data-scene="products" className="section products" aria-labelledby="products-title">
      <div className="container">
        <div className="products__head">
          <SectionHeading id="products-title" eyebrow={productsSection.eyebrow} title={productsSection.title} subtitle={productsSection.subtitle} />
        </div>
        <ul className="hgrid products__honeys" style={{ '--cols': honeys.length }}>
          {honeys.map((h, i) => (
            <Reveal as="li" key={h.id} delay={(i % 6) * 0.07}>
              <HoneyCard honey={h} />
            </Reveal>
          ))}
        </ul>
        <Reveal className="products__foot">
          <p className="products__note">{productsSection.note}</p>
          <ArrowLink href={page('san-pham/')}>Xem chi tiết các loại mật</ArrowLink>
        </Reveal>
      </div>
    </section>
  )
}
