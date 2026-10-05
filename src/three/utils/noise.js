/** Nhiễu giá trị mượt 1D/2D trên CPU (gió giật, ong lượn). Kết quả trong khoảng −1…1. */

const hash1 = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const hash2 = (i, j) => {
  const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const smooth = (t) => t * t * (3 - 2 * t)

export function noise1(x) {
  const i = Math.floor(x)
  const f = smooth(x - i)
  const a = hash1(i)
  return (a + (hash1(i + 1) - a) * f) * 2 - 1
}

export function noise2(x, y) {
  const i = Math.floor(x)
  const j = Math.floor(y)
  const fx = smooth(x - i)
  const fy = smooth(y - j)
  const a = hash2(i, j)
  const b = hash2(i + 1, j)
  const c = hash2(i, j + 1)
  const d = hash2(i + 1, j + 1)
  return (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy) * 2 - 1
}

/** Tiến dần tới đích, độc lập với FPS (lambda lớn → nhanh). */
export const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt))

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
