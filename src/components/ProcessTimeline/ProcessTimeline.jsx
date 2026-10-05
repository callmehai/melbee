import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { process } from '../../data/sections.js'
import './ProcessTimeline.css'

export default function ProcessTimeline() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })

  return (
    <section id="quy-trinh" className="section process" aria-labelledby="process-title">
      <div className="container">
        <SectionHeading id="process-title" eyebrow={process.eyebrow} title={process.title} align="center" />
        <ol className="timeline" ref={ref}>
          <span className="timeline__track" aria-hidden="true">
            <motion.span className="timeline__fill" style={{ scaleY: reduced ? 1 : scaleY }} />
          </span>
          {process.steps.map((s, i) => (
            <li key={s.title} className={`step ${i % 2 ? 'is-right' : 'is-left'}`}>
              <span className="step__dot" aria-hidden="true" />
              <Reveal className="step__media" effect={i % 2 ? 'slide-left' : 'slide-right'} duration={1.1}>
                <Media src={s.image} alt={s.title} art={s.art} />
              </Reveal>
              <Reveal className="step__text" effect={i % 2 ? 'slide-right' : 'slide-left'} delay={0.12}>
                <span className="step__no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
