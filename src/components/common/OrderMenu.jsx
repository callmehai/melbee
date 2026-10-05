import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { FacebookIcon, ZaloIcon } from './BrandIcons.jsx'
import { brand } from '../../config/brand.js'
import './OrderMenu.css'

/**
 * Nút "Nhắn tin đặt hàng" → mở lựa chọn Facebook / Zalo.
 * Không có giỏ hàng: mọi đơn đặt qua tin nhắn.
 */
export default function OrderMenu({ label = brand.cta.order, variant = 'solid', align = 'right', facebook = true, zalo = true, className = '', size }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        ref.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`order-menu align-${align} ${className}`} ref={ref}>
      <button
        type="button"
        className={`btn btn--${variant} ${size === 'sm' ? 'btn--sm' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        data-cursor="cta"
      >
        <MessageCircle size={17} aria-hidden="true" />
        <span>{label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            className="order-menu__pop"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 0.8, 0.24, 1] }}
          >
            <p className="order-menu__hint">Chọn kênh để nhắn tin cho chúng tôi</p>
            {facebook && (
              <a href={brand.facebook} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                <span className="order-menu__icon is-fb">
                  <FacebookIcon size={16} />
                </span>
                <span>
                  <b>Facebook Messenger</b>
                  <small>{brand.cta.facebook}</small>
                </span>
              </a>
            )}
            {zalo && (
              <a href={brand.zalo} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                <span className="order-menu__icon is-zalo">
                  <ZaloIcon size={18} />
                </span>
                <span>
                  <b>Zalo</b>
                  <small>{brand.cta.zalo}</small>
                </span>
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
