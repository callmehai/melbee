import { Mail, MapPin, Phone } from 'lucide-react'
import { Shell, PageHead } from './common.jsx'
import Button, { FacebookButton, ZaloButton } from '../components/common/Button.jsx'
import { FacebookLogo, TikTokIcon, ZaloLogo } from '../components/common/BrandIcons.jsx'
import { brand } from '../config/brand.js'
import { company } from '../data/catalog.js'
import { productsSection } from '../data/sections.js'
import Reveal from '../components/common/Reveal.jsx'

/** /lien-he/ — ba kênh đặt hàng (Zalo chính), rồi thông tin doanh nghiệp như in ở đáy hộp. */
export default function ContactPage() {
  return (
    <Shell current="contact">
      <PageHead
        crumbs={[['Trang chủ', ''], ['Liên hệ']]}
        title="Liên hệ MelBee"
        sub={`Đặt mật, đặt hộp quà hay hỏi về sản phẩm. ${productsSection.note}`}
      />

      <div className="container">
        <ul className="channels">
          <Reveal as="li" className="is-main">
            <ZaloLogo size={40} />
            <h2>Zalo</h2>
            <p>Nhanh nhất — nhắn tin, gửi ảnh, nhận báo giá.</p>
            <p className="channels__id">{company.hotlineDisplay}</p>
            <ZaloButton variant="zalo-solid">Nhắn Zalo</ZaloButton>
          </Reveal>
          <Reveal as="li" delay={0.08}>
            <FacebookLogo size={40} />
            <h2>Facebook</h2>
            <p>Nhắn tin trang MelBee — Mật ong Tây Bắc.</p>
            <p className="channels__id">facebook.com/melbeetaybac</p>
            <FacebookButton variant="outline">Nhắn Facebook</FacebookButton>
          </Reveal>
          <Reveal as="li" delay={0.16}>
            <span className="channels__icon" aria-hidden="true">
              <Phone size={22} />
            </span>
            <h2>Điện thoại</h2>
            <p>Gọi trực tiếp hotline MelBee.</p>
            <p className="channels__id">{company.hotlineDisplay}</p>
            <Button href={`tel:${company.hotline}`} variant="outline" icon={<Phone size={18} aria-hidden="true" />}>
              Gọi ngay
            </Button>
          </Reveal>
        </ul>
      </div>

      <section className="container company" aria-labelledby="company-title">
        <h2 id="company-title" className="sp-h2">
          {company.name}
        </h2>
        <p className="company__en">{company.nameEn}</p>
        <ul className="company__list">
          <li>
            <MapPin size={18} aria-hidden="true" />
            <span>{company.address}</span>
          </li>
          <li>
            <Phone size={18} aria-hidden="true" />
            <a href={`tel:${company.hotline}`}>{company.hotlineDisplay}</a>
          </li>
          <li>
            <Mail size={18} aria-hidden="true" />
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </li>
          {brand.tiktok && (
            <li>
              <TikTokIcon size={18} />
              <a href={brand.tiktok} target="_blank" rel="noopener noreferrer">
                TikTok @melbeetaybac
              </a>
            </li>
          )}
        </ul>
      </section>
    </Shell>
  )
}
