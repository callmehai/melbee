import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Media from '../common/Media.jsx'
import { useDialog } from '../common/useDialog.js'
import './Lightbox.css'

/** Xem ảnh lớn: ← → chuyển ảnh, Esc đóng, vuốt trên điện thoại. */
export default function Lightbox({ items, index, onChange, onClose }) {
  const go = (d) => onChange((index + d + items.length) % items.length)
  const ref = useDialog(onClose, (e) => {
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  })
  const touch = useRef(null)
  const swiped = useRef(false)
  const it = items[index]

  return (
    <motion.div
      className="lightbox"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Ảnh ${index + 1} / ${items.length}: ${it.caption || it.alt}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => {
        // vuốt để chuyển ảnh thì không tính là bấm ra ngoài để đóng
        if (swiped.current) swiped.current = false
        else onClose()
      }}
      onPointerDown={(e) => (touch.current = e.clientX)}
      onPointerUp={(e) => {
        if (touch.current === null) return
        const dx = e.clientX - touch.current
        touch.current = null
        if (Math.abs(dx) > 50) {
          swiped.current = true
          go(dx < 0 ? 1 : -1)
        }
      }}
    >
      <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.figure
            key={index}
            className="lightbox__figure"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 0.8, 0.24, 1] }}
          >
            <Media src={it.image} alt={it.alt} art={it.art} fit="contain" eager />
            <figcaption>
              <span>{it.caption}</span>
              <span className="lightbox__count">
                {index + 1} / {items.length}
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      <button type="button" className="lb-btn lightbox__close" onClick={onClose} aria-label="Đóng" data-autofocus>
        <X size={22} />
      </button>
      <button
        type="button"
        className="lb-btn lightbox__nav is-prev"
        onClick={(e) => {
          e.stopPropagation()
          go(-1)
        }}
        aria-label="Ảnh trước"
      >
        <ChevronLeft size={26} />
      </button>
      <button
        type="button"
        className="lb-btn lightbox__nav is-next"
        onClick={(e) => {
          e.stopPropagation()
          go(1)
        }}
        aria-label="Ảnh sau"
      >
        <ChevronRight size={26} />
      </button>
    </motion.div>
  )
}
