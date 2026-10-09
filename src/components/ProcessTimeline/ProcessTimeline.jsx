import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Media from '../common/Media.jsx'
import { process } from '../../data/sections.js'
import './ProcessTimeline.css'

/**
 * Dòng mật đầy theo cuộn: mỗi khung hình chỉ đổi transform của thanh mật + chấm tròn (GPU tự vẽ, không tính lại
 * bố cục cả phần), bước nào mật chảy tới thì bật class is-reached khi chấm mật chạm tâm lục giác. Chỉ nghe cuộn khi phần
 * Quy trình đang ở gần màn hình.
 */
function useHoneyLine(listRef, fillRef, beadRef, reduced) {
  useEffect(() => {
    const list = listRef.current
    const fill = fillRef.current
    const bead = beadRef.current
    const steps = [...list.querySelectorAll('.step')]
    const dots = steps.map((s) => s.querySelector('.step__dot'))
    let raf = 0
    let last = -1

    const draw = () => {
      raf = 0
      const r = list.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 khi đầu danh sách ở 80% chiều cao màn hình, 1 khi cuối danh sách ở 75%
      const p = reduced ? 1 : Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.05)))
      if (Math.abs(p - last) < 0.001) return
      last = p
      const y = p * r.height // đầu dòng mật, tính từ đầu danh sách
      fill.style.transform = `scaleY(${p})`
      bead.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
      bead.classList.toggle('is-on', p > 0.005)
      // lục giác sáng đúng lúc chấm mật chạm tâm nó (đo vị trí thật, máy tính lẫn điện thoại)
      dots.forEach((d, i) => {
        const b = d.getBoundingClientRect()
        steps[i].classList.toggle('is-reached', y >= b.top + b.height / 2 - r.top)
      })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }

    let listening = false
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !listening) {
          listening = true
          window.addEventListener('scroll', schedule, { passive: true })
          window.addEventListener('resize', schedule)
          schedule()
        } else if (!e.isIntersecting && listening) {
          listening = false
          window.removeEventListener('scroll', schedule)
          window.removeEventListener('resize', schedule)
          schedule() // vẽ lần cuối: cuộn nhanh qua vẫn đầy / rỗng đúng
        }
      },
      { rootMargin: '50% 0px' }
    )
    io.observe(list)
    schedule()
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [listRef, fillRef, beadRef, reduced])
}

/**
 * 5 bước so le hai bên MỘT dòng mật chảy dọc giữa trang (điện thoại: dòng mật bên trái).
 * Dòng mật đầy dần theo cuộn, chấm mật tròn ở đầu dòng chạy theo; bước nào mật chảy tới thì sáng lên.
 */
export default function ProcessTimeline() {
  const list = useRef(null)
  const fill = useRef(null)
  const bead = useRef(null)
  useHoneyLine(list, fill, bead, useReducedMotion())

  return (
    <section id="quy-trinh" data-scene="process" className="section process" aria-labelledby="process-title">
      <div className="container">
        <SectionHeading id="process-title" eyebrow={process.eyebrow} title={process.title} align="center" />
        <ol className="timeline" ref={list}>
          <span className="timeline__track" aria-hidden="true">
            <span className="timeline__fill" ref={fill} />
            <span className="timeline__bead" ref={bead} />
          </span>
          {process.steps.map((s, i) => (
            <li key={s.title} className={`step ${i % 2 ? 'is-right' : 'is-left'}`}>
              <span className="step__dot" aria-hidden="true" />
              <Reveal
                className="step__media"
                effect={i % 2 ? 'slide-left' : 'slide-right'}
                duration={1.1}
                data-bee-perch={i % 2 ? 'top-left' : 'top-right'}
                data-bee-glow="off"
              >
                <Media src={s.image} alt={s.title} art={s.art} />
              </Reveal>
              <Reveal className="step__text" effect={i % 2 ? 'slide-right' : 'slide-left'} delay={0.12}>
                <span className="step__no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
