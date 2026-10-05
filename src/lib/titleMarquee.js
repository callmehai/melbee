/**
 * Tiêu đề tab chạy chữ: tab trình duyệt hẹp nên tiêu đề dài bị cắt ("Vị ngọt tù…").
 * Chữ dịch từng ký tự (tiêu đề tab không cuộn được mượt hơn thế), mỗi vòng dừng ở đầu một nhịp.
 *
 * Nhịp đếm chạy trong Web Worker: Chrome dồn setTimeout của tab nền còn ~1 lần/giây
 * (có lúc 1 lần/phút) làm chữ đứng rồi nhảy cóc; hẹn giờ trong worker không bị dồn như vậy.
 * Thẻ <title> trong index.html giữ nguyên (cho Google, mạng xã hội); bật "giảm chuyển động" → không chạy.
 */
export function startTitleMarquee({ step = 180, pause = 2000, gap = '   •   ' } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const original = document.title
  // tách theo ký tự thật (giữ nguyên dấu tiếng Việt)
  const chars = Array.from((original + gap).normalize('NFC'))
  let i = 0
  let wait = pause // số ms còn phải đứng yên ở đầu vòng

  const tick = (dt) => {
    if (wait > 0) {
      wait -= dt
      return
    }
    i = (i + 1) % chars.length
    document.title = chars.slice(i).join('') + chars.slice(0, i).join('')
    if (i === 0) wait = pause
  }

  let stop
  try {
    const src = `setInterval(() => postMessage(0), ${step})`
    const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }))
    const worker = new Worker(url)
    worker.onmessage = () => tick(step)
    stop = () => {
      worker.terminate()
      URL.revokeObjectURL(url)
    }
  } catch {
    const id = setInterval(() => tick(step), step)
    stop = () => clearInterval(id)
  }

  return () => {
    stop()
    document.title = original
  }
}
