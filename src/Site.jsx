import { StrictMode, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

// Font tự host, có đủ dấu tiếng Việt
import '@fontsource/noto-serif-display/400.css'
import '@fontsource/noto-serif-display/500.css'
import '@fontsource/noto-serif-display/400-italic.css'
import '@fontsource/be-vietnam-pro/300.css'
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'

import './styles/variables.css'
import './styles/globals.css'
import App from './App.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import HoneyPage from './pages/HoneyPage.jsx'
import GiftPage from './pages/GiftPage.jsx'
import StoryPage from './pages/StoryPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import { routeFor, titleFor } from './lib/router.js'
import { audioManager } from './audio/AudioManager.js'

const PAGES = { home: App, products: ProductsPage, honey: HoneyPage, gift: GiftPage, story: StoryPage, contact: ContactPage }

/**
 * Cả website là MỘT trang: bấm link trong web thì đổi nội dung tại chỗ (không tải lại trang) —
 * nhạc nền phát liền mạch (điện thoại không phải chạm lại màn hình để phát tiếp), chuyển trang tức thì.
 * Mỗi đường dẫn vẫn có file index.html riêng để vào thẳng link / mã QR / Google như cũ.
 * Hiệu ứng chuyển trang: View Transitions (src/styles/globals.css), giống lúc còn tải lại trang.
 */
function Site({ initial }) {
  const [route, setRoute] = useState(initial)

  useEffect(() => {
    history.scrollRestoration = 'manual'

    const show = (url, { push }) => {
      const next = routeFor(url)
      if (!next) return false
      // nhớ chỗ đang cuộn của trang hiện tại để bấm "quay lại" về đúng chỗ
      history.replaceState({ ...history.state, y: window.scrollY }, '')
      if (push) history.pushState({ y: 0 }, '', url.href)
      const y = push ? 0 : history.state?.y || 0
      const apply = () => {
        flushSync(() => setRoute({ ...next, key: Date.now() }))
        document.title = titleFor(next)
        audioManager.watchScenes()
        const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)))
        if (target) target.scrollIntoView({ behavior: 'instant' })
        else window.scrollTo({ top: y, behavior: 'instant' })
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (document.startViewTransition && !reduced) document.startViewTransition(apply)
      else apply()
      return true
    }

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target instanceof Element && e.target.closest('a[href]')
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
      const url = new URL(a.href, window.location.href)
      // link tới mục trong cùng trang (#hop-qua…) → để trình duyệt tự cuộn
      if (url.pathname === window.location.pathname && url.hash) return
      if (url.pathname === window.location.pathname && !url.hash) {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (show(url, { push: true })) e.preventDefault()
    }

    const onPop = () => show(new URL(window.location.href), { push: false })

    document.addEventListener('click', onClick)
    window.addEventListener('popstate', onPop)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPop)
    }
  }, [])

  const Page = PAGES[route.page] || App
  // key: mỗi lần đổi trang dựng mới hoàn toàn, như tải trang mới (hiệu ứng hiện dần chạy lại, 3D dọn sạch)
  return <Page key={route.key} id={route.honey} />
}

/** Dựng website vào #root theo đường dẫn hiện tại (data-page trên #root dự phòng khi không nhận ra đường dẫn). */
export function mount() {
  const root = document.getElementById('root')
  const initial = routeFor(window.location.href) || { page: root.dataset.page || 'home', honey: root.dataset.honey }
  document.title = titleFor(initial)
  // dựng ngay (đồng bộ) khi script chạy → trang hiện đủ trong một khung hình, không hiện từng mảnh
  flushSync(() =>
    createRoot(root).render(
      <StrictMode>
        <Site initial={{ ...initial, key: 0 }} />
      </StrictMode>
    )
  )
}
