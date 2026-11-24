import { memo, useId } from 'react'

/**
 * Tranh nét một màu nhũ vàng trên nền nâu trầm — cùng ngôn ngữ với hoạ tiết hoa + ong in trên nắp hộp quà.
 * Dùng cho 5 bước Quy trình (thay bộ tranh phẳng nhiều màu kiểu hoạt hình cũ).
 * Khung 800×800, nội dung nằm trong dải giữa y 110–690 → cắt 4:3 (máy tính) hay 1:1 (điện thoại) đều đủ.
 */

const GOLD = ['#F4DDA0', '#D9AA52', '#B07A26']

function LineFrame({ className, label, children }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <defs>
        <radialGradient id={`bg${id}`} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="#3d2b1d" />
          <stop offset="1" stopColor="#24180f" />
        </radialGradient>
        <linearGradient id={`au${id}`} x1="120" y1="120" x2="680" y2="680" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={GOLD[0]} />
          <stop offset="0.5" stopColor={GOLD[1]} />
          <stop offset="0.78" stopColor={GOLD[0]} />
          <stop offset="1" stopColor={GOLD[2]} />
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill={`url(#bg${id})`} />
      <g fill="none" stroke={`url(#au${id})`} strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round">
        {children(`url(#au${id})`, id)}
      </g>
    </svg>
  )
}

/* cánh hoa ban: thuôn dài, gân giữa + vài gân phụ */
function Petal({ rot, len = 130 }) {
  const w = len * 0.42
  return (
    <g transform={`rotate(${rot})`}>
      <path d={`M0 -14 C ${-w} ${-len * 0.3}, ${-w * 1.05} ${-len * 0.85}, 0 ${-len} C ${w * 1.05} ${-len * 0.85}, ${w} ${-len * 0.3}, 0 -14 Z`} />
      <path d={`M0 -22 L0 ${-len * 0.86}`} strokeWidth="1.6" opacity="0.8" />
      <path d={`M0 ${-len * 0.42} L${-w * 0.42} ${-len * 0.66} M0 ${-len * 0.56} L${w * 0.42} ${-len * 0.78}`} strokeWidth="1.4" opacity="0.6" />
    </g>
  )
}

/* lá ban: hai thuỳ như cánh bướm */
function BanLeaf({ x, y, s = 1, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C -58 -8 -92 -66 -64 -108 C -44 -134 -12 -122 0 -96 C 12 -122 44 -134 64 -108 C 92 -66 58 -8 0 0 Z" />
      <path d="M0 -6 L0 -92" strokeWidth="1.6" opacity="0.7" />
    </g>
  )
}

export const LineBlossom = memo(function LineBlossom({ className, label = 'Hoa ban nở trên cành' }) {
  return (
    <LineFrame className={className} label={label}>
        {() => (
          <>
            {/* cành */}
            <path d="M96 700 C 210 640, 270 560, 352 452" />
            <path d="M232 604 C 300 610, 360 640, 430 640" />
            <BanLeaf x={196} y={636} s={0.9} rot={-62} />
            <BanLeaf x={404} y={642} s={0.72} rot={64} />
            {/* hoa chính */}
            <g transform="translate(400 380) scale(1.25)">
              {[0, 72, 144, 216, 288].map((r) => (
                <Petal key={r} rot={r + 8} />
              ))}
              {/* nhị cong */}
              {[-70, -35, 0, 35, 70].map((a, i) => (
                <g key={a} transform={`rotate(${a + 180})`}>
                  <path d={`M0 0 C 10 ${-40 - i * 4}, -8 ${-70 - i * 6}, 4 ${-98 - (i % 2) * 14}`} strokeWidth="1.6" />
                  <circle cx="4" cy={-104 - (i % 2) * 14} r="5" strokeWidth="1.8" />
                </g>
              ))}
              <circle r="9" strokeWidth="2" />
            </g>
            {/* nụ */}
            <path d="M560 560 C 600 520, 620 480, 640 452" />
            <path d="M640 452 C 612 420, 622 380, 650 362 C 676 384, 678 424, 640 452 Z" />
            <path d="M646 372 L642 444" strokeWidth="1.4" opacity="0.7" />
            {/* bụi phấn */}
            {[
              [170, 250],
              [610, 230],
              [660, 300],
              [140, 420],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="2.6" strokeWidth="2" />
            ))}
          </>
        )}
    </LineFrame>
  )
})

export const LineBee = memo(function LineBee({ className, label = 'Ong bay tìm mật' }) {
  return (
    <LineFrame className={className} label={label}>
        {() => (
          <>
            {/* đường bay chấm */}
            <path d="M110 600 C 180 520, 250 640, 320 560 S 330 470, 290 470" strokeDasharray="1 16" strokeWidth="4" />
            <g transform="translate(450 380) rotate(-14)">
              {/* cánh */}
              <path d="M-10 -46 C -60 -150, -150 -150, -128 -88 C -110 -50, -50 -40, -10 -46 Z" />
              <path d="M-26 -52 C -70 -96, -96 -110, -112 -100" strokeWidth="1.4" opacity="0.6" />
              <path d="M20 -48 C 30 -160, 124 -170, 116 -104 C 110 -62, 60 -46, 20 -48 Z" />
              <path d="M28 -58 C 50 -110, 80 -130, 100 -124" strokeWidth="1.4" opacity="0.6" />
              {/* thân */}
              <ellipse cx="20" cy="0" rx="112" ry="62" />
              <path d="M-26 -58 C -40 -20, -40 20, -26 58" />
              <path d="M18 -62 C 4 -20, 4 20, 18 62" />
              <path d="M62 -54 C 50 -18, 50 18, 62 54" />
              <path d="M104 -32 C 96 -10, 96 10, 104 32" />
              <path d="M132 0 L156 4" />
              {/* đầu */}
              <circle cx="-118" cy="10" r="40" />
              <circle cx="-132" cy="2" r="5" strokeWidth="2.4" />
              <path d="M-128 -28 C -150 -70, -170 -84, -186 -80" />
              <path d="M-108 -28 C -112 -74, -124 -96, -138 -104" />
              <circle cx="-190" cy="-80" r="5" />
              <circle cx="-141" cy="-108" r="5" />
            </g>
            {/* bông hoa nhỏ */}
            <g transform="translate(600 610)">
              {[0, 72, 144, 216, 288].map((r) => (
                <Petal key={r} rot={r} len={58} />
              ))}
              <circle r="5" strokeWidth="2" />
            </g>
            <path d="M600 662 C 600 690, 590 700, 580 712" />
          </>
        )}
    </LineFrame>
  )
})

/* lục giác đỉnh nhọn (cầu ong dựng đứng) */
const hex = (cx, cy, r) => {
  const p = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6
    return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`
  })
  return `M${p.join(' L')} Z`
}

export const LineFrameComb = memo(function LineFrameComb({ className, label = 'Cầu ong đã vít nắp sáp' }) {
  const cells = []
  const r = 25
  const w = r * Math.sqrt(3)
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cx = 238 + col * w + (row % 2 ? w / 2 : 0)
      const cy = 262 + row * r * 1.5
      // vùng mật đã vít nắp: khối giữa, mép trên/dưới còn ô trống
      const capped = Math.hypot((cx - 400) / 1.25, cy - 400) < 120 + ((col * 7 + row * 3) % 5) * 8
      cells.push({ cx, cy, capped, k: `${row}-${col}` })
    }
  }
  return (
    <LineFrame className={className} label={label}>
        {(gold, id) => (
          <>
            <defs>
              <clipPath id={`comb${id}`}>
                <rect x="218" y="238" width="364" height="324" />
              </clipPath>
            </defs>
            {/* khung gỗ + tai treo */}
            <path d="M160 214 L640 214" strokeWidth="5" />
            <rect x="196" y="214" width="408" height="370" rx="4" />
            <rect x="218" y="238" width="364" height="324" rx="2" strokeWidth="2" opacity="0.8" />
            <g clipPath={`url(#comb${id})`}>
              {cells.map((c) => (
                <path key={c.k} d={hex(c.cx, c.cy, r - 2.5)} strokeWidth="1.6" fill={c.capped ? gold : 'none'} fillOpacity={c.capped ? 0.16 : 0} />
              ))}
            </g>
            {/* giọt mật trên mép dưới */}
            <path d="M360 584 C 360 604, 352 616, 352 628 A 8 8 0 0 0 368 628 C 368 616, 360 604, 360 584" />
            <path d="M452 584 C 452 596, 448 604, 448 610 A 5 5 0 0 0 458 610 C 458 604, 452 596, 452 584" strokeWidth="2.4" />
          </>
        )}
    </LineFrame>
  )
})

export const LineDipper = memo(function LineDipper({ className, label = 'Mật chảy từ thìa gỗ xuống chén' }) {
  return (
    <LineFrame className={className} label={label}>
        {(gold) => (
          <>
            {/* thìa gỗ lấy mật: cán + đầu có rãnh */}
            <g transform="translate(400 300) rotate(-36)">
              <path d="M70 -9 L330 -7 C 344 -7, 344 7, 330 7 L70 9" />
              <circle cx="318" cy="0" r="4" strokeWidth="2" />
              <path d="M-74 -34 C -86 -34, -90 34, -74 34 L58 30 C 72 30, 72 -30, 58 -30 Z" />
              {[-48, -20, 8, 36].map((x) => (
                <path key={x} d={`M${x} -32 C ${x - 8} -12, ${x - 8} 12, ${x} 32`} strokeWidth="2" />
              ))}
              <path d="M58 -14 L72 -10 M58 14 L72 10" strokeWidth="2" />
            </g>
            {/* sợi mật */}
            <path d="M372 352 C 368 400, 386 430, 384 476 C 383 506, 380 524, 380 546" />
            <path d="M384 432 C 392 456, 398 470, 396 488 A 7 7 0 0 1 382 488" strokeWidth="2" opacity="0.7" />
            {/* chén */}
            <ellipse cx="400" cy="560" rx="150" ry="28" />
            <ellipse cx="400" cy="566" rx="122" ry="18" fill={gold} fillOpacity="0.14" strokeWidth="1.6" />
            <path d="M250 560 C 258 640, 320 680, 400 680 C 480 680, 542 640, 550 560" />
            <path d="M350 682 L344 704 L456 704 L450 682" strokeWidth="2.4" />
            <path d="M290 606 C 310 640, 340 656, 372 662" strokeWidth="1.6" opacity="0.6" />
          </>
        )}
    </LineFrame>
  )
})

export const LineJar = memo(function LineJar({ className, label = 'Lọ mật ong lục giác MelBee' }) {
  return (
    <LineFrame className={className} label={label}>
        {(gold) => (
          <>
            {/* nắp */}
            <path d="M318 186 L482 186 L488 246 L312 246 Z" />
            {[200, 214, 228].map((y) => (
              <path key={y} d={`M316 ${y} L484 ${y}`} strokeWidth="1.4" opacity="0.6" />
            ))}
            {/* cổ + vai lọ lục giác */}
            <path d="M320 246 L320 262 C 280 268, 262 284, 258 304 M480 246 L480 262 C 520 268, 538 284, 542 304" />
            <path d="M340 262 L460 262" strokeWidth="2" opacity="0.7" />
            {/* thân: mặt trước + hai mặt bên */}
            <path d="M258 304 L258 632 C 258 650, 270 660, 290 660 L510 660 C 530 660, 542 650, 542 632 L542 304" />
            <path d="M318 296 L318 662 M482 296 L482 662" strokeWidth="2" opacity="0.75" />
            {/* mật trong lọ */}
            <path d="M262 352 L538 352 L538 630 C 538 646, 528 654, 510 654 L290 654 C 272 654, 262 646, 262 630 Z" fill={gold} fillOpacity="0.12" stroke="none" />
            <path d="M262 352 L538 352" strokeWidth="1.6" opacity="0.6" />
            {/* nhãn */}
            <rect x="330" y="404" width="140" height="150" rx="3" strokeWidth="2.2" />
            <text x="400" y="472" textAnchor="middle" fill={gold} stroke="none" fontFamily="'Noto Serif Display', Georgia, serif" fontSize="30" letterSpacing="1">
              MelBee
            </text>
            <path d="M356 490 L444 490" strokeWidth="1.4" opacity="0.7" />
            <text x="400" y="518" textAnchor="middle" fill={gold} stroke="none" fontFamily="'Be Vietnam Pro', sans-serif" fontSize="11" letterSpacing="3">
              TÂY BẮC
            </text>
            {/* ánh thuỷ tinh */}
            <path d="M282 330 L282 420 M294 330 L294 370" strokeWidth="2" opacity="0.55" />
            {/* nhành hoa cạnh lọ */}
            <path d="M600 700 C 600 640, 610 600, 630 560" />
            <g transform="translate(632 530)">
              {[0, 72, 144, 216, 288].map((r) => (
                <Petal key={r} rot={r + 20} len={52} />
              ))}
              <circle r="4" strokeWidth="2" />
            </g>
            <BanLeaf x={604} y={650} s={0.5} rot={-58} />
            <path d="M200 690 L640 690" strokeWidth="1.6" opacity="0.5" />
          </>
        )}
    </LineFrame>
  )
})
