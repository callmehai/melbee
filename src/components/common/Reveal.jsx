import { useScrollReveal } from '../../hooks/useScrollReveal.js'

/**
 * Hiện dần khi cuộn tới. effect: fade-up | fade | slide-left | slide-right | scale
 * Chạy bằng CSS transition (globals.css, khối .reveal) chứ không bằng JS: trình duyệt tự chạy
 * trên GPU, không giật trên điện thoại kể cả khi trang đang bận (framer-motion tính x/y từng khung bằng JS).
 */
export default function Reveal({ as: Tag = 'div', effect = 'fade-up', delay = 0, duration = 0.9, className = '', style, children, ...rest }) {
  const [ref, inView] = useScrollReveal()
  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${effect}${inView ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--rv-delay': `${delay}s`, '--rv-dur': `${duration}s`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
