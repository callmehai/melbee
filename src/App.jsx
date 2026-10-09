import { MotionConfig } from 'framer-motion'
import Navbar from './components/Navbar/Navbar.jsx'
import Hero from './components/Hero/Hero.jsx'
import Intro from './components/Intro/Intro.jsx'
import ProductShowcase from './components/ProductShowcase/ProductShowcase.jsx'
import { GiftSection } from './components/GiftSet/GiftSet.jsx'
import BrandStory from './components/BrandStory/BrandStory.jsx'
import OriginSection from './components/OriginSection/OriginSection.jsx'
import ProcessTimeline from './components/ProcessTimeline/ProcessTimeline.jsx'
import WhyUs from './components/WhyUs/WhyUs.jsx'
import Lifestyle from './components/Lifestyle/Lifestyle.jsx'
import Gallery from './components/Gallery/Gallery.jsx'
import Testimonials from './components/Testimonials/Testimonials.jsx'
import CTA from './components/CTA/CTA.jsx'
import Footer from './components/Footer/Footer.jsx'
import Cursor from './components/Cursor/Cursor.jsx'
import SupportWidget from './components/SupportWidget/SupportWidget.jsx'
import ThreeCanvas from './three/ThreeCanvas.jsx'

/**
 * Thứ tự các phần trên trang — đổi thứ tự / ẩn bớt ngay tại đây.
 * Nội dung chữ & ảnh nằm trong src/data và src/config.
 *
 * Trang kể một ngày xuân ở Điện Biên: bình minh trên núi (Hero) → vùng đất & đồng hoa
 * (Nguồn gốc) → giọt mật → người nuôi ong → quy trình → hũ mật → chiều tà (CTA).
 * Lifestyle, Gallery, Testimonials tự ẩn cho tới khi có ảnh / chia sẻ thật.
 */
export default function App() {
  return (
    // reducedMotion="user": tôn trọng cài đặt "giảm chuyển động" của hệ điều hành
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#noi-dung">
        Bỏ qua tới nội dung
      </a>
      <Navbar />
      <main id="noi-dung">
        <Hero />
        <OriginSection />
        <Intro />
        <BrandStory />
        <ProcessTimeline />
        <ProductShowcase />
        <GiftSection />
        <WhyUs />
        <Lifestyle />
        <Gallery />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      {/* góc phải dưới: nút Zalo + trợ lý hỏi nhanh (câu trả lời soạn sẵn, không phải AI) */}
      <SupportWidget />
      {/* lớp Three.js dùng chung cho cả trang — tự ẩn nếu không có WebGL */}
      <ThreeCanvas />
      <Cursor />
    </MotionConfig>
  )
}
