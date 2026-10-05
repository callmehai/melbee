import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import Button from '../common/Button.jsx'
import { Landscape } from '../Art/Art.jsx'
import Pollen from './Pollen.jsx'
import { useThreeStatus } from '../../three/store.js'
import { hero } from '../../data/sections.js'
import { asset, hasAsset } from '../../lib/assets.js'
import './Hero.css'

const ease = [0.22, 0.8, 0.24, 1]
const item = (delay) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease },
})

export default function Hero() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const three = useThreeStatus()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // parallax: lớp núi gần trôi nhanh hơn lớp xa
  const l0 = useTransform(scrollYProgress, [0, 1], [0, 40])
  const l1 = useTransform(scrollYProgress, [0, 1], [0, 80])
  const l2 = useTransform(scrollYProgress, [0, 1], [0, 130])
  const l3 = useTransform(scrollYProgress, [0, 1], [0, 190])
  const l4 = useTransform(scrollYProgress, [0, 1], [0, 250])
  const l5 = useTransform(scrollYProgress, [0, 1], [0, 300])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 160])

  const hasVideo = hasAsset(hero.video)
  const hasImage = hasAsset(hero.image)

  // video chỉ tải sau khi trang đã hiện xong
  const [loadVideo, setLoadVideo] = useState(false)
  useEffect(() => {
    if (!hasVideo || reduced) return
    const start = () => setLoadVideo(true)
    if (document.readyState === 'complete') {
      const t = setTimeout(start, 600)
      return () => clearTimeout(t)
    }
    window.addEventListener('load', start, { once: true })
    return () => window.removeEventListener('load', start)
  }, [hasVideo, reduced])

  return (
    <section id="trang-chu" data-scene="hero" ref={ref} className="hero" aria-label="Giới thiệu">
      <motion.div className="hero__bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
        <div className="hero__zoom">
          {hasImage || hasVideo ? (
            <motion.div className="hero__media" style={{ y: reduced ? 0 : bgY }}>
              {hasImage && <img src={asset(hero.image)} alt="" />}
              {hasVideo && loadVideo && (
                <video src={asset(hero.video)} poster={hasImage ? asset(hero.image) : undefined} autoPlay muted loop playsInline preload="none" />
              )}
            </motion.div>
          ) : (
            <Landscape
              variant={hero.art === 'landscape' ? 'dawn' : 'dusk'}
              className="hero__art"
              layerY={reduced ? undefined : [l0, l1, l2, l3, l4, l5]}
              label="Minh hoạ núi rừng Tây Bắc lúc hoàng hôn"
            />
          )}
        </div>
        <div className="hero__shade" />
        {/* phấn hoa 2D chỉ dùng khi lớp Three.js chưa chạy / không có WebGL */}
        {three !== 'running' && <Pollen />}
      </motion.div>

      <motion.div className="container hero__content" style={reduced ? undefined : { y: textY, opacity: textOpacity }}>
        <motion.p className="hero__eyebrow" {...item(0.35)}>
          {hero.eyebrow}
        </motion.p>
        <motion.h1 className="hero__title" {...item(0.55)}>
          {hero.title}
        </motion.h1>
        <motion.p className="hero__tagline" {...item(0.8)}>
          {hero.tagline}
        </motion.p>
        <motion.p className="hero__sub" {...item(0.95)}>
          {hero.subtext}
        </motion.p>
        <motion.div className="hero__ctas" {...item(1.15)}>
          <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
          <Button href={hero.secondaryCta.href} variant="light">
            {hero.secondaryCta.label}
          </Button>
        </motion.div>
      </motion.div>

      <motion.a href="#gioi-thieu" className="hero__scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} aria-label="Cuộn xuống">
        <span>Cuộn xuống</span>
        <ArrowDown size={16} aria-hidden="true" />
      </motion.a>
    </section>
  )
}
