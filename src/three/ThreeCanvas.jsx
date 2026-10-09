import { Component, lazy, Suspense, useEffect, useState } from 'react'
import { THREE_CONFIG } from './config.js'
import { hasWebGL } from './utils/performance.js'
import { setThreeStatus } from './store.js'
import { afterPageTransition } from '../lib/pageTransition.js'

// Three.js (~150KB gzip) nằm ở chunk riêng, chỉ tải sau khi trang đã hiện xong
const ThreeScene = lazy(() => import('./ThreeScene.jsx'))

/** Lỗi tải/khởi tạo WebGL → ẩn lớp Three.js, trang vẫn chạy như cũ. */
class Guard extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    setThreeStatus('unavailable')
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Điểm vào lớp Three.js: kiểm tra WebGL, chờ trang rảnh rồi mới tải; màn cảm ứng chạy chế độ nhẹ. */
export default function ThreeCanvas() {
  const [ready, setReady] = useState(false)
  // màn cảm ứng (điện thoại, máy tính bảng): chế độ nhẹ — chỉ bánh tổ 3D. Thử bản đầy đủ: thêm ?three=on vào URL
  const [lite] = useState(() => {
    const touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const forced = new URLSearchParams(window.location.search).get('three') === 'on'
    return touch && !THREE_CONFIG.touchDevices && !forced
  })

  useEffect(() => {
    if (!THREE_CONFIG.enabled || !hasWebGL()) {
      setThreeStatus('unavailable')
      return
    }
    let idleId = 0
    let timer = 0
    let alive = true
    // chờ hiệu ứng chuyển trang chạy xong rồi mới khởi động 3D (khởi động chiếm luồng chính ~0,3 giây)
    const go = () =>
      afterPageTransition().then(() => {
        if (!alive) return
        const idle = window.requestIdleCallback
        if (idle) idleId = idle(() => setReady(true), { timeout: 1500 })
        else timer = setTimeout(() => setReady(true), 300)
      })
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
    return () => {
      alive = false
      window.removeEventListener('load', go)
      if (idleId) window.cancelIdleCallback(idleId)
      clearTimeout(timer)
    }
  }, [])

  if (!ready) return null
  return (
    <Guard>
      <Suspense fallback={null}>
        <ThreeScene lite={lite} />
      </Suspense>
    </Guard>
  )
}
