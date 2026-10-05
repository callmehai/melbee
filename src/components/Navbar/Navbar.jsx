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
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(nav[0].href)
  useLockBody(open)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // làm nổi mục menu của section đang xem; section không có trong menu → không mục nào sáng
  useEffect(() => {
    const els = [...document.querySelectorAll('main > section, footer')]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const href = '#' + e.target.id
          setActive(nav.some((n) => n.href === href) ? href : null)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const solid = scrolled || open

  return (
    <header className={`nav ${solid ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container nav__inner">
        <a href="#trang-chu" className="nav__brand" aria-label={`${brand.name} — về đầu trang`} onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav className="nav__links" aria-label="Điều hướng chính">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className={active === n.href ? 'is-active' : ''} aria-current={active === n.href ? 'true' : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <SoundToggle />

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
                    <motion.li key={n.href} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i + 0.1, duration: 0.5 }}>
                      <a href={n.href} onClick={() => setOpen(false)}>
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
