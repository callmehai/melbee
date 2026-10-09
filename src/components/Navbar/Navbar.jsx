import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Logo from '../common/Logo.jsx'
import OrderMenu from '../common/OrderMenu.jsx'
import SoundToggle from '../SoundToggle/SoundToggle.jsx'
import { FacebookIcon, ZaloLogo } from '../common/BrandIcons.jsx'
import { nav } from '../../data/sections.js'
import { brand } from '../../config/brand.js'
import { useLockBody } from '../../hooks/useLockBody.js'
import { page } from '../../lib/site.js'
import './Navbar.css'

/**
 * Thanh menu chung cho mọi trang. Mỗi mục là một trang riêng; mục của trang đang xem được tô.
 * current: id trang trong `nav` (src/data/sections.js) · solid: nền đặc ngay từ đầu (trang con, không có ảnh hero phía sau).
 */
export default function Navbar({ current = 'home', solid: alwaysSolid = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useLockBody(open)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const solid = alwaysSolid || scrolled || open

  return (
    <header className={`nav ${solid ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container nav__inner">
        <a href={page()} className="nav__brand" aria-label={`${brand.name} — trang chủ`} onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav className="nav__links" aria-label="Điều hướng chính">
          <ul>
            {nav.map((n) => (
              <li key={n.id}>
                <a href={page(n.path)} className={current === n.id ? 'is-active' : ''} aria-current={current === n.id ? 'page' : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* nhạc nền chỉ có ở trang chủ */}
        {current === 'home' && <SoundToggle />}

        <div className="nav__cta">
          <OrderMenu size="sm" variant="solid" />
        </div>

        <button
          type="button"
          className="nav__burger"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* portal: header có backdrop-filter nên phần tử fixed bên trong sẽ bị giam trong header */}
      {createPortal(
      <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              className="mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <nav aria-label="Điều hướng (di động)">
                <ul>
                  {nav.map((n, i) => (
                    <motion.li key={n.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i + 0.1, duration: 0.5 }}>
                      <a href={page(n.path)} aria-current={current === n.id ? 'page' : undefined} onClick={() => setOpen(false)}>
                        <span>{String(i + 1).padStart(2, '0')}</span>
                        {n.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="mobile-menu__cta">
                <p>{brand.cta.order}</p>
                <a className="btn btn--facebook" href={brand.facebook} target="_blank" rel="noopener noreferrer">
                  <FacebookIcon size={20} /> <span>{brand.cta.facebook}</span>
                </a>
                <a className="btn btn--zalo" href={brand.zalo} target="_blank" rel="noopener noreferrer">
                  <ZaloLogo size={22} /> <span>{brand.cta.zalo}</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  )
}
