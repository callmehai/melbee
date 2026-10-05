/**
 * "Không khí" chung của trang: section đang xem + độ mạnh gió.
 * Lớp Three.js là nguồn chính (đã tính sẵn mỗi khung hình từ hệ thống cuộn của nó);
 * AudioManager nghe ở đây để tiếng gió, tiếng suối đi cùng nhịp với hình.
 */
const state = { scene: null, wind: 0, source: null }
const listeners = new Set()

export function publishAtmosphere(patch) {
  Object.assign(state, patch)
  for (const l of listeners) l(state)
}

export function subscribeAtmosphere(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const getAtmosphere = () => state
