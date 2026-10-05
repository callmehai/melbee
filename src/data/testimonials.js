/**
 * CHIA SẺ TỪ KHÁCH HÀNG
 *
 * ⚠️ Hiện là NỘI DUNG MẪU (sample: true) → KHÔNG hiện trên trang; section "Khách hàng" tự ẩn.
 * MelBee chưa mở bán nên chưa có đánh giá thật. Khi có chia sẻ thật (được khách đồng ý):
 * thay name / role / quote và XOÁ dòng sample: true → section tự hiện lại.
 * Không bịa tên hoặc nhận xét rồi bỏ dòng sample.
 *
 * name: tên hiển thị · role: thông tin ngắn (tuỳ chọn) · quote: nội dung chia sẻ
 */
export const testimonials = [
  {
    id: 't1',
    sample: true,
    name: 'Khách hàng tại Hà Nội',
    role: 'Mua làm quà biếu',
    quote: 'Hũ mật đóng gói chỉn chu, nhãn đẹp, đem biếu ông bà ai cũng hỏi mua ở đâu.',
  },
  {
    id: 't2',
    sample: true,
    name: 'Khách hàng tại Điện Biên',
    role: 'Dùng hằng ngày',
    quote: 'Sáng nào cũng pha một thìa với nước ấm. Thích nhất là biết rõ mật đến từ vùng nào.',
  },
  {
    id: 't3',
    sample: true,
    name: 'Khách hàng tại TP. Hồ Chí Minh',
    role: 'Đặt qua Facebook',
    quote: 'Nhắn tin là được tư vấn tận tình, giao hàng gọn gàng. Sẽ quay lại mua làm quà Tết.',
  },
]
