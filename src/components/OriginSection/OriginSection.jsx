import { Flower, HeartHandshake, Leaf, Mountain } from 'lucide-react'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { origin } from '../../data/sections.js'
import './OriginSection.css'

const ICONS = { mountain: Mountain, leaf: Leaf, flower: Flower, 'heart-handshake': HeartHandshake }

export default function OriginSection() {
  return (
    <section id="nguon-goc" data-scene="origin" className="section section--forest origin" aria-labelledby="origin-title">
      <div className="origin__contours" aria-hidden="true" />
      <div className="container">
        <div className="origin__top">
          <div>
            <SectionHeading id="origin-title" eyebrow={origin.eyebrow} title={origin.title} light />
            <Reveal as="p" className="origin__lead" delay={0.1}>
              {origin.lead.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </Reveal>
            <Reveal as="p" className="origin__text" delay={0.2}>
              {origin.text}
            </Reveal>
          </div>
          <Reveal effect="scale" duration={1.2} className="origin__map">
            <Media src={origin.image} alt={origin.imageAlt} art={origin.art} />
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

        <ul className="origin__photos">
          {origin.photos.map((p, i) => (
            <Reveal as="li" key={i} delay={i * 0.12} effect="fade-up">
              <Media src={p.image} alt={p.alt} art={p.art} />
              <span>{p.alt}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
