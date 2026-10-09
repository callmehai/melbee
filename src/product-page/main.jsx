import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// trang mở từ mã QR trên hộp quà: nhẹ, không Three.js, không nhạc — chỉ font + nội dung
import '@fontsource/noto-serif-display/400.css'
import '@fontsource/noto-serif-display/400-italic.css'
import '@fontsource/be-vietnam-pro/300.css'
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'

import '../styles/variables.css'
import '../styles/globals.css'
import ProductPage from './ProductPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProductPage />
  </StrictMode>
)
