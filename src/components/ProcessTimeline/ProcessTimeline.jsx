import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { process } from '../../data/sections.js'
import './ProcessTimeline.css'

/**
 * 5 bước so le hai bên MỘT dòng mật chảy dọc giữa trang (điện thoại: dòng mật bên trái).
 * Dòng mật đầy dần theo cuộn, giọt mật ở đầu dòng chạy theo; bước nào mật chảy tới thì sáng lên.
 */
export default function ProcessTimeline() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 75%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.5 })
  const n = process.steps.length

  return (
    <section id="quy-trinh" data-scene="process" className="section process" aria-labelledby="process-title">
      <div className="container">
        <SectionHeading id="process-title" eyebrow={process.eyebrow} title={process.title} align="center" />
        <motion.ol className="timeline" ref={ref} style={{ '--p': reduced ? 1 : progress }}>
          <span className="timeline__track" aria-hidden="true">
            <span className="timeline__fill" />
            <span className="timeline__bead" />
          </span>
          {process.steps.map((s, i) => (
            <li key={s.title} className={`step ${i % 2 ? 'is-right' : 'is-left'}`} style={{ '--i': (i + 0.5) / n }}>
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
        </motion.ol>
      </div>
    </section>
  )
}
