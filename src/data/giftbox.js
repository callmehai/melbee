/**
 * HỘP QUÀ — người xem tự gói một hộp: kiểu hộp → màu → mật bên trong → thiệp.
 * Không có giỏ hàng: bước cuối chép sẵn lời nhắn mô tả hộp, khách dán vào Facebook / Zalo.
 *
 * Hộp lục giác như một ô tổ ong, hũ lục giác như hũ thật của MelBee.
 * ⚠️ PHÍ HỘP LÀ GIÁ TẠM để duyệt giao diện, chưa phải giá bán.
 */
export const giftSection = {
  eyebrow: 'Hộp quà',
  title: ['Gói một hộp quà', 'mang theo núi rừng'],
  subtitle:
    'Chọn kiểu hộp, màu hộp, loại mật bên trong và vài dòng trên thiệp. Gửi mẫu hộp cho MelBee qua tin nhắn để được tư vấn và báo giá.',
  hint: { mouse: 'Kéo để xoay mọi hướng · bấm để mở nắp', touch: 'Vuốt để xoay · chạm để mở nắp' },
  note: 'Tạm tính theo giá tham khảo — MelBee xác nhận giá khi nhắn tin.',
}

// slots: số hũ hộp đựng vừa
export const boxSizes = [
  { id: 'single', name: 'Hộp đơn', note: 'Vừa 1 hũ', slots: 1, fee: '45.000 ₫' }, // giá tạm
  { id: 'trio', name: 'Hộp ba', note: 'Vừa 3 hũ', slots: 3, fee: '85.000 ₫' }, // giá tạm
]

// paper: giấy ngoài · foil: nhũ in (logo, dãy núi) · inside: lòng hộp, lòng nắp · tray: khay tổ ong · ribbon: ruy băng satin
export const boxColors = [
  { id: 'kem', name: 'Kem sáp ong', paper: '#efe2c2', foil: '#a8701c', inside: '#f7eedb', tray: '#c98d32', ribbon: '#2f4a37' },
  { id: 'rung', name: 'Xanh rừng', paper: '#2c4434', foil: '#d9ae58', inside: '#f2e8d0', tray: '#c98d32', ribbon: '#d8aa4e' },
  { id: 'mat', name: 'Nâu mật', paper: '#6e4119', foil: '#f0cd80', inside: '#f3e7cb', tray: '#d49a3c', ribbon: '#f1e4c6' },
]

// sản phẩm đóng hũ đặt được vào hộp (id trong src/data/products.js)
export const jarProducts = ['honey-01', 'honey-02']

// màu mật trong hũ theo `tone` của sản phẩm
export const honeyTones = {
  light: { deep: '#b47c22', mid: '#e8b951', light: '#fbe6a4' },
  amber: { deep: '#9c5a14', mid: '#d8962f', light: '#f6cd72' },
  dark: { deep: '#5a2c08', mid: '#94561a', light: '#d4953e' },
}

export const cardLimit = 140
