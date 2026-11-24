import { Flower2, HeartHandshake, Leaf, Mountain } from 'lucide-react'
import { Shell, PageHead, Photo, NextBand } from './common.jsx'
import { story, origin, journey, events } from '../data/sections.js'
import { brand } from '../config/brand.js'
import { page } from '../lib/site.js'
import Reveal from '../components/common/Reveal.jsx'

const ICONS = { mountain: Mountain, leaf: Leaf, flower: Flower2, 'heart-handshake': HeartHandshake }

/**
 * /cau-chuyen/ — phần riêng của trang này (trang chủ không có): MelBee ra đời từ đâu → mật từ đâu →
 * hành trình có ngày tháng thật → ảnh gian hàng ngoài đời → dẫn sang hộp quà.
 * (Bản cũ lặp lại Quy trình + 4 ý "Điều gì làm nên…" của trang chủ — đã bỏ.)
 */
export default function StoryPage() {
  return (
    <Shell current="story">
      <PageHead crumbs={[['Trang chủ', ''], ['Câu chuyện']]} title="Câu chuyện MelBee" sub={origin.text} />

      <section className="container split" aria-labelledby="st-us">
        <Photo src={story.image} alt={story.imageAlt} className="split__photo" eager />
        <div>
          <p className="eyebrow">Về chúng tôi</p>
          {/* trang đã có tiêu đề "Câu chuyện MelBee" → không lặp "Câu chuyện của chúng tôi" ngay dưới */}
          <h2 id="st-us" className="sp-h2">
            MelBee ra đời từ đâu
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

      <section className="container journey" aria-labelledby="st-journey">
        <div className="journey__head">
          <p className="eyebrow">{journey.eyebrow}</p>
          <h2 id="st-journey" className="sp-h2">
            {journey.title[0]} <em>{journey.title[1]}</em>
          </h2>
        </div>
        <ol className="journey__list">
          {journey.milestones.map((m, i) => (
            <Reveal as="li" key={m.title} delay={(i % 4) * 0.08}>
              <span className="journey__date">{m.date}</span>
              <h3>{m.title}</h3>
              {m.place && <p className="journey__place">{m.place}</p>}
              <p>{m.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="events" aria-labelledby="st-events">
        <div className="container">
          <div className="events__head">
            <div>
              <p className="eyebrow">{events.eyebrow}</p>
              <h2 id="st-events" className="sp-h2">
                {events.title}
              </h2>
            </div>
            <p>{events.text}</p>
          </div>
          <ul className="events__grid">
            {events.photos.map((p, i) => (
              <Reveal as="li" key={p.src} delay={i * 0.1}>
                <figure>
                  <Photo src={p.src} alt={p.alt} />
                  <figcaption>{p.caption}</figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
          <a className="arrow-link events__more" href={brand.facebook} target="_blank" rel="noopener noreferrer">
            <span>Xem thêm ảnh trên fanpage MelBee</span>
          </a>
        </div>
      </section>

      <NextBand eyebrow="Hộp quà" title="Gửi một mùa hoa Tây Bắc làm quà" text="Set 2, 3 hoặc 4 lọ phối sẵn trong hộp cứng nâu trầm nhũ vàng, kèm thìa gỗ và túi giấy đồng bộ." href={page('hop-qua/')} label="Chọn hộp quà" />
    </Shell>
  )
}
