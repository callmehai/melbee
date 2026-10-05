import { useSyncExternalStore } from 'react'
import { boxColors, boxSizes, jarProducts } from '../data/giftbox.js'

/**
 * Trạng thái hộp quà dùng chung cho giao diện (React) và hộp 3D (Three.js, đọc mỗi khung hình).
 * Module này không import three — hộp 3D nằm ở chunk riêng, tải sau.
 *
 * jars: id sản phẩm theo từng ô của khay (độ dài ≤ số ô của kiểu hộp)
 * open: nắp đang mở · rev: tăng mỗi lần đổi → hộp 3D biết lúc nào cần vẽ lại thiệp / hũ
 */
let state = {
  size: boxSizes[boxSizes.length - 1].id,
  color: boxColors[0].id,
  jars: [jarProducts[0], jarProducts[0], jarProducts[1] || jarProducts[0]],
  card: { on: true, text: '', from: '' },
  open: false,
  rev: 0,
}
const listeners = new Set()

export const getGift = () => state

export function setGift(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next, rev: state.rev + 1 }
  const slots = boxSizes.find((s) => s.id === state.size)?.slots ?? 1
  if (state.jars.length > slots) state.jars = state.jars.slice(0, slots)
  for (const l of listeners) l()
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useGift = () => useSyncExternalStore(subscribe, getGift, getGift)
