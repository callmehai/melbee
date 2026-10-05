import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, RotateCcw, SendHorizontal, X } from 'lucide-react'
import { FacebookLogo, ZaloLogo } from '../common/BrandIcons.jsx'
import { brand } from '../../config/brand.js'
import { chatbot, reply } from '../../data/chatbot.js'
import { asset } from '../../lib/assets.js'
import './SupportWidget.css'

const EASE = [0.22, 0.8, 0.24, 1]

/** Nút gợi ý dưới câu trả lời: hỏi tiếp / cuộn tới phần trên trang / mở Zalo, Facebook. */
function Action({ a, onAsk, onGo }) {
  if (a.href) {
    return (
      <a className="support__chip is-link" href={a.href} target="_blank" rel="noopener noreferrer">
        {a.label}
      </a>
    )
  }
  return (
    <button type="button" className="support__chip" onClick={() => (a.go ? onGo(a.go) : onAsk(a.ask || a.label))}>
      {a.label}
    </button>
  )
}

/**
 * Góc phải dưới: nút Zalo + nút trợ lý tự động.
 * Trợ lý KHÔNG phải AI — chọn câu trả lời soạn sẵn theo từ khoá (src/data/chatbot.js), luôn chỉ đường sang Zalo / Facebook.
 */
export default function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [typing, setTyping] = useState(false)
  const [text, setText] = useState('')
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const toggleRef = useRef(null)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  // tin mới → cuộn xuống cuối
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    // máy có chuột: con trỏ vào ô nhập luôn; điện thoại thì không (bàn phím bật lên che khung chat)
    if (window.matchMedia('(hover: hover)').matches) setTimeout(() => inputRef.current?.focus(), 250)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const ask = (q) => {
    const question = q.trim()
    if (!question || typing) return
    setMsgs((m) => [...m, { from: 'me', text: question }])
    setText('')
    setTyping(true)
    clearTimeout(timer.current)
    // "đang gõ…" một nhịp ngắn cho tự nhiên — câu trả lời thật ra có sẵn ngay
    timer.current = setTimeout(
      () => {
        setMsgs((m) => [...m, { from: 'bot', ...reply(question) }])
        setTyping(false)
      },
      500 + Math.min(question.length * 10, 500)
    )
  }

  const go = (sel) => {
    document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (window.matchMedia('(max-width: 560px)').matches) setOpen(false) // điện thoại: khung chat che trang
  }

  const restart = () => {
    clearTimeout(timer.current)
    setTyping(false)
    setMsgs([])
  }

  return (
    <aside className={`support ${open ? 'is-open' : ''}`} aria-label="Liên hệ nhanh">
      <AnimatePresence>
        {open && (
          <motion.section
            className="support__panel"
            role="dialog"
            aria-label="Trợ lý tự động MelBee"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <header className="support__head">
              <img className="support__avatar" src={asset(brand.logo)} alt="" />
              <div>
                <h2>{chatbot.title}</h2>
                <p>{chatbot.subtitle}</p>
              </div>
              <button type="button" className="support__close" onClick={() => setOpen(false)} aria-label="Đóng khung chat">
                <X size={20} />
              </button>
            </header>

            <div className="support__list" ref={listRef} aria-live="polite">
              <p className="support__eyebrow">Hỏi nhanh · trả lời liền</p>
              <div className="support__msg is-bot">{chatbot.greeting}</div>
              {!msgs.length && (
                <div className="support__chips">
                  {chatbot.suggestions.map((s) => (
                    <button type="button" key={s} className="support__chip" onClick={() => ask(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE }}>
                  <div className={`support__msg is-${m.from}`}>{m.text}</div>
                  {m.from === 'bot' && i === msgs.length - 1 && (
                    <div className="support__chips">
                      {m.actions.map((a) => (
                        <Action key={a.label} a={a} onAsk={ask} onGo={go} />
                      ))}
                      <button type="button" className="support__chip is-ghost" onClick={restart}>
                        <RotateCcw size={13} /> Bắt đầu lại
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <div className="support__msg is-bot is-typing" aria-label="Đang trả lời">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            <footer className="support__foot">
              <div className="support__links">
                <a href={brand.zalo} target="_blank" rel="noopener noreferrer">
                  <ZaloLogo size={20} /> Chat qua Zalo
                </a>
                <a href={brand.facebook} target="_blank" rel="noopener noreferrer">
                  <FacebookLogo size={20} /> Facebook
                </a>
              </div>
              <form
                className="support__form"
                onSubmit={(e) => {
                  e.preventDefault()
                  ask(text)
                }}
              >
                <input ref={inputRef} type="text" value={text} maxLength={200} onChange={(e) => setText(e.target.value)} placeholder="Nhập câu hỏi của bạn…" aria-label="Câu hỏi" />
                <button type="submit" disabled={!text.trim() || typing} aria-label="Gửi câu hỏi">
                  <SendHorizontal size={18} />
                </button>
              </form>
              <p className="support__note">{chatbot.footnote}</p>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="support__dock">
        <a className="support__btn is-zalo" href={brand.zalo} target="_blank" rel="noopener noreferrer" aria-label="Nhắn tin qua Zalo" data-cursor="cta">
          <ZaloLogo size={40} bare />
          <span className="support__tip">Nhắn Zalo</span>
        </a>
        <button
          ref={toggleRef}
          type="button"
          className={`support__btn is-chat ${open ? 'is-open' : ''}`}
          aria-expanded={open}
          aria-label={open ? 'Đóng khung chat' : 'Mở trợ lý hỏi nhanh'}
          onClick={() => setOpen((o) => !o)}
          data-cursor="cta"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? 'x' : 'chat'} initial={{ rotate: -60, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 60, opacity: 0 }} transition={{ duration: 0.2 }}>
              {open ? <X size={26} /> : <MessageCircle size={26} />}
            </motion.span>
          </AnimatePresence>
          {!open && <span className="support__tip">Hỏi nhanh</span>}
        </button>
      </div>
    </aside>
  )
}
