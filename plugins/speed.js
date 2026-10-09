/**
 * Tăng tốc khi mạng tới máy chủ chậm (GitHub Pages phục vụ từ Singapore, mỗi file chờ 0,3–2 giây):
 *
 * 1. Font chữ chính tải ngay từ đầu (preload), không đợi JS dựng xong trang mới phát hiện ra font.
 * 2. Service worker (public/sw.js): file đã tải thì giữ lại, lần sau không phải hỏi lại máy chủ.
 * 3. HTML cũ (trình duyệt giữ tới 10 phút) trỏ tới JS/CSS của lần deploy trước đã bị xoá → tự tải lại trang
 *    một lần thay vì để trang trắng.
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

// file /assets/… không tải được (404 sau deploy) → tải lại trang (tối đa một lần mỗi 30 giây để không lặp vô hạn)
const RECOVER = `addEventListener('error',function(e){var t=e.target,u=t&&(t.src||t.href);if(!u||!/\\/assets\\/[^/]+\\.(js|css)$/.test(u))return;var k='melbee:reload:'+location.pathname;try{if(Date.now()-(+sessionStorage.getItem(k)||0)<30000)return;sessionStorage.setItem(k,Date.now())}catch(_){return}location.reload()},true)`

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
          { tag: 'script', children: RECOVER, injectTo: 'head-prepend' },
          ...fonts.map((f) => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: up + f },
            injectTo: 'head',
          })),
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
