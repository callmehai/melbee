import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { whyUs } from '../../data/sections.js'
import './WhyUs.css'

/**
 * Nền nâu trầm nhũ vàng — đúng màu hộp quà — phá nhịp giữa các phần nền sáng.
 * Bên trái là chính nắp hộp quà (bản in thật), bên phải bốn điều MelBee giữ.
 */
export default function WhyUs() {
  return (
    <section data-scene="values" className="section why" aria-labelledby="why-title">
      <div className="container why__grid">
        <Reveal as="figure" effect="scale" duration={1.2} className="why__visual">
          <Media src={whyUs.image} alt={whyUs.imageAlt} art="gift" position="50% 42%" />
          <figcaption>{whyUs.imageCaption}</figcaption>
        </Reveal>
        <div className="why__body">
          <SectionHeading id="why-title" eyebrow={whyUs.eyebrow} title={whyUs.title} light />
          <ol className="why__list">
            {whyUs.items.map((it, i) => (
              <Reveal as="li" key={it.title} delay={i * 0.1}>
                <span className="why__no" data-bee-perch="top-right" data-bee-glow="off">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
