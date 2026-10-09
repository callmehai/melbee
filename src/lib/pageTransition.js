/**
 * Chờ hiệu ứng chuyển trang (View Transitions) đang chạy xong. Việc nặng (lớp 3D) gọi hàm này ngay trước
 * khi chạy, không thì nó chiếm luồng chính đúng lúc trang mới đang trồi lên → hiệu ứng giật.
 * Không có hiệu ứng nào đang chạy (vào thẳng trang, tải lại, trình duyệt không hỗ trợ) → xong ngay.
 */
export function afterPageTransition() {
  const vt = document.activeViewTransition
  return vt ? vt.finished.catch(() => {}) : Promise.resolve()
}
