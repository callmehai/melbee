import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import SectionHeading from '../common/SectionHeading.jsx'
import { testimonials } from '../../data/testimonials.js'
import { testimonialsSection } from '../../data/sections.js'
import './Testimonials.css'

export default function Testimonials() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()
  const n = testimonials.length
  const go = useCallback((d) => setI((v) => (v + d + n) % n), [n])

  useEffect(() => {
    if (paused || reduced || n < 2) return
    const t = setInterval(() => go(1), 6500)
    return () => clearInterval(t)
  }, [paused, reduced, n, go])

  if (!n) return null
  const t = testimonials[i]

  return (
    <section data-scene="testimonials" className="section testimonials" aria-labelledby="t-title">
      <div className="container">
        <SectionHeading id="t-title" eyebrow={testimonialsSection.eyebrow} title={testimonialsSection.title} align="center" />
        <div
          className="tslider"
          role="region"
          aria-roledescription="carousel"
          aria-label="Chia sẻ của khách hàng"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <Quote className="tslider__mark" size={44} strokeWidth={1} aria-hidden="true" />
          <div className="tslider__viewport" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.figure
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: [0.22, 0.8, 0.24, 1] }}
              >
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <b>{t.name}</b>
                  {t.role && <span>{t.role}</span>}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          {n > 1 && (
            <div className="tslider__controls">
              <button type="button" onClick={() => go(-1)} aria-label="Chia sẻ trước">
                <ChevronLeft size={20} />
              </button>
              <div className="tslider__dots">
                {testimonials.map((x, k) => (
                  <button key={x.id} type="button" className={k === i ? 'is-active' : ''} onClick={() => setI(k)} aria-label={`Chia sẻ ${k + 1}`} aria-current={k === i ? 'true' : undefined} />
                ))}
              </div>
              <button type="button" onClick={() => go(1)} aria-label="Chia sẻ sau">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
