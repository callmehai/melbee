import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Font tự host, đủ dấu tiếng Việt — như trang chủ
import '@fontsource/noto-serif-display/400.css'
import '@fontsource/noto-serif-display/500.css'
import '@fontsource/noto-serif-display/400-italic.css'
import '@fontsource/be-vietnam-pro/300.css'
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'

import '../styles/variables.css'
import '../styles/globals.css'
import ProductsPage from './ProductsPage.jsx'
import HoneyPage from './HoneyPage.jsx'
import GiftPage from './GiftPage.jsx'
import StoryPage from './StoryPage.jsx'
import ContactPage from './ContactPage.jsx'

/**
 * Điểm vào chung của các trang con. Mỗi file HTML khai trang của nó trên #root:
 *   <div id="root" data-page="honey" data-honey="hoa-ban">
 */
const PAGES = { products: ProductsPage, honey: HoneyPage, gift: GiftPage, story: StoryPage, contact: ContactPage }

const root = document.getElementById('root')
const Page = PAGES[root.dataset.page] || ProductsPage

createRoot(root).render(
  <StrictMode>
    <Page id={root.dataset.honey} />
  </StrictMode>
)
