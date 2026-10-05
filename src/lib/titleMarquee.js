/**
 * Tiêu đề tab chạy chữ: tab trình duyệt hẹp nên tiêu đề dài bị cắt ("Vị ngọt tù…").
 * Chữ dịch từng ký tự, mỗi vòng dừng ở đầu một nhịp cho dễ đọc.
 * Thẻ <title> trong index.html giữ nguyên (cho Google, mạng xã hội); bật "giảm chuyển động" → không chạy.
 */
export function startTitleMarquee({ step = 320, pause = 2400, gap = '   •   ' } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const original = document.title
  const text = original + gap
  // tách theo ký tự thật (giữ nguyên dấu tiếng Việt dạng tổ hợp)
  const chars = Array.from(text.normalize('NFC'))
  let i = 0
  let timer = 0

  const tick = () => {
    i = (i + 1) % chars.length
    document.title = chars.slice(i).join('') + chars.slice(0, i).join('')
    timer = setTimeout(tick, i === 0 ? pause : step)
  }
  timer = setTimeout(tick, pause)

  return () => {
    clearTimeout(timer)
    document.title = original
  }
}
