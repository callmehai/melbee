/**
 * THÔNG TIN THƯƠNG HIỆU — sửa ở đây, mọi nút/footer tự cập nhật.
 *
 * Thông tin nào chưa có thì để null → trang hiển thị "Đang cập nhật".
 */
export const brand = {
  name: 'Mật Ong Tây Bắc',
  shortName: 'Melbee',
  tagline: 'Vị ngọt từ núi rừng.',

  // Logo: để null sẽ dùng logo chữ. Muốn dùng ảnh: 'assets/icons/logo.svg'
  logo: null,

  // Kênh nhắn tin đặt hàng
  facebook: 'https://www.facebook.com/melbeetaybac',
  // ⚠️ THAY bằng link Zalo thật, ví dụ 'https://zalo.me/0912345678'
  zalo: 'https://zalo.me/PLACEHOLDER',

  // Liên hệ — null = "Đang cập nhật"
  contact: {
    phone: null, // ví dụ '0912 345 678'
    email: null, // ví dụ 'lienhe@melbee.vn'
    address: null, // ví dụ 'Số 1, đường ..., Sơn La'
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
