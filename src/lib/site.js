/**
 * Gốc website, tính từ vị trí file JS — chạy đúng ở mọi trang (/, /san-pham/, /san-pham/hoa-ban/…)
 * và mọi nơi deploy (GitHub Pages /melbee/, tên miền riêng). base './' nên không dùng được link "/…".
 * Bản build: mọi file JS nằm trong assets/ → '../'. Lúc dev: file này ở src/lib/ → '../../'.
 */
export const SITE_ROOT = new URL(import.meta.env.DEV ? '../../' : '../', import.meta.url).href

/** Link tới một trang của website, vd page('san-pham/') */
export const page = (path = '') => SITE_ROOT + path
