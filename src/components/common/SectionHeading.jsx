import Reveal from './Reveal.jsx'

/** Tiêu đề section: dòng nhỏ (eyebrow) + tiêu đề lớn (chuỗi hoặc mảng dòng) */
export default function SectionHeading({ eyebrow, title, subtitle, align = 'left', light = false, id }) {
  const lines = Array.isArray(title) ? title : [title]
  return (
    <div className={`section-heading align-${align} ${light ? 'is-light' : ''}`}>
      {eyebrow && (
        <Reveal as="p" className="eyebrow" effect="fade">
          {eyebrow}
        </Reveal>
      )}
      <Reveal as="h2" className="display" delay={0.08} id={id}>
        {lines.map((l, i) => (
          <span key={i} className="display__line">
            {l}
          </span>
        ))}
      </Reveal>
      {subtitle && (
        <Reveal as="p" className="section-heading__sub" delay={0.16}>
          {subtitle}
        </Reveal>
      )}
    </div>
  )
}
