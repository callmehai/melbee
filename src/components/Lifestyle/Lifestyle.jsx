import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { lifestyle } from '../../data/sections.js'
import './Lifestyle.css'

function Item({ it, i }) {
  return (
    <Reveal as="li" className={`life__item life__item--${i + 1}`} delay={(i % 2) * 0.12}>
      <figure>
        <div className="life__media">
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
  )
}

/** Bố cục tạp chí: 2 cột độc lập, cột phải lệch xuống — không phần tử nào chồng lên chữ. */
export default function Lifestyle() {
  const items = lifestyle.items.map((it, i) => ({ it, i }))
  const left = items.filter(({ i }) => i % 2 === 0)
  const right = items.filter(({ i }) => i % 2 === 1)
  return (
    <section className="section lifestyle" aria-labelledby="life-title">
      <div className="container">
        <SectionHeading id="life-title" eyebrow={lifestyle.eyebrow} title={lifestyle.title} />
        <div className="life__grid">
          <ul className="life__col">
            {left.map(({ it, i }) => (
              <Item key={it.title} it={it} i={i} />
            ))}
          </ul>
          <ul className="life__col life__col--offset">
            {right.map(({ it, i }) => (
              <Item key={it.title} it={it} i={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
