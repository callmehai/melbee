import { Mail, MapPin, Phone } from 'lucide-react'
import Logo from '../common/Logo.jsx'
import { FacebookIcon, ZaloIcon } from '../common/BrandIcons.jsx'
import { brand } from '../../config/brand.js'
import { nav } from '../../data/sections.js'
import './Footer.css'

const pending = 'Đang cập nhật'
const YEAR = new Date().getFullYear()

export default function Footer() {
  const { phone, email, address } = brand.contact
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo light />
          <p className="footer__name">{brand.name}</p>
          <p className="footer__tagline">{brand.tagline}</p>
        </div>

        <nav aria-label="Liên kết cuối trang">
          <h2 className="footer__h">Khám phá</h2>
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="footer__h">Liên hệ</h2>
          <ul className="footer__contact">
            <li>
              <Phone size={16} aria-hidden="true" />
              {phone ? <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a> : <span>Điện thoại: {pending}</span>}
            </li>
            <li>
              <Mail size={16} aria-hidden="true" />
              {email ? <a href={`mailto:${email}`}>{email}</a> : <span>Email: {pending}</span>}
            </li>
            <li>
              <MapPin size={16} aria-hidden="true" />
              <span>{address || `Địa chỉ: ${pending}`}</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="footer__h">Mạng xã hội</h2>
          <ul className="footer__social">
            <li>
              <a href={brand.facebook} target="_blank" rel="noopener noreferrer">
                <FacebookIcon /> Facebook
              </a>
            </li>
            <li>
              <a href={brand.zalo} target="_blank" rel="noopener noreferrer">
                <ZaloIcon /> Zalo
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>
          © {YEAR} {brand.shortName} — {brand.name}
        </p>
        <a href="#trang-chu">Về đầu trang ↑</a>
      </div>
    </footer>
  )
}
