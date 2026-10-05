import { Flower, HeartHandshake, Leaf, Mountain } from 'lucide-react'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { useThreeStatus } from '../../three/store.js'
import { origin } from '../../data/sections.js'
import './OriginSection.css'

const ICONS = { mountain: Mountain, leaf: Leaf, flower: Flower, 'heart-handshake': HeartHandshake }

export default function OriginSection() {
  const three = useThreeStatus()
  return (
    <section id="nguon-goc" data-scene="origin" className="section origin" aria-labelledby="origin-title">
      <div className="container">
        <div className="origin__top">
          <div>
            <SectionHeading id="origin-title" eyebrow={origin.eyebrow} title={origin.title} />
            <Reveal as="p" className="origin__lead" delay={0.1}>
              {origin.lead.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </Reveal>
            <Reveal as="p" className="origin__text" delay={0.2}>
              {origin.text}
            </Reveal>
          </div>
          <Reveal as="figure" effect="scale" duration={1.2} className="origin__photo" data-bee-perch="top-right" data-bee-glow="off">
            <Media src={origin.image} alt={origin.imageAlt} art={origin.art} />
            <figcaption>{origin.imageAlt}</figcaption>
          </Reveal>
        </div>

        <ul className="origin__highlights">
          {origin.highlights.map((h, i) => {
            const Icon = ICONS[h.icon] || Leaf
            return (
              <Reveal as="li" key={h.title} delay={i * 0.1}>
                <Icon size={26} strokeWidth={1.3} aria-hidden="true" />
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </Reveal>
            )
          })}
        </ul>
      </div>
      {/* đồng hoa: núi xa, sương, hoa và đàn ong do lớp Three.js vẽ vào khoảng này */}
      <div className={`origin__meadow ${three === 'running' ? 'is-live' : ''}`} aria-hidden="true" />
    </section>
  )
}
