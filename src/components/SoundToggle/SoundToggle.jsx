import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { audioManager } from '../../audio/AudioManager.js'
import { BEE_SIP_EVENT } from '../../lib/beeSip.js'
import './SoundToggle.css'

const LABEL = {
  off: 'Tắt',
  pending: 'Bật',
  loading: 'Đang tải',
  on: 'Bật',
  error: 'Lỗi',
}

// 6 cánh nhiều sắc hoa vùng cao: hồng tam giác mạch, vàng cải, cam đào, tím mua — bật tiếng là hoa rực màu
const PETALS = [
  ['#ffe0e8', '#e8789a'],
  ['#fff0b8', '#eaa818'],
  ['#ffe3cf', '#ee8f55'],
  ['#efe2ff', '#a98be0'],
  ['#ffe0e8', '#e8789a'],
  ['#fff0b8', '#eaa818'],
]
const DROPS = 6


/**
 * Nút nhạc nền hình bông hoa (trên thanh điều hướng). Tắt tiếng: hoa xám, cánh khép.
 * Bật: hoa nở đủ màu, chậm rãi xoay, sóng + phấn toả ra. Bấm vào hoa: con ong hút mật
 * (tắt — giọt mật bay từ hoa vào ong, hoa phai màu) hoặc nhả mật (bật — giọt mật rơi vào hoa, hoa nở).
 * Mặc định BẬT: nhạc phát ở lần bấm/chạm đầu tiên trên trang (trình duyệt chặn tự phát tiếng).
 */
export default function SoundToggle() {
  const [status, setStatus] = useState(audioManager.status)
  const [sip, setSip] = useState(null) // { mode, from, to, key }
  const ref = useRef(null)
  const timer = useRef(0)
  useEffect(() => audioManager.subscribe(setStatus), [])
  useEffect(() => {
    audioManager.autoStart()
    return () => {
      clearTimeout(timer.current)
      audioManager.dispose()
    }
  }, [])

  const on = status === 'on' || status === 'loading' || status === 'pending'
  const hint =
    status === 'pending'
      ? 'Nhạc nền sẽ phát khi bạn chạm vào trang — bấm để tắt'
      : on
        ? 'Tắt nhạc nền'
        : status === 'error'
          ? 'Không tải được âm thanh — bấm để thử lại'
          : 'Bật nhạc nền'

  const click = (e) => {
    const r = ref.current.getBoundingClientRect()
    const flower = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    // miệng ong: chuột (con trỏ ong, đầu quay trái) — chạm trên điện thoại thì lấy điểm ngay trên hoa
    const mouse = e.nativeEvent.pointerType === 'mouse' || e.detail > 0
    const bee = mouse && e.clientX ? { x: e.clientX - 12, y: e.clientY - 2 } : { x: flower.x, y: flower.y - 34 }
    const mode = on ? 'suck' : 'give'
    setSip({ mode, from: mode === 'suck' ? flower : bee, to: mode === 'suck' ? bee : flower, key: Date.now() })
    window.dispatchEvent(new CustomEvent(BEE_SIP_EVENT, { detail: { mode, x: flower.x, y: flower.y } }))
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setSip(null), 1100)
    audioManager.toggle()
  }

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={`sound-toggle is-${status} ${on ? 'is-bloom' : ''}`}
        onClick={click}
        aria-pressed={on}
        aria-label={hint}
        title={hint}
        data-cursor="cta"
      >
        <span className="sound-toggle__wave" aria-hidden="true" />
        <span className="sound-toggle__wave is-2" aria-hidden="true" />
        <span className="sound-toggle__pollen" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} style={{ '--a': `${i * 60 + 30}deg`, '--d': `${i * 0.35}s` }} />
          ))}
        </span>
        <svg className="sound-toggle__flower" viewBox="-20 -20 40 40" width="34" height="34" aria-hidden="true">
          <defs>
            {PETALS.map(([a, b], i) => (
              <radialGradient key={i} id={`petal-${i}`} cx="50%" cy="85%" r="85%">
                <stop offset="0" stopColor={b} />
                <stop offset="1" stopColor={a} />
              </radialGradient>
            ))}
            <radialGradient id="flower-heart" cx="40%" cy="35%" r="70%">
              <stop offset="0" stopColor="#ffd77d" />
              <stop offset="1" stopColor="#b97412" />
            </radialGradient>
          </defs>
          <g className="sound-toggle__petals">
            {PETALS.map((_, i) => (
              <g key={i} transform={`rotate(${i * 60})`}>
                <path className="sound-toggle__petal" d="M0 -3 C -6 -6 -6.5 -13.5 0 -17.5 C 6.5 -13.5 6 -6 0 -3 Z" fill={`url(#petal-${i})`} />
              </g>
            ))}
          </g>
          <circle r="4.6" fill="url(#flower-heart)" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} r="0.9" cx={2.6 * Math.cos((a * Math.PI) / 180)} cy={2.6 * Math.sin((a * Math.PI) / 180)} fill="#7a4a10" />
          ))}
        </svg>
        <span className="sr-only">Âm thanh · {LABEL[status]}</span>
      </button>

      {/* giọt mật bay giữa hoa và con ong (lớp cố định trên cùng, không chặn chuột) */}
      {sip &&
        createPortal(
          <span key={sip.key} className={`honey-sip is-${sip.mode}`} aria-hidden="true">
            {Array.from({ length: DROPS }, (_, i) => (
              <i
                key={i}
                style={{
                  '--x0': `${sip.from.x + (i % 3) * 3 - 3}px`,
                  '--y0': `${sip.from.y + (i % 2) * 3}px`,
                  '--x1': `${sip.to.x}px`,
                  '--y1': `${sip.to.y}px`,
                  '--arc': `${(i % 2 ? -1 : 1) * (10 + i * 3)}px`,
                  '--delay': `${i * 70}ms`,
                }}
              />
            ))}
          </span>,
          document.body
        )}
    </>
  )
}
