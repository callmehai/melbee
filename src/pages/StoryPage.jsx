import { Flower2, HeartHandshake, Leaf, Mountain } from 'lucide-react'
import { Shell, PageHead, Photo, NextBand } from './common.jsx'
import { story, origin, process, whyUs } from '../data/sections.js'
import { page } from '../lib/site.js'
import Reveal from '../components/common/Reveal.jsx'

const ICONS = { mountain: Mountain, leaf: Leaf, flower: Flower2, 'heart-handshake': HeartHandshake }

/** /cau-chuyen/ — đọc liền một mạch: MelBee là ai → mật từ đâu → làm thế nào → vì sao tin được. */
export default function StoryPage() {
  return (
    <Shell current="story">
      <PageHead crumbs={[['Trang chủ', ''], ['Câu chuyện']]} title="Câu chuyện MelBee" sub={origin.text} />

      <section className="container split" aria-labelledby="st-us">
        <Photo src={story.image} alt={story.imageAlt} className="split__photo" eager />
        <div>
          <p className="eyebrow">Về chúng tôi</p>
          <h2 id="st-us" className="sp-h2">
            {story.title}
          </h2>
          {story.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="split__p">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="origin-band" aria-labelledby="st-origin">
        <Reveal className="container split is-flip">
          <Photo src={origin.image} alt={origin.imageAlt} className="split__photo" />
          <div>
            <p className="eyebrow">{origin.eyebrow}</p>
            <h2 id="st-origin" className="sp-h2">
              {origin.title}
            </h2>
            <p className="split__lead">{origin.lead.join(' ')}</p>
            <ul className="facets">
              {origin.highlights.map((h) => {
                const Icon = ICONS[h.icon] || Leaf
                return (
                  <li key={h.title}>
                    <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                    <b>{h.title}</b>
                    <span>{h.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="container steps" aria-labelledby="st-process">
        <p className="eyebrow">{process.eyebrow}</p>
        <h2 id="st-process" className="sp-h2">
          {process.title.join(' ')}
        </h2>
        <ol className="steps__list">
          {process.steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.1}>
              <span className="steps__no">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="container why" aria-labelledby="st-why">
        <h2 id="st-why" className="sp-h2">
          {whyUs.title.join(' ')}
        </h2>
        <ul className="why__grid">
          {whyUs.items.map((w, i) => (
            <Reveal as="li" key={w.title} delay={(i % 2) * 0.1}>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <NextBand eyebrow="Sản phẩm" title="Nếm thử một mùa hoa Tây Bắc" text="Khoái rừng, Hang đá, Hoa ban, Hoa nhãn — 100% mật ong nguyên chất." href={page('san-pham/')} label="Xem 4 loại mật" />
    </Shell>
  )
}
