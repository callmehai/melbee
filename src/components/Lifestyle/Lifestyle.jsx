import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { lifestyle } from '../../data/sections.js'
import './Lifestyle.css'

export default function Lifestyle() {
  return (
    <section className="section lifestyle" aria-labelledby="life-title">
      <div className="container">
        <SectionHeading id="life-title" eyebrow={lifestyle.eyebrow} title={lifestyle.title} />
        <ul className="life__grid">
          {lifestyle.items.map((it, i) => (
            <Reveal as="li" key={it.title} className={`life__item life__item--${i + 1}`} delay={(i % 2) * 0.12} effect="fade-up">
              <figure>
                <div className="life__media" data-cursor="view">
                  <Media src={it.image} alt={it.title} art={it.art} />
                </div>
                <figcaption>
                  <span className="life__no">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <b>{it.title}</b>
                    <small>{it.text}</small>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
