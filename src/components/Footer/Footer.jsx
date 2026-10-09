import { Gift, Mail, MapPin, MessageCircle, Mountain, Phone } from 'lucide-react'
import Logo from '../common/Logo.jsx'
import { FacebookLogo, TikTokIcon, ZaloLogo } from '../common/BrandIcons.jsx'
import { brand } from '../../config/brand.js'
import { nav } from '../../data/sections.js'
import { honeys } from '../../data/catalog.js'
import { page } from '../../lib/site.js'
import './Footer.css'

const pending = 'Đang cập nhật'
const YEAR = new Date().getFullYear()

// ba lời hứa ngắn — chỉ ghi điều MelBee thật sự làm, không hứa phí ship / chính sách chưa có
const promises = [
  { icon: MessageCircle, title: 'Đặt hàng qua tin nhắn', text: 'Facebook hoặc Zalo, không cần tài khoản' },
  { icon: Mountain, title: 'Mật từ núi rừng Điện Biên', text: 'Theo từng mùa hoa vùng cao' },
  { icon: Gift, title: 'Chỉn chu để làm quà', text: 'Hũ mật và hộp quà Tây Bắc' },
]

/**
 * Một lớp núi cho hình vẽ nét ở chân footer: sóng "gãy" (1 − |sin|) cho đỉnh nhọn như núi đá,
 * khép xuống đáy để lớp gần tô kín, che lớp xa. Cố định — không ngẫu nhiên.
 */
function ridge(base, amp, phase, W = 1600, H = 120) {
  const peak = (v) => (1 - Math.abs(Math.sin(v))) ** 1.6
  let d = ''
  for (let x = 0; x <= W; x += 8) {
    const h = 0.6 * peak(x * 0.0042 + phase) + 0.28 * peak(x * 0.011 + phase * 2.3) + 0.12 * peak(x * 0.029 + phase * 3.7)
    d += `${x ? 'L' : 'M'}${x} ${(base - amp * h).toFixed(1)}`
  }
  return `${d}L${W + 20} ${H + 20}L-20 ${H + 20}Z` // khép ra ngoài khung để cạnh đáy/cạnh bên không bị vẽ nét
}
// xa → gần: mỗi lớp thấp hơn, đỉnh thấp hơn
const RIDGES = [ridge(78, 66, 0.4), ridge(94, 50, 2.2), ridge(110, 34, 4.1)]

export default function Footer() {
  const { phone, email, address } = brand.contact
  return (
    <footer className="footer" data-scene="footer">
      <div className="container">
        <ul className="footer__promises">
          {promises.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
              <div>
                <b>{title}</b>
                <span>{text}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="footer__grid">
          <div className="footer__brand">
            <Logo />
            <p className="footer__tagline">{brand.tagline}</p>
            <ul className="footer__social" aria-label="Mạng xã hội">
              <li>
                <a href={brand.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FacebookLogo size={22} />
                </a>
              </li>
              <li>
                <a href={brand.zalo} target="_blank" rel="noopener noreferrer" aria-label="Zalo">
                  <ZaloLogo size={22} />
                </a>
              </li>
              {brand.tiktok && (
                <li>
                  <a href={brand.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                    <TikTokIcon size={18} />
                  </a>
                </li>
              )}
            </ul>
          </div>

          <nav aria-label="Liên kết cuối trang">
            <h2 className="footer__h">Khám phá</h2>
            <ul className="footer__links is-cols">
              {nav.map((n) => (
                <li key={n.id}>
                  <a href={page(n.path)}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__products">
            <h2 className="footer__h">Sản phẩm</h2>
            <ul className="footer__links">
              {honeys.map((h) => (
                <li key={h.id}>
                  <a href={page(`san-pham/${h.id}/`)}>{h.name}</a>
                </li>
              ))}
              <li>
                <a href={page('hop-qua/')}>Set quà 2 lọ 380ml</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer__h">Liên hệ</h2>
            <ul className="footer__contact">
              <li>
                <Phone size={15} aria-hidden="true" />
                {phone ? <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a> : <span>Điện thoại: {pending}</span>}
              </li>
              <li>
                <Mail size={15} aria-hidden="true" />
                {email ? <a href={`mailto:${email}`}>{email}</a> : <span>Email: {pending}</span>}
              </li>
              <li>
                <MapPin size={15} aria-hidden="true" />
                <span>{address || `Địa chỉ: ${pending}`}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* dãy núi Tây Bắc vẽ nét nhũ ở chân trang, dòng cuối nằm trên chân núi */}
      <div className="footer__base">
        <svg className="footer__ridges" viewBox="0 0 1600 120" preserveAspectRatio="none" aria-hidden="true">
          {RIDGES.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
        <div className="container footer__bottom">
          <p>
            © {YEAR} {brand.shortName} — {brand.name}
          </p>
          <a href="#top" onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: 'smooth' }))}>
            Về đầu trang ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
