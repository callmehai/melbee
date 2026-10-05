import { useEffect, useRef } from 'react'
import { useLockBody } from '../../hooks/useLockBody.js'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Hành vi chung cho modal/lightbox: khoá cuộn, Esc để đóng,
 * giữ focus bên trong, trả focus về chỗ cũ khi đóng.
 */
export function useDialog(onClose, extraKeys) {
  const ref = useRef(null)
  const keysRef = useRef(extraKeys)
  const closeRef = useRef(onClose)
  useEffect(() => {
    keysRef.current = extraKeys
    closeRef.current = onClose
  })
  useLockBody(true)

  useEffect(() => {
    const prev = document.activeElement
    const el = ref.current
    ;(el?.querySelector('[data-autofocus]') || el?.querySelector(FOCUSABLE))?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current()
        return
      }
      keysRef.current?.(e)
      if (e.key !== 'Tab' || !el) return
      const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus?.({ preventScroll: true })
    }
  }, [])

  return ref
}
