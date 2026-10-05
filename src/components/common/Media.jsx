import { memo, useState } from 'react'
import Art from '../Art/Art.jsx'
import { asset, hasAsset } from '../../lib/assets.js'
import './Media.css'

/**
 * Ảnh thật nếu file tồn tại trong public/, nếu không → hình minh hoạ `art`.
 * Không bao giờ hiện ảnh vỡ. Ảnh được lazy-load.
 */
function Media({ src, alt = '', art, artProps, className = '', fit = 'cover', position = 'center', eager = false, tag }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const real = src && hasAsset(src) && !failed

  return (
    <div className={`media ${className}`}>
      {real ? (
        <img
          className={`media__img ${loaded ? 'is-loaded' : ''}`}
          src={asset(src)}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          style={{ objectFit: fit, objectPosition: position }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          <Art kind={art} className="media__art" label={alt} {...artProps} />
          {tag && <span className="media__tag">{tag}</span>}
        </>
      )}
    </div>
  )
}

export default memo(Media)
