import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import ProductCard from '../ProductCard/ProductCard.jsx'
import ProductModal from '../ProductModal/ProductModal.jsx'
import { products } from '../../data/products.js'
import { productsSection } from '../../data/sections.js'
import './ProductShowcase.css'

export default function ProductShowcase() {
  const [active, setActive] = useState(null)

  return (
    <section id="san-pham" className="section section--cream products" aria-labelledby="products-title">
      <div className="container">
        <div className="products__head">
          <SectionHeading id="products-title" eyebrow={productsSection.eyebrow} title={productsSection.title} subtitle={productsSection.subtitle} />
        </div>
        <ul className="products__grid">
          {products.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 4) * 0.1}>
              <ProductCard product={p} index={i} onOpen={setActive} />
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
