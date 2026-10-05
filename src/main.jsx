import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Font tự host, có đủ dấu tiếng Việt
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/be-vietnam-pro/300.css'
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'

import './styles/variables.css'
import './styles/globals.css'
import App from './App.jsx'
import { zaloIsPlaceholder } from './config/brand.js'

if (import.meta.env.DEV && zaloIsPlaceholder) {
  console.info('[Melbee] Link Zalo đang là placeholder — thay trong src/config/brand.js')
}

// tiêu đề tab ngắn cho vừa khung tab; <title> + og:title trong index.html giữ câu đầy đủ cho Google, mạng xã hội
document.title = 'Mật Ong Tây Bắc · Melbee'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
