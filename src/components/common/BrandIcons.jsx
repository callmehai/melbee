/** Icon thương hiệu (lucide-react không còn icon logo hãng) */
export function FacebookIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" />
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

export function ZaloIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...rest}>
      <path
        d="M12 3.5c-4.97 0-9 3.36-9 7.5 0 2.35 1.3 4.45 3.33 5.83-.13.98-.6 2.07-1.38 2.92 1.6-.1 2.95-.66 3.9-1.33.98.27 2.04.42 3.15.42 4.97 0 9-3.36 9-7.5s-4.03-7.84-9-7.84z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <text x="12" y="13.6" textAnchor="middle" fontSize="6.4" fontWeight="700" fontFamily="Arial, sans-serif" fill="currentColor">
        Zalo
      </text>
    </svg>
  )
}
