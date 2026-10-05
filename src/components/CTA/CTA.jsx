import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { FacebookButton, ZaloButton } from '../common/Button.jsx'
import { cta } from '../../data/sections.js'
import './CTA.css'

/** Chiều tà của cùng một ngày với Hero: trời kem nối từ section trên, núi gần hoà vào footer. */
export default function CTA() {
  return (
    <section id="lien-he" data-scene="cta" className="cta" aria-labelledby="cta-title">
      <div className="cta__bg" aria-hidden="true">
        <Media src={cta.image} alt="" art={cta.art} />
      </div>
      <div className="container cta__inner">
        <SectionHeading id="cta-title" title={cta.title} align="center" />
        <Reveal as="p" className="cta__sub" delay={0.15}>
          {cta.subtext}
        </Reveal>
        <Reveal className="cta__buttons" delay={0.25}>
          <FacebookButton data-bee-perch="top-right">Nhắn tin Facebook</FacebookButton>
          <ZaloButton>Nhắn tin Zalo</ZaloButton>
        </Reveal>
      </div>
    </section>
  )
}
