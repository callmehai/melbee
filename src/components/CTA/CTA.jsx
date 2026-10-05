import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { FacebookButton, ZaloButton } from '../common/Button.jsx'
import { cta } from '../../data/sections.js'
import './CTA.css'

export default function CTA() {
  return (
    <section id="lien-he" className="cta" aria-labelledby="cta-title">
      <div className="cta__bg" aria-hidden="true">
        <Media src={cta.image} alt="" art={cta.art} />
      </div>
      <div className="cta__shade" aria-hidden="true" />
      <div className="container cta__inner">
        <SectionHeading id="cta-title" title={cta.title} align="center" light />
        <Reveal as="p" className="cta__sub" delay={0.15}>
          {cta.subtext}
        </Reveal>
        <Reveal className="cta__buttons" delay={0.25}>
          <FacebookButton>Nhắn tin Facebook</FacebookButton>
          <ZaloButton variant="light">Nhắn tin Zalo</ZaloButton>
        </Reveal>
      </div>
    </section>
  )
}
