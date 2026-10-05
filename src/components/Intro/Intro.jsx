import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { THREE_CONFIG } from '../../three/config.js'
import { useThreeStatus } from '../../three/store.js'
import { intro } from '../../data/sections.js'
import './Intro.css'

/**
 * Sân khấu của miếng bánh tổ 3D (lớp Three.js vẽ đè lên đúng khung này và nghe chuột/chạm ở đây).
 * Nền là nắng sớm + vài bông hoa ban nhoè phía xa; dòng gợi ý tắt sau lần lắc đầu tiên.
 */
function CombStage() {
  const [played, setPlayed] = useState(false)
  return (
    <div
      className={`intro__stage ${played ? 'is-played' : ''}`}
      role="img"
      aria-label={intro.imageAlt}
      data-cursor="grab"
      data-cursor-label="Lắc"
      onPointerDown={() => setPlayed(true)}
    >
      <span className="intro__shadow" aria-hidden="true" />
      <span className="intro__hint" aria-hidden="true">
        <span className="intro__hint-mouse">Kéo để lắc</span>
        <span className="intro__hint-touch">Chạm để lắc</span>
      </span>
    </div>
  )
}

export default function Intro() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])
  // có WebGL → miếng bánh tổ 3D; không có → ảnh thật / tranh minh hoạ như cũ
  const three = useThreeStatus()
  const comb = THREE_CONFIG.enabled && THREE_CONFIG.effects.honeycomb && three !== 'unavailable'

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
            {comb ? <CombStage /> : <Media src={intro.image} alt={intro.imageAlt} art={intro.art} />}
          </Reveal>
          <span className="intro__hex" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  )
}
