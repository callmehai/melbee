import { useEffect, useState } from 'react'
import { useScrollProgress } from '../useScrollProgress.js'

const box = {
  position: 'fixed',
  right: 12,
  bottom: 12,
  zIndex: 400,
  width: 300,
  maxHeight: '70vh',
  overflow: 'auto',
  padding: '12px 14px',
  borderRadius: 8,
  background: 'rgba(20, 16, 12, 0.88)',
  color: '#f5ebdd',
  font: '11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
  pointerEvents: 'auto',
}

const pct = (v) => `${Math.round(v * 100)}%`

/** Bảng debug (chỉ bản dev, mở bằng ?debug=true): FPS, số hạt, hiệu ứng đang chạy, chất lượng, renderer. */
export default function DebugPanel({ engine }) {
  const [s, setS] = useState(() => engine.stats())
  const scroll = useScrollProgress()

  useEffect(() => {
    const id = setInterval(() => setS(engine.stats()), 250)
    return () => clearInterval(id)
  }, [engine])

  const particles = s.effects.reduce((n, e) => n + (e.active ? e.count : 0), 0)
  return (
    <div style={box} aria-hidden="true">
      <b style={{ color: '#e4b25a' }}>THREE.JS DEBUG</b>
      <div>
        FPS {s.fps} · chất lượng <b>{s.quality}</b> · pixelRatio {s.pixelRatio}
      </div>
      <div>
        {s.mobile ? 'mobile' : 'desktop'}
        {s.reducedMotion ? ' · reduced motion' : ''}
      </div>
      <div>
        section <b>{s.section}</b> · cuộn {pct(scroll.progress)} · v {s.scrollVelocity}px/s
      </div>
      <div>
        gió {s.wind.toFixed(2)} · phấn {pct(s.mood.pollen)}
      </div>
      <div style={{ marginTop: 6 }}>hạt/đối tượng đang hiện: {particles}</div>
      <table style={{ width: '100%', marginTop: 4, borderCollapse: 'collapse' }}>
        <tbody>
          {s.effects.map((e) => (
            <tr key={e.name} style={{ opacity: e.active ? 1 : 0.4 }}>
              <td>{e.active ? '●' : '○'}</td>
              <td>{e.name}</td>
              <td style={{ textAlign: 'right' }}>{e.count}</td>
              <td style={{ textAlign: 'right' }}>{pct(e.intensity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6 }}>
        draw calls {s.renderer.calls} · tam giác {s.renderer.triangles} · điểm {s.renderer.points} · đường {s.renderer.lines}
      </div>
      <div>
        geometries {s.renderer.geometries} · textures {s.renderer.textures} · programs {s.renderer.programs}
      </div>
    </div>
  )
}
