import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { lifestyle } from '../../data/sections.js'
import { hasAsset } from '../../lib/assets.js'
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
// chỉ hiện khi có ảnh thật (từ 2 ảnh) — không dùng hình minh hoạ
const real = lifestyle.items.filter((it) => hasAsset(it.image))

export default function Lifestyle() {
  if (real.length < 2) return null
  const items = real.map((it, i) => ({ it, i }))
  const left = items.filter(({ i }) => i % 2 === 0)
  const right = items.filter(({ i }) => i % 2 === 1)
  return (
    <section data-scene="lifestyle" className="section lifestyle" aria-labelledby="life-title">
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
