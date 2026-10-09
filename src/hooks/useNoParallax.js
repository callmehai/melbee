import { useReducedMotion } from 'framer-motion'
import { useMediaQuery } from './useMediaQuery.js'

/**
 * true → đứng yên, không trôi theo cuộn (parallax). Parallax của framer-motion tính lại vị trí bằng JS
 * mỗi khung hình khi cuộn — điện thoại / máy tính bảng cuộn bị giật nên tắt, cùng người chọn "giảm chuyển động".
 */
export function useNoParallax() {
  const reduced = useReducedMotion()
  const touch = useMediaQuery('(hover: none) and (pointer: coarse)')
  return reduced || touch
}
