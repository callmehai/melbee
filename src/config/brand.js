/**
 * THÔNG TIN THƯƠNG HIỆU — sửa ở đây, mọi nút/footer tự cập nhật.
 * Nguồn: trang Facebook chính thức https://www.facebook.com/melbeetaybac
 *
 * Thông tin nào chưa có thì để null → trang hiển thị "Đang cập nhật".
 */
export const brand = {
  name: 'Mật Ong Tây Bắc',
  shortName: 'MelBee',
  tagline: 'Mật ngọt từ hoa, Tinh hoa từ rừng.',
  about: 'Mật ong Điện Biên & quà tặng đặc sản Tây Bắc',

  // Logo (huy hiệu tròn cạnh chữ). Để null → dùng biểu tượng vẽ sẵn.
  logo: 'assets/icons/logo.jpg',

  // Kênh nhắn tin đặt hàng
  facebook: 'https://www.facebook.com/melbeetaybac',
  zalo: 'https://zalo.me/0936321902',
  tiktok: 'https://www.tiktok.com/@melbeetaybac',

  // Liên hệ — null = "Đang cập nhật"
  contact: {
    phone: '093 632 19 02',
    email: 'melbeetaybac@gmail.com',
    address: 'Hà Nội',
  },

  // Chữ trên các nút
  cta: {
    order: 'Nhắn tin đặt hàng',
    facebook: 'Nhắn tin qua Facebook',
    zalo: 'Nhắn tin qua Zalo',
    consult: 'Nhắn tin tư vấn',
  },
}

/** true nếu link Zalo vẫn là placeholder */
export const zaloIsPlaceholder = /PLACEHOLDER/i.test(brand.zalo)
