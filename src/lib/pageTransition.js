/**
 * Xong hiệu ứng chuyển trang (View Transitions) chưa? Việc nặng (lớp 3D) chờ cái này rồi mới chạy,
 * không thì nó chiếm luồng chính đúng lúc trang mới đang trồi lên → hiệu ứng giật.
 * Vào thẳng trang / tải lại / trình duyệt không hỗ trợ: xong ngay.
 * pagereveal bắn ở khung hình đầu tiên; script trang chặn hiển thị (blocking="render") nên luôn kịp nghe.
 */
export const pageTransitionDone = new Promise((resolve) => {
  if (!('onpagereveal' in window)) return resolve()
  window.addEventListener('pagereveal', (e) => (e.viewTransition ? e.viewTransition.finished.then(resolve, resolve) : resolve()), { once: true })
  setTimeout(resolve, 1500) // dự phòng
})
