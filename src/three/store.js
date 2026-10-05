import { useSyncExternalStore } from 'react'

/**
 * Trạng thái lớp Three.js cho phần còn lại của trang:
 * idle (chưa tải) | running (đang chạy) | unavailable (không có WebGL / lỗi → dùng giao diện cũ).
 */
let status = 'idle'
const listeners = new Set()

export function setThreeStatus(next) {
  if (next === status) return
  status = next
  for (const l of listeners) l()
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useThreeStatus = () => useSyncExternalStore(subscribe, () => status, () => 'idle')
