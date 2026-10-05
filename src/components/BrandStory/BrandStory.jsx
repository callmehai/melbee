import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { story } from '../../data/sections.js'
import { brand } from '../../config/brand.js'
import './BrandStory.css'

export default function BrandStory() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section id="cau-chuyen" ref={ref} className="section story" aria-labelledby="story-title">
      <div className="container story__grid">
        <div className="story__text">
          <SectionHeading id="story-title" eyebrow={story.eyebrow} title={story.title} />
          <div className="story__body">
            {story.paragraphs.map((p, i) => (
              <Reveal as="p" key={i} delay={0.1 * i} className={i === story.paragraphs.length - 1 ? 'story__last' : ''}>
                {p}
              </Reveal>
            ))}
          </div>
          <Reveal as="p" className="story__sign" delay={0.3}>
            — {brand.shortName}
          </Reveal>
        </div>
        <Reveal effect="slide-right" duration={1.2} className="story__visual">
          <motion.div className="story__parallax" style={reduced ? undefined : { y }}>
            <Media src={story.image} alt={story.imageAlt} art={story.art} />
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}
