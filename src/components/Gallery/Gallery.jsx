import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import Lightbox from '../Lightbox/Lightbox.jsx'
import { gallery } from '../../data/sections.js'
import './Gallery.css'

export default function Gallery() {
  const [index, setIndex] = useState(null)
  const items = gallery.items

  return (
    <section className="section section--cream gallery" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHeading id="gallery-title" eyebrow={gallery.eyebrow} title={gallery.title} align="center" />
        <ul className="gallery__grid">
          {items.map((it, i) => (
            <Reveal as="li" key={i} className={`gallery__cell is-${it.size || 'normal'}`} delay={(i % 4) * 0.08} effect="scale">
              <button type="button" className="gallery__btn" onClick={() => setIndex(i)} aria-label={`Xem ảnh: ${it.caption || it.alt}`} data-cursor="view">
                <Media src={it.image} alt={it.alt} art={it.art} />
                <span className="gallery__cap">{it.caption}</span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
      <AnimatePresence>{index !== null && <Lightbox items={items} index={index} onChange={setIndex} onClose={() => setIndex(null)} />}</AnimatePresence>
    </section>
  )
}
