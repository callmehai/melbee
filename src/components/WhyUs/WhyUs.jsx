import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import { whyUs } from '../../data/sections.js'
import './WhyUs.css'

export default function WhyUs() {
  return (
    <section data-scene="values" className="section section--cream why" aria-labelledby="why-title">
      <div className="container why__grid">
        <div className="why__head">
          <SectionHeading id="why-title" eyebrow={whyUs.eyebrow} title={whyUs.title} />
        </div>
        <ol className="why__list">
          {whyUs.items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i * 0.1}>
              <span className="why__no">{String(i + 1).padStart(2, '0')}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
