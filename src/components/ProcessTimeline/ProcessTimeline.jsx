import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import { process } from '../../data/sections.js'
import './ProcessTimeline.css'

/**
 * 5 bước nối nhau bằng MỘT nét mật liền, sánh, đầy dần theo cuộn (ngang trên máy tính, dọc trên điện thoại).
 * Giọt mật ở đầu nét chạy theo tiến độ; bước nào mật chảy tới thì sáng lên.
 */
export default function ProcessTimeline() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.5 })

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
            <Reveal as="li" key={s.title} className="step" style={{ '--i': i / (process.steps.length - 1) }} delay={i * 0.08}>
              <span className="step__dot" aria-hidden="true" />
              <span className="step__no">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
