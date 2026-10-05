import { brand } from '../../config/brand.js'
import { asset } from '../../lib/assets.js'

/** Logo: huy hiệu tròn (ảnh brand.logo, hoặc biểu tượng tổ ong vẽ sẵn) + tên thương hiệu */
export default function Logo({ light = false }) {
  return (
    <span className={`logo ${light ? 'is-light' : ''}`}>
      {brand.logo ? (
        <img className="logo__badge" src={asset(brand.logo)} alt="" width="44" height="44" />
      ) : (
        <svg className="logo__mark" viewBox="0 0 40 44" aria-hidden="true">
          <path d="M20 2 L37 12 L37 32 L20 42 L3 32 L3 12 Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M20 12 C 15 19, 13 23, 13 26.5 A7 7 0 0 0 27 26.5 C 27 23, 25 19, 20 12 Z" fill="var(--honey)" />
        </svg>
      )}
      <span className="logo__text">
        <b>{brand.shortName}</b>
        <small>{brand.name}</small>
      </span>
    </span>
  )
}
