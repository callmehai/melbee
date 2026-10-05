import { memo, useId } from 'react'
import { motion } from 'framer-motion'

/**
 * Hình minh hoạ vẽ bằng SVG — dùng khi chưa có ảnh thật.
 * Chép ảnh thật vào public/assets/images/... là ảnh thật tự thay chỗ hình này.
 */

const C = {
  honey: '#C88A24',
  honeyLight: '#E4B25A',
  honeyPale: '#F2D9A2',
  honeyDeep: '#8E5A12',
  forest: '#24352A',
  forest2: '#34503D',
  sage: '#8A9A78',
  brown: '#3A291D',
  wood: '#7A5634',
  cream: '#F5EBDD',
  ivory: '#FAF7F0',
  charcoal: '#1E1C18',
  blush: '#EFD6CF',
}

// số ngẫu nhiên cố định theo seed → hình giống nhau mỗi lần render
function rng(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n) => Math.round(n * 10) / 10

function Grain({ id, opacity = 0.18 }) {
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix values={`0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 ${opacity} 0`} />
    </filter>
  )
}

function Frame({ viewBox = '0 0 800 800', children, grain = 0.16, className, label }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox={viewBox} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <defs>
        <Grain id={`g${id}`} opacity={grain} />
      </defs>
      {children(id)}
      <rect width="100%" height="100%" filter={`url(#g${id})`} pointerEvents="none" />
    </svg>
  )
}

/* ── NÚI TÂY BẮC ─────────────────────────────────────────── */
function ridgePath(seed, baseY, amp, W = 1600, H = 1000) {
  const r = rng(seed)
  const p = [r() * 6, r() * 6, r() * 6]
  const fr = [0.0035 + r() * 0.002, 0.009 + r() * 0.004, 0.022 + r() * 0.01]
  const pts = []
  for (let x = -60; x <= W + 60; x += 25) {
    const y =
      baseY -
      amp * (0.6 * Math.sin(x * fr[0] + p[0]) + 0.28 * Math.sin(x * fr[1] + p[1]) + 0.12 * Math.sin(x * fr[2] + p[2]))
    pts.push([x, y])
  }
  let d = `M${pts[0][0]} ${H + 10} L${pts[0][0]} ${f(pts[0][1])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2
    const my = (pts[i][1] + pts[i + 1][1]) / 2
    d += ` Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`
  }
  d += ` L${W + 60} ${H + 10} Z`
  return d
}

const LANDSCAPES = {
  dawn: {
    sky: ['#E8D3A8', '#F1E2C2', '#F8EEDB'],
    sun: '#FBE7B5',
    sunPos: [1080, 470],
    ridges: ['#CFC6A6', '#A9AD8D', '#7E8E6E', '#4E6550', '#2E4434', '#1F2F24'],
    mist: '#FBF3E3',
  },
  dusk: {
    sky: ['#2A251D', '#6A4527', '#C98238', '#EDBB6E'],
    sun: '#FFE2A6',
    sunPos: [520, 520],
    ridges: ['#9B6A3E', '#77502F', '#563B25', '#3C2A1C', '#2A1E15', '#1C1510'],
    mist: '#F3C987',
  },
}

export const Landscape = memo(function Landscape({ variant = 'dawn', className, layerY, label = 'Núi rừng Tây Bắc' }) {
  const L = LANDSCAPES[variant] || LANDSCAPES.dawn
  const bases = [520, 590, 660, 740, 830, 930]
  const amps = [90, 110, 120, 110, 100, 70]
  return (
    <Frame viewBox="0 0 1600 1000" className={className} label={label} grain={0.14}>
      {(id) => (
        <>
          <defs>
            <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
              {L.sky.map((c, i) => (
                <stop key={i} offset={i / (L.sky.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
            <radialGradient id={`sun${id}`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={L.sun} stopOpacity="1" />
              <stop offset="0.35" stopColor={L.sun} stopOpacity="0.55" />
              <stop offset="1" stopColor={L.sun} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`mist${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={L.mist} stopOpacity="0" />
              <stop offset="0.6" stopColor={L.mist} stopOpacity="0.55" />
              <stop offset="1" stopColor={L.mist} stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1600" height="1000" fill={`url(#sky${id})`} />
          <circle cx={L.sunPos[0]} cy={L.sunPos[1]} r="320" fill={`url(#sun${id})`} />
          <circle cx={L.sunPos[0]} cy={L.sunPos[1]} r="74" fill={L.sun} opacity="0.95" />
          {L.ridges.map((c, i) => {
            const path = <path d={ridgePath(11 + i * 7, bases[i], amps[i])} fill={c} />
            const mist = i < L.ridges.length - 1 && (
              <rect x="-60" y={bases[i] - 40} width="1720" height="170" fill={`url(#mist${id})`} />
            )
            const y = layerY?.[i]
            return y ? (
              <motion.g key={i} style={{ y }}>
                {path}
                {mist}
              </motion.g>
            ) : (
              <g key={i}>
                {path}
                {mist}
              </g>
            )
          })}
        </>
      )}
    </Frame>
  )
})

/* ── TỔ ONG CẬN CẢNH ─────────────────────────────────────── */
export const Honeycomb = memo(function Honeycomb({ className, label = 'Cận cảnh bánh tổ ong đầy mật' }) {
  const r = rng(5)
  const R = 46
  const w = Math.sqrt(3) * R
  const cells = []
  for (let row = -1; row < 12; row++) {
    for (let col = -1; col < 11; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0)
      const cy = row * R * 1.5
      const k = r()
      cells.push({ cx, cy, type: k < 0.42 ? 'cap' : k < 0.9 ? 'honey' : 'empty', l: r() })
    }
  }
  const hex = (cx, cy, s) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6
      return `${f(cx + s * Math.cos(a))},${f(cy + s * Math.sin(a))}`
    }).join(' ')
  return (
    <Frame className={className} label={label}>
      {(id) => (
        <>
          <defs>
            <radialGradient id={`h${id}`} cx="0.4" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#F4C76A" />
              <stop offset="0.6" stopColor={C.honey} />
              <stop offset="1" stopColor={C.honeyDeep} />
            </radialGradient>
            <radialGradient id={`c${id}`} cx="0.4" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#FBEBC4" />
              <stop offset="1" stopColor="#E2BE78" />
            </radialGradient>
            <radialGradient id={`v${id}`} cx="0.5" cy="0.45" r="0.75">
              <stop offset="0.55" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#1A0F05" stopOpacity="0.6" />
            </radialGradient>
            <linearGradient id={`d${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={C.honeyDeep} />
              <stop offset="0.45" stopColor="#F2BE5C" />
              <stop offset="1" stopColor={C.honey} />
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill="#6E4410" />
          {cells.map((c, i) => (
            <g key={i}>
              <polygon points={hex(c.cx, c.cy, R - 2)} fill="#A3701F" />
              <polygon
                points={hex(c.cx, c.cy, R - 7)}
                fill={c.type === 'cap' ? `url(#c${id})` : c.type === 'honey' ? `url(#h${id})` : '#5A3810'}
                opacity={0.85 + c.l * 0.15}
              />
              {c.type !== 'empty' && (
                <ellipse cx={c.cx - 12} cy={c.cy - 14} rx="12" ry="6" fill="#FFF6DD" opacity={c.type === 'cap' ? 0.5 : 0.35} transform={`rotate(-30 ${c.cx - 12} ${c.cy - 14})`} />
              )}
            </g>
          ))}
          <path d="M-20 -20 L820 -20 L820 90 C 700 110, 640 70, 560 120 C 520 145, 520 260, 498 300 C 486 322, 470 322, 462 300 C 448 250, 455 150, 400 130 C 300 95, 120 140, -20 100 Z" fill={`url(#d${id})`} opacity="0.95" />
          <ellipse cx="480" cy="295" rx="6" ry="10" fill="#FFF3D0" opacity="0.6" />
          <rect width="800" height="800" fill={`url(#v${id})`} />
        </>
      )}
    </Frame>
  )
})

/* ── HOA ─────────────────────────────────────────────────── */
function Flower({ x, y, s = 1, rot = 0, color = '#FBF6EE', center = C.honeyLight }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx="0" cy="-26" rx="17" ry="27" fill={color} stroke="#D9C9B4" strokeWidth="1" transform={`rotate(${i * 72})`} />
      ))}
      <circle r="11" fill={center} />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={f(Math.cos(i) * 15)} cy={f(Math.sin(i) * 15)} r="2.2" fill={C.honeyDeep} />
      ))}
    </g>
  )
}

export const Blossom = memo(function Blossom({ className, label = 'Hoa dại vùng núi' }) {
  const r = rng(21)
  const flowers = [
    [250, 300, 1.25, 10],
    [400, 220, 1.05, -20],
    [540, 330, 1.35, 30],
    [330, 470, 1.1, 5],
    [610, 520, 0.95, -12],
    [180, 560, 0.85, 40],
    [470, 620, 1.15, 18],
  ]
  return (
    <Frame className={className} label={label}>
      {(id) => (
        <>
          <defs>
            <radialGradient id={`b${id}`} cx="0.5" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#F7F0DF" />
              <stop offset="1" stopColor="#C9CDB0" />
            </radialGradient>
          </defs>
          <rect width="800" height="800" fill={`url(#b${id})`} />
          <g stroke={C.wood} strokeWidth="7" fill="none" strokeLinecap="round">
            <path d="M-20 760 C 160 640, 260 520, 330 470 C 420 400, 480 330, 540 330" />
            <path d="M330 470 C 300 380, 280 330, 250 300" strokeWidth="5" />
            <path d="M420 410 C 410 330, 405 260, 400 220" strokeWidth="5" />
            <path d="M200 650 C 330 610, 430 630, 610 520" strokeWidth="5" />
            <path d="M330 610 C 390 620, 440 630, 470 620" strokeWidth="4" />
          </g>
          {Array.from({ length: 14 }, (_, i) => {
            const x = 120 + r() * 560
            const y = 200 + r() * 480
            return <ellipse key={i} cx={f(x)} cy={f(y)} rx="34" ry="13" fill={i % 2 ? C.forest2 : C.sage} opacity="0.9" transform={`rotate(${f(r() * 180)} ${f(x)} ${f(y)})`} />
          })}
          {flowers.map(([x, y, s, rot], i) => (
            <Flower key={i} x={x} y={y} s={s} rot={rot} color={i % 3 === 1 ? C.blush : '#FBF6EE'} />
          ))}
          {[
            [470, 160],
            [660, 420],
            [140, 420],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="12" fill={C.blush} stroke="#D9C9B4" />
          ))}
        </>
      )}
    </Frame>
  )
})

/* ── CON ONG ─────────────────────────────────────────────── */
function BeeShape({ x, y, s = 1, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx="-28" cy="-46" rx="44" ry="26" fill="#FFFFFF" opacity="0.55" stroke="#E8DCC4" transform="rotate(-25 -28 -46)" />
      <ellipse cx="22" cy="-50" rx="40" ry="24" fill="#FFFFFF" opacity="0.45" stroke="#E8DCC4" transform="rotate(20 22 -50)" />
      <ellipse cx="0" cy="0" rx="62" ry="40" fill={C.honeyLight} />
      <path d="M-24 -38 Q-30 0 -24 38 M4 -40 Q-2 0 4 40 M30 -33 Q26 0 30 33" stroke={C.charcoal} strokeWidth="13" fill="none" />
      <circle cx="-68" cy="-4" r="26" fill={C.charcoal} />
      <circle cx="-76" cy="-10" r="4" fill="#fff" />
      <path d="M-78 -26 Q-96 -64 -84 -76 M-64 -28 Q-70 -66 -54 -74" stroke={C.charcoal} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M62 0 L80 2 L62 8 Z" fill={C.charcoal} />
    </g>
  )
}

export const Bee = memo(function Bee({ className, label = 'Ong tìm mật trên hoa' }) {
  return (
    <Frame className={className} label={label}>
      {(id) => (
        <>
          <defs>
            <radialGradient id={`bg${id}`} cx="0.45" cy="0.35" r="0.85">
              <stop offset="0" stopColor="#FBF1DC" />
              <stop offset="1" stopColor="#E6C98E" />
            </radialGradient>
          </defs>
          <rect width="800" height="800" fill={`url(#bg${id})`} />
          <path d="M120 300 C 220 200, 320 260, 380 320" stroke={C.brown} strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" fill="none" opacity="0.6" />
          <g stroke={C.forest2} strokeWidth="8" fill="none">
            <path d="M560 820 C 560 720, 540 640, 520 600" />
          </g>
          <ellipse cx="610" cy="700" rx="60" ry="20" fill={C.sage} transform="rotate(-30 610 700)" />
          <Flower x={520} y={560} s={2.6} rot={10} />
          <BeeShape x={400} y={380} s={1.7} rot={-8} />
        </>
      )}
    </Frame>
  )
})

/* ── THÙNG ONG GIỮA VÙNG HOA ──────────────────────────────── */
export const Hive = memo(function Hive({ className, label = 'Những thùng ong giữa vùng hoa' }) {
  const r = rng(9)
  const box = (x, y, s) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="118" rx="100" ry="14" fill="#000" opacity="0.18" />
      <rect x="-80" y="-10" width="160" height="120" rx="4" fill="#A8794A" />
      <rect x="-80" y="40" width="160" height="4" fill="#7A5634" />
      <rect x="-92" y="-36" width="184" height="30" rx="3" fill="#7A5634" />
      <rect x="-30" y="96" width="60" height="8" rx="3" fill="#3A291D" />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={-80 + i * 32} y1="-10" x2={-80 + i * 32} y2="110" stroke="#94673C" strokeWidth="2" />
      ))}
    </g>
  )
  return (
    <Frame className={className} label={label}>
      {(id) => (
        <>
          <defs>
            <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#EED9AE" />
              <stop offset="1" stopColor="#F7EEDB" />
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill={`url(#s${id})`} />
          <path d={ridgePath(3, 330, 60, 800, 800)} fill="#A9AD8D" />
          <path d={ridgePath(8, 400, 50, 800, 800)} fill="#6F8264" />
          <path d={ridgePath(14, 470, 30, 800, 800)} fill={C.forest2} />
          <rect y="480" width="800" height="320" fill="#5C7550" />
          {Array.from({ length: 70 }, (_, i) => (
            <circle key={i} cx={f(r() * 800)} cy={f(500 + r() * 300)} r={f(3 + r() * 5)} fill={i % 4 ? '#F7F0E2' : C.honeyLight} opacity="0.9" />
          ))}
          {box(220, 520, 0.9)}
          {box(420, 560, 1.05)}
          {box(630, 530, 0.85)}
        </>
      )}
    </Frame>
  )
})

/* ── CẦU ONG (thu mật) ───────────────────────────────────── */
export const CombFrame = memo(function CombFrame({ className, label = 'Cầu ong đầy mật' }) {
  const R = 18
  const w = Math.sqrt(3) * R
  const r = rng(4)
  const cells = []
  for (let row = 0; row < 15; row++)
    for (let col = 0; col < 14; col++) {
      cells.push([170 + col * w + (row % 2 ? w / 2 : 0), 230 + row * R * 1.5, r()])
    }
  return (
    <Frame className={className} label={label}>
      {(id) => (
        <>
          <defs>
            <radialGradient id={`bg${id}`} cx="0.5" cy="0.4" r="0.8">
              <stop offset="0" stopColor="#F3E6CC" />
              <stop offset="1" stopColor="#CDB88E" />
            </radialGradient>
            <clipPath id={`cl${id}`}>
              <rect x="170" y="225" width="460" height="345" />
            </clipPath>
          </defs>
          <rect width="800" height="800" fill={`url(#bg${id})`} />
          <g transform="rotate(-6 400 400)">
            <ellipse cx="400" cy="640" rx="280" ry="24" fill="#000" opacity="0.15" />
            <rect x="140" y="170" width="520" height="430" rx="6" fill="#8A6239" />
            <rect x="120" y="150" width="560" height="34" rx="6" fill="#6E4C2C" />
            <rect x="170" y="225" width="460" height="345" fill="#B07A2A" />
            <g clipPath={`url(#cl${id})`}>
              {cells.map(([x, y, k], i) => (
                <circle key={i} cx={f(x)} cy={f(y)} r="15" fill={k < 0.7 ? '#F1D79A' : k < 0.95 ? C.honey : '#7A4D12'} stroke="#C79A4E" strokeWidth="2" />
              ))}
            </g>
            <path d="M380 570 C 380 610, 372 640, 384 662 C 392 676, 404 668, 400 640 C 396 610, 398 590, 400 570 Z" fill={C.honey} />
          </g>
        </>
      )}
    </Frame>
  )
})

/* ── GIỌT MẬT TỪ MUỖNG GỖ ────────────────────────────────── */
export const Drip = memo(function Drip({ className, label = 'Mật ong chảy từ muỗng gỗ' }) {
  return (
    <Frame className={className} label={label}>
      {(id) => (
        <>
          <defs>
            <radialGradient id={`bg${id}`} cx="0.5" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#FBF3E2" />
              <stop offset="1" stopColor="#E5CFA3" />
            </radialGradient>
            <linearGradient id={`m${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={C.honeyDeep} />
              <stop offset="0.45" stopColor="#F3C063" />
              <stop offset="1" stopColor={C.honey} />
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill={`url(#bg${id})`} />
          <g transform="rotate(-18 400 230)">
            <rect x="420" y="214" width="320" height="22" rx="11" fill="#9A6B3E" />
            <ellipse cx="370" cy="225" rx="70" ry="46" fill="#B07E4C" />
            {[-40, -20, 0, 20, 40].map((dx, i) => (
              <ellipse key={i} cx={370 + dx} cy="225" rx="9" ry={46 - Math.abs(dx) * 0.4} fill="#8A5E33" opacity="0.8" />
            ))}
            <ellipse cx="370" cy="232" rx="66" ry="40" fill={C.honey} opacity="0.75" />
          </g>
          <path d="M392 262 C 380 330, 404 400, 396 470 C 392 520, 404 560, 400 600" stroke={`url(#m${id})`} strokeWidth="22" strokeLinecap="round" fill="none" />
          <ellipse cx="400" cy="660" rx="230" ry="60" fill="#E9D7B4" />
          <ellipse cx="400" cy="650" rx="200" ry="44" fill={C.honey} />
          <ellipse cx="380" cy="640" rx="120" ry="18" fill="#F7CF7C" opacity="0.6" />
        </>
      )}
    </Frame>
  )
})

/* ── HŨ MẬT (ảnh sản phẩm minh hoạ) ──────────────────────── */
const JAR_TONES = {
  light: ['#F6D489', '#E3AE48', '#C78A2B'],
  amber: ['#EDB656', C.honey, '#8E5A12'],
  dark: ['#C27A2A', '#8A4E14', '#4E2A0A'],
  comb: ['#F3CD7A', '#D79A35', '#9C6418'],
}

export const Jar = memo(function Jar({ tone = 'amber', name = 'Mật ong', className, label }) {
  const t = JAR_TONES[tone] || JAR_TONES.amber
  return (
    <Frame className={className} label={label || `Hũ ${name} (hình minh hoạ)`} grain={0.12}>
      {(id) => (
        <>
          <defs>
            <radialGradient id={`bg${id}`} cx="0.5" cy="0.4" r="0.75">
              <stop offset="0" stopColor="#FBF6EC" />
              <stop offset="1" stopColor="#EADBC1" />
            </radialGradient>
            <linearGradient id={`h${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={t[2]} />
              <stop offset="0.3" stopColor={t[0]} />
              <stop offset="0.7" stopColor={t[1]} />
              <stop offset="1" stopColor={t[2]} />
            </linearGradient>
            <linearGradient id={`gl${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0.05" />
              <stop offset="0.2" stopColor="#fff" stopOpacity="0.45" />
              <stop offset="0.32" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.85" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.95" stopColor="#fff" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill={`url(#bg${id})`} />
          <ellipse cx="400" cy="672" rx="200" ry="26" fill="#3A291D" opacity="0.16" />
          {/* thân hũ */}
          <path d="M250 300 Q250 270 280 262 L520 262 Q550 270 550 300 L550 630 Q550 668 512 668 L288 668 Q250 668 250 630 Z" fill={`url(#h${id})`} />
          {tone === 'comb' &&
            Array.from({ length: 24 }, (_, i) => {
              const cx = 290 + (i % 6) * 44 + (Math.floor(i / 6) % 2 ? 22 : 0)
              const cy = 340 + Math.floor(i / 6) * 38
              return <circle key={i} cx={cx} cy={cy} r="17" fill="#F4D58E" stroke="#C08A34" strokeWidth="3" opacity="0.8" />
            })}
          <path d="M250 300 Q250 270 280 262 L520 262 Q550 270 550 300 L550 630 Q550 668 512 668 L288 668 Q250 668 250 630 Z" fill={`url(#gl${id})`} />
          {/* nắp vải + dây gai */}
          <path d="M262 262 C 250 230, 262 200, 300 196 L500 196 C 538 200, 550 230, 538 262 Z" fill="#E9DCC3" />
          <path d="M240 268 C 290 300, 330 250, 360 290 C 390 320, 420 262, 450 296 C 480 322, 520 270, 560 270 L 540 250 L 260 250 Z" fill="#DCCBAA" />
          <path d="M262 252 Q400 268 538 252" stroke="#8A6239" strokeWidth="5" fill="none" />
          <path d="M470 258 C 490 300, 470 330, 452 340 M478 258 C 510 290, 512 320, 500 336" stroke="#8A6239" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* nhãn */}
          <rect x="300" y="400" width="200" height="150" rx="4" fill="#F7EFE0" />
          <rect x="310" y="410" width="180" height="130" rx="2" fill="none" stroke={C.honey} strokeWidth="1.5" />
          <text x="400" y="452" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="30" fontWeight="600" letterSpacing="5" fill={C.brown}>
            MELBEE
          </text>
          <line x1="360" y1="468" x2="440" y2="468" stroke={C.honey} />
          <text x="400" y="498" textAnchor="middle" fontFamily="Be Vietnam Pro, sans-serif" fontSize="15" letterSpacing="2" fill={C.brown}>
            {name.toUpperCase().slice(0, 22)}
          </text>
          <text x="400" y="524" textAnchor="middle" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" letterSpacing="3" fill="#8D7A64">
            TÂY BẮC
          </text>
          {/* nhánh hoa */}
          <path d="M600 680 C 620 600, 640 560, 680 520" stroke={C.forest2} strokeWidth="5" fill="none" />
          <Flower x={680} y={510} s={0.9} rot={20} />
          <Flower x={628} y={590} s={0.6} rot={-10} color={C.blush} />
        </>
      )}
    </Frame>
  )
})

/* ── TÁCH TRÀ ────────────────────────────────────────────── */
export const Tea = memo(function Tea({ className, label = 'Tách trà nóng với mật ong' }) {
  return (
    <Frame className={className} label={label}>
      {(id) => (
        <>
          <defs>
            <radialGradient id={`bg${id}`} cx="0.5" cy="0.4" r="0.8">
              <stop offset="0" stopColor="#3A4A3B" />
              <stop offset="1" stopColor={C.forest} />
            </radialGradient>
          </defs>
          <rect width="800" height="800" fill={`url(#bg${id})`} />
          <ellipse cx="400" cy="560" rx="250" ry="64" fill="#EFE5D3" />
          <ellipse cx="400" cy="552" rx="200" ry="44" fill="#E2D5BE" />
          <path d="M250 380 L550 380 C 550 500, 500 560, 400 560 C 300 560, 250 500, 250 380 Z" fill="#F5EDE0" />
          <path d="M550 410 C 640 400, 640 500, 540 490" stroke="#F5EDE0" strokeWidth="22" fill="none" />
          <ellipse cx="400" cy="380" rx="150" ry="30" fill="#A7651E" />
          <ellipse cx="380" cy="376" rx="90" ry="12" fill="#D79A44" opacity="0.6" />
          <g stroke="#F5EDE0" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.45">
            <path d="M360 330 C 340 290, 380 270, 360 220" />
            <path d="M420 330 C 400 280, 450 260, 425 200" />
          </g>
          <rect x="560" y="610" width="200" height="16" rx="8" fill="#9A6B3E" transform="rotate(-12 560 610)" />
          <ellipse cx="560" cy="625" rx="34" ry="24" fill="#B07E4C" transform="rotate(-12 560 625)" />
          <path d="M120 600 C 150 560, 190 560, 210 600" stroke={C.sage} strokeWidth="5" fill="none" />
          <ellipse cx="170" cy="590" rx="30" ry="12" fill={C.sage} />
        </>
      )}
    </Frame>
  )
})

/* ── LY NƯỚC ẤM ──────────────────────────────────────────── */
export const Water = memo(function Water({ className, label = 'Ly nước ấm pha mật ong' }) {
  return (
    <Frame className={className} label={label}>
      {(id) => (
        <>
          <defs>
            <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F6EBD6" />
              <stop offset="1" stopColor="#E3CC9E" />
            </linearGradient>
            <linearGradient id={`w${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F8DFA6" stopOpacity="0.7" />
              <stop offset="1" stopColor={C.honey} stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill={`url(#bg${id})`} />
          <rect y="560" width="800" height="240" fill="#CDAE7A" opacity="0.5" />
          <ellipse cx="400" cy="640" rx="150" ry="20" fill="#3A291D" opacity="0.15" />
          <path d="M280 220 L520 220 L490 630 Q488 650 468 650 L332 650 Q312 650 310 630 Z" fill="#FFFFFF" opacity="0.35" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M292 330 L508 330 L490 628 Q488 646 470 646 L330 646 Q312 646 310 628 Z" fill={`url(#w${id})`} />
          <path d="M330 420 C 380 400, 420 460, 470 430" stroke="#FCE6B0" strokeWidth="6" fill="none" opacity="0.7" />
          <circle cx="470" cy="250" r="70" fill="#F4E27A" stroke="#E3C23E" strokeWidth="8" />
          <g stroke="#E3C23E" strokeWidth="3">
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1="470" y1="250" x2={f(470 + 60 * Math.cos((i * Math.PI) / 4))} y2={f(250 + 60 * Math.sin((i * Math.PI) / 4))} />
            ))}
          </g>
          <path d="M330 232 L345 600" stroke="#FFFFFF" strokeWidth="10" opacity="0.4" strokeLinecap="round" />
        </>
      )}
    </Frame>
  )
})

/* ── MÓN ĂN: sữa chua rưới mật ───────────────────────────── */
export const Food = memo(function Food({ className, label = 'Sữa chua rưới mật ong' }) {
  const r = rng(33)
  return (
    <Frame className={className} label={label}>
      {(id) => (
        <>
          <defs>
            <radialGradient id={`bg${id}`} cx="0.5" cy="0.45" r="0.8">
              <stop offset="0" stopColor="#E9DDC8" />
              <stop offset="1" stopColor="#B9A27A" />
            </radialGradient>
          </defs>
          <rect width="800" height="800" fill={`url(#bg${id})`} />
          <circle cx="400" cy="420" r="270" fill="#3A291D" opacity="0.12" />
          <circle cx="400" cy="400" r="260" fill="#F6EFE3" />
          <circle cx="400" cy="400" r="210" fill="#FBF8F1" />
          <path d="M260 340 C 330 300, 380 420, 440 360 C 490 310, 540 400, 560 380" stroke={C.honey} strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M280 450 C 340 420, 400 500, 470 450" stroke={C.honeyLight} strokeWidth="10" fill="none" strokeLinecap="round" />
          {Array.from({ length: 26 }, (_, i) => (
            <ellipse key={i} cx={f(300 + r() * 200)} cy={f(470 + r() * 90)} rx={f(6 + r() * 6)} ry={f(4 + r() * 3)} fill={i % 3 ? '#C89A5A' : '#8A5E33'} transform={`rotate(${f(r() * 180)} 400 400)`} />
          ))}
          {[
            [470, 300, '#7A2E3A'],
            [500, 330, '#5C2430'],
            [330, 300, '#7A2E3A'],
          ].map(([x, y, c], i) => (
            <circle key={i} cx={x} cy={y} r="16" fill={c} />
          ))}
          <Flower x={640} y={680} s={0.7} />
        </>
      )}
    </Frame>
  )
})

/* ── HỘP QUÀ ─────────────────────────────────────────────── */
export const Gift = memo(function Gift({ className, label = 'Hộp quà mật ong' }) {
  return (
    <Frame className={className} label={label}>
      {(id) => (
        <>
          <defs>
            <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F3E8D6" />
              <stop offset="1" stopColor="#D8C29C" />
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill={`url(#bg${id})`} />
          <ellipse cx="400" cy="650" rx="280" ry="30" fill="#3A291D" opacity="0.15" />
          <rect x="140" y="360" width="520" height="290" rx="6" fill="#B98F5E" />
          <rect x="140" y="360" width="520" height="40" fill="#A47A4C" />
          {[250, 400, 550].map((x, i) => (
            <g key={i}>
              <rect x={x - 62} y={250} width="124" height="150" rx="14" fill={[C.honeyLight, C.honey, '#8A4E14'][i]} />
              <rect x={x - 66} y={232} width="132" height="30" rx="6" fill="#E9DCC3" />
              <rect x={x - 40} y={300} width="80" height="56" rx="3" fill="#F7EFE0" />
            </g>
          ))}
          <rect x="140" y="400" width="520" height="250" fill="#C9A26F" />
          <rect x="380" y="400" width="40" height="250" fill="#7A5634" opacity="0.7" />
          <path d="M400 420 C 340 360, 300 420, 400 430 C 500 420, 460 360, 400 420 Z" fill="#7A5634" />
          <text x="400" y="560" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="40" fontWeight="600" letterSpacing="8" fill="#3A291D" opacity="0.8">
            MELBEE
          </text>
          <path d="M600 330 C 640 260, 680 230, 720 210" stroke={C.forest2} strokeWidth="4" fill="none" />
          <Flower x={720} y={205} s={0.7} />
        </>
      )}
    </Frame>
  )
})

/* ── BẢN ĐỒ MINH HOẠ ─────────────────────────────────────── */
export const MapArt = memo(function MapArt({ className, label = 'Bản đồ minh hoạ vùng núi Tây Bắc' }) {
  const contours = []
  const centers = [
    [300, 320, 1],
    [560, 470, 7],
    [250, 620, 13],
  ]
  centers.forEach(([cx, cy, seed]) => {
    const r = rng(seed)
    const ph = [r() * 6, r() * 6]
    for (let k = 1; k <= 9; k++) {
      let d = ''
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2
        const rad = k * 22 * (1 + 0.16 * Math.sin(a * 3 + ph[0]) + 0.08 * Math.sin(a * 5 + ph[1]))
        d += `${i ? 'L' : 'M'}${f(cx + rad * Math.cos(a))} ${f(cy + rad * 0.8 * Math.sin(a))}`
      }
      contours.push(<path key={`${seed}-${k}`} d={d + 'Z'} fill="none" stroke={C.forest2} strokeOpacity={0.12 + k * 0.025} strokeWidth="1.4" />)
    }
  })
  return (
    <Frame className={className} label={label} grain={0.12}>
      {() => (
        <>
          <rect width="800" height="800" fill="#F3EADA" />
          {contours}
          <path d="M80 140 C 200 260, 180 420, 330 470 C 470 520, 520 660, 720 760" stroke="#7E9AA0" strokeWidth="5" fill="none" opacity="0.6" />
          <path d="M120 720 C 240 640, 330 560, 410 500 C 470 450, 520 380, 600 330" stroke={C.honey} strokeWidth="3" strokeDasharray="10 10" fill="none" />
          <g transform="translate(410 500)">
            <circle r="42" fill={C.honey} opacity="0.18" />
            <circle r="22" fill={C.honey} opacity="0.3" />
            <path d="M0 -6 C -18 -6, -24 -30, 0 -50 C 24 -30, 18 -6, 0 -6 Z" transform="translate(0 0)" fill={C.brown} />
            <circle cy="-32" r="7" fill={C.honeyPale} />
          </g>
          <text x="436" y="470" fontFamily="Cormorant Garamond, serif" fontSize="34" fontStyle="italic" fill={C.brown}>
            Tây Bắc
          </text>
          <g transform="translate(680 130)" stroke={C.brown} fill="none">
            <circle r="44" strokeOpacity="0.5" />
            <path d="M0 -56 L8 0 L0 56 L-8 0 Z" fill={C.brown} fillOpacity="0.8" />
            <path d="M-56 0 L0 6 L56 0 L0 -6 Z" fill={C.brown} fillOpacity="0.3" />
          </g>
          <text x="680" y="58" textAnchor="middle" fontFamily="Be Vietnam Pro, sans-serif" fontSize="16" letterSpacing="3" fill={C.brown}>
            B
          </text>
          <rect x="24" y="24" width="752" height="752" fill="none" stroke={C.brown} strokeOpacity="0.25" />
        </>
      )}
    </Frame>
  )
})

const ARTS = {
  landscape: (p) => <Landscape variant="dawn" {...p} />,
  'landscape-dusk': (p) => <Landscape variant="dusk" {...p} />,
  honeycomb: (p) => <Honeycomb {...p} />,
  blossom: (p) => <Blossom {...p} />,
  bee: (p) => <Bee {...p} />,
  hive: (p) => <Hive {...p} />,
  frame: (p) => <CombFrame {...p} />,
  drip: (p) => <Drip {...p} />,
  jar: (p) => <Jar {...p} />,
  tea: (p) => <Tea {...p} />,
  water: (p) => <Water {...p} />,
  food: (p) => <Food {...p} />,
  gift: (p) => <Gift {...p} />,
  map: (p) => <MapArt {...p} />,
}

/** <Art kind="bee" /> — chọn hình minh hoạ theo tên */
export default function Art({ kind, ...props }) {
  const render = ARTS[kind] || ARTS.honeycomb
  return render(props)
}
