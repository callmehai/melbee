import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { intro } from '../../data/sections.js'
import './Intro.css'

export default function Intro() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <section id="gioi-thieu" data-scene="honey" ref={ref} className="section intro" aria-labelledby="intro-title">
      <div className="container intro__grid">
        <div className="intro__text">
          <Reveal as="h2" id="intro-title" className="intro__title" delay={0.1} duration={1.1}>
            {intro.title.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </Reveal>
          <div className="intro__body">
            {intro.paragraphs.map((p, i) => (
              <Reveal as="p" key={i} delay={0.15 + i * 0.1} className={i === 0 ? 'lead' : ''}>
                {p}
              </Reveal>
            ))}
          </div>
        </div>
        <motion.div className="intro__visual" style={reduced ? undefined : { y }}>
          <Reveal effect="scale" duration={1.2} className="intro__frame">
            <Media src={intro.image} alt={intro.imageAlt} art={intro.art} />
          </Reveal>
        </motion.div>
      </div>
    </section>
  )
}
