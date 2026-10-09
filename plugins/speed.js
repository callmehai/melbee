/**
 * Tăng tốc khi mạng tới máy chủ chậm (GitHub Pages phục vụ từ Singapore, mỗi file chờ 0,3–2 giây):
 *
 * 1. Font chữ chính tải ngay từ đầu (preload), không đợi JS dựng xong trang mới phát hiện ra font.
 * 2. Rê chuột / chạm vào link trong trang → trình duyệt dựng sẵn trang đó ở nền (Speculation Rules),
 *    bấm vào là hiện ngay. Trình duyệt không hỗ trợ thì bỏ qua, không lỗi.
 * 3. Service worker (public/sw.js): file đã tải thì giữ lại, lần sau không phải hỏi lại máy chủ.
 *
 * Chỉ chạy khi build — lúc dev không có service worker để khỏi dính bản cũ.
 */

// font hiện ngay ở màn đầu: tiêu đề serif 500 + chữ thường 400, bộ chữ Latin + tiếng Việt
const FONTS = [
  /^assets\/noto-serif-display-latin-500-normal-[\w-]+\.woff2$/,
  /^assets\/noto-serif-display-vietnamese-500-normal-[\w-]+\.woff2$/,
  /^assets\/be-vietnam-pro-latin-400-normal-[\w-]+\.woff2$/,
  /^assets\/be-vietnam-pro-vietnamese-400-normal-[\w-]+\.woff2$/,
]

const SPECULATION = JSON.stringify({
  prerender: [
    {
      where: { and: [{ href_matches: '/*' }, { not: { selector_matches: '[target=_blank], [download]' } }] },
      eagerness: 'moderate',
    },
  ],
})

export default function speed() {
  return {
    name: 'melbee-speed',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        // /index.html → './', /san-pham/hoa-ban/index.html → '../../'
        const depth = ctx.path.split('/').length - 2
        const up = depth ? '../'.repeat(depth) : './'
        const fonts = Object.keys(ctx.bundle || {}).filter((f) => FONTS.some((re) => re.test(f)))
        return [
          ...fonts.map((f) => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: up + f },
            injectTo: 'head',
          })),
          { tag: 'script', attrs: { type: 'speculationrules' }, children: SPECULATION, injectTo: 'head' },
          {
            tag: 'script',
            children: `if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('${up}sw.js').catch(()=>{}))`,
            injectTo: 'body',
          },
        ]
      },
    },
  }
}
