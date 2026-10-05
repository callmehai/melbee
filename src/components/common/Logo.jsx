import { brand } from '../../config/brand.js'
import { asset } from '../../lib/assets.js'

/** Logo: ảnh (brand.logo) hoặc logo chữ + biểu tượng tổ ong */
export default function Logo({ light = false }) {
  if (brand.logo) return <img className="logo-img" src={asset(brand.logo)} alt={brand.name} height="40" />
  return (
    <span className={`logo ${light ? 'is-light' : ''}`}>
      <svg className="logo__mark" viewBox="0 0 40 44" aria-hidden="true">
        <path d="M20 2 L37 12 L37 32 L20 42 L3 32 L3 12 Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M20 12 C 15 19, 13 23, 13 26.5 A7 7 0 0 0 27 26.5 C 27 23, 25 19, 20 12 Z" fill="var(--honey)" />
      </svg>
      <span className="logo__text">
        <b>{brand.shortName}</b>
        <small>{brand.name}</small>
      </span>
    </span>
  )
}
