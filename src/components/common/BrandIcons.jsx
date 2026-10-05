/**
 * Logo thương hiệu (lucide-react không có logo hãng).
 * Hình Facebook và chữ "Zalo" lấy từ bộ Simple Icons (simpleicons.org, giấy phép CC0).
 *
 * FacebookIcon / ZaloIcon / TikTokIcon: một màu (currentColor) — dùng ở chỗ đơn sắc như footer.
 * ZaloLogo: logo màu như biểu tượng ứng dụng Zalo — ô xanh, bong bóng trắng, chữ xanh.
 *   bare: bỏ ô vuông xanh (đặt lên nền xanh có sẵn, vd. nút tròn Zalo).
 */

export const FACEBOOK_BLUE = '#0866FF'
export const ZALO_BLUE = '#0068FF'

const FB_PATH =
  'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z'

const ZALO_WORD =
  'M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z'

// bong bóng chat của logo Zalo: tròn dẹt, đuôi nhọn ở góc dưới trái
const ZALO_BUBBLE = 'M12 3.6c-5.08 0-9.2 3.33-9.2 7.44 0 2.2 1.18 4.18 3.06 5.54-.16 1.04-.72 2.06-1.56 2.8 1.86-.02 3.36-.68 4.38-1.44.99.25 2.1.4 3.32.4 5.08 0 9.2-3.33 9.2-7.3S17.08 3.6 12 3.6z'

export function FacebookIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d={FB_PATH} />
    </svg>
  )
}

/** Logo Facebook màu: tròn xanh, chữ f trắng. */
export function FacebookLogo({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <circle cx="12" cy="12" r="11.4" fill="#fff" />
      <path d={FB_PATH} fill={FACEBOOK_BLUE} />
    </svg>
  )
}

export function TikTokIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d="M16.6 3c.3 2.2 1.6 3.7 3.9 3.9v2.6c-1.4.1-2.6-.3-3.9-1.1v5.7c0 3.6-2.6 5.9-5.8 5.9-3.1 0-5.6-2.4-5.6-5.6 0-3.4 2.9-6 6.5-5.5v2.8c-1.6-.4-3.6.6-3.6 2.7 0 1.6 1.2 2.8 2.7 2.8 1.6 0 2.9-1.1 2.9-3.2V3h2.9z" />
    </svg>
  )
}

/** Chữ "Zalo" một màu (khung vuông, chữ nằm giữa). */
export function ZaloIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d={ZALO_WORD} />
    </svg>
  )
}

export function ZaloLogo({ size = 18, bare = false, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      {!bare && <rect width="24" height="24" rx="5.6" fill={ZALO_BLUE} />}
      <path d={ZALO_BUBBLE} fill="#fff" />
      <path d={ZALO_WORD} fill={ZALO_BLUE} transform="translate(5.25 4.3) scale(0.5625)" />
    </svg>
  )
}
