/**
 * Tín hiệu từ giao diện React sang lớp Three.js (không phụ thuộc nhau: nếu Three.js
 * chưa tải hoặc không có WebGL, gửi tín hiệu cũng không sao).
 */
export const CARD_HOVER_EVENT = 'melbee:card-hover'

/** Thẻ sản phẩm được rê chuột vào / ra → hạt phấn bay lên quanh ảnh. */
export function signalCardHover(el, on) {
  window.dispatchEvent(new CustomEvent(CARD_HOVER_EVENT, { detail: { el, on } }))
}
