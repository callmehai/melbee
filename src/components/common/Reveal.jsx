import { motion } from 'framer-motion'
import { useScrollReveal } from '../../hooks/useScrollReveal.js'

const VARIANTS = {
  'fade-up': { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  'slide-left': { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0 } },
  'slide-right': { hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1 } },
}

/** Hiện dần khi cuộn tới. effect: fade-up | fade | slide-left | slide-right | scale */
export default function Reveal({ as = 'div', effect = 'fade-up', delay = 0, duration = 0.9, className, children, ...rest }) {
  const [ref, inView] = useScrollReveal()
  const Tag = motion[as] || motion.div
  return (
    <Tag
      ref={ref}
      className={className}
      variants={VARIANTS[effect] || VARIANTS['fade-up']}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      transition={{ duration, delay, ease: [0.22, 0.8, 0.24, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
