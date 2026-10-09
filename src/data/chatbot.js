import { brand } from '../config/brand.js'
import { products } from './products.js'
import { hasAsset } from '../lib/assets.js'
import { boxSizes } from './giftbox.js'

/**
 * TRỢ LÝ TỰ ĐỘNG (nút chat góc phải) — KHÔNG phải AI: câu trả lời soạn sẵn, chọn theo từ khoá.
 * Thêm một câu trả lời = thêm một object vào `intents` (hoà điểm thì mục đứng trước thắng):
 *   keys:    từ khoá (gõ có dấu hay không dấu đều được; khớp càng nhiều từ khoá càng được ưu tiên)
 *   answer:  chuỗi, hoặc hàm trả về chuỗi (để lấy giá / liên hệ mới nhất từ dữ liệu trang)
 *   actions: nút gợi ý dưới câu trả lời — { label, ask } hỏi tiếp · { label, go: 'trang/' } mở trang đó của website ·
 *            { label, href } mở link (Zalo, Facebook)
 *
 * ⚠️ Chỉ viết điều MelBee thật sự làm / đã công bố. Chưa có chính sách (phí ship, thanh toán…) thì nói
 *    rõ là MelBee báo khi nhắn tin. Không viết công dụng chữa bệnh.
 */

const zalo = { label: 'Nhắn Zalo', href: brand.zalo }
const facebook = { label: 'Nhắn Facebook', href: brand.facebook }
const shown = () => products.filter((p) => hasAsset(p.image))

export const chatbot = {
  title: `${brand.shortName} xin chào!`,
  subtitle: 'Trợ lý tự động · trả lời có sẵn',
  greeting:
    'Mình là trợ lý tự động của MelBee. Bạn muốn xem mật ong, làm hộp quà hay hỏi cách đặt hàng? Chọn một câu bên dưới hoặc gõ câu hỏi nhé.',
  suggestions: ['Có những loại mật nào, giá bao nhiêu?', 'Mình muốn làm hộp quà', 'Đặt hàng thế nào?', 'Phí giao hàng?', 'Bảo quản mật ong ra sao?'],
  footnote: 'Trả lời tự động theo thông tin của MelBee — cần tư vấn kỹ hơn, hãy nhắn Zalo / Facebook.',
  fallback: {
    answer:
      'Câu này mình chưa trả lời được 🙏 Bạn nhắn Zalo hoặc Facebook để MelBee trả lời trực tiếp nhé — hoặc chọn một câu hỏi bên dưới.',
    actions: [zalo, facebook, { label: 'Có những loại mật nào?', ask: 'Có những loại mật nào, giá bao nhiêu?' }],
  },
}

export const intents = [
  {
    id: 'hello',
    keys: ['chào', 'hello', 'hi', 'alo', 'ơi'],
    answer: 'Chào bạn! MelBee có thể giúp gì cho bạn — xem mật ong, làm hộp quà hay cách đặt hàng?',
    actions: [
      { label: 'Xem các loại mật', ask: 'Có những loại mật nào, giá bao nhiêu?' },
      { label: 'Làm hộp quà', ask: 'Mình muốn làm hộp quà' },
    ],
  },
  {
    id: 'order',
    keys: ['đặt', 'order', 'đặt hàng', 'mua thế nào', 'mua ở đâu', 'cách mua', 'chốt', 'inbox', 'nhắn'],
    answer:
      'MelBee nhận đặt hàng qua tin nhắn, không cần tạo tài khoản: nhắn Zalo hoặc Facebook kèm tên sản phẩm, số lượng và địa chỉ nhận — MelBee sẽ tư vấn và xác nhận đơn trực tiếp.',
    actions: [zalo, facebook],
  },
  {
    id: 'products',
    keys: ['giá', 'bao nhiêu', 'loại', 'sản phẩm', 'mua', 'hũ', 'ml', 'tiền', 'bán gì', 'có bán', 'có gì'],
    answer: () => {
      const list = shown()
        .map((p) => `• ${p.name}${p.size ? ` — ${p.size}` : ''}${p.price ? ` · ${p.price}` : ''}\n  ${p.subtitle}`)
        .join('\n')
      return `Sản phẩm MelBee đang giới thiệu:\n${list}\n\nGiá trên web để tham khảo — MelBee xác nhận lại khi bạn nhắn tin đặt hàng.`
    },
    actions: [{ label: 'Xem sản phẩm', go: 'san-pham/' }, { label: 'Đặt hàng thế nào?', ask: 'Đặt hàng thế nào?' }, zalo],
  },
  {
    id: 'gift',
    keys: ['quà', 'hộp', 'hộp quà', 'tặng', 'biếu', 'tết', 'doanh nghiệp', 'thiệp', 'gói'],
    answer: () =>
      `MelBee có hộp quà lục giác như một ô tổ ong, 3 màu giấy, thắt nơ satin, kèm thiệp viết tay:\n${boxSizes
        .map((b) => `• ${b.name} — ${b.note.toLowerCase()} · phí hộp ${b.fee}`)
        .join('\n')}\n\nBạn tự chọn và xem hộp 3D ở phần Hộp quà, xong bấm "Gửi mẫu hộp" để chép sẵn lời nhắn gửi MelBee.`,
    actions: [{ label: 'Xem hộp quà', go: 'hop-qua/' }, zalo],
  },
  {
    id: 'ship',
    keys: ['ship', 'giao', 'vận chuyển', 'phí', 'bao lâu', 'tỉnh', 'cod', 'nhận hàng'],
    answer:
      'Phí và thời gian giao hàng tuỳ địa chỉ của bạn — MelBee báo cụ thể khi bạn nhắn tin đặt hàng (hiện MelBee ở Hà Nội).',
    actions: [zalo, { label: 'Đặt hàng thế nào?', ask: 'Đặt hàng thế nào?' }],
  },
  {
    id: 'pay',
    keys: ['thanh toán', 'chuyển khoản', 'trả tiền', 'payment', 'tiền mặt'],
    answer: 'Cách thanh toán MelBee sẽ hướng dẫn khi xác nhận đơn qua tin nhắn.',
    actions: [zalo, facebook],
  },
  {
    id: 'origin',
    keys: ['nguồn gốc', 'ở đâu', 'điện biên', 'tây bắc', 'rừng', 'thật', 'nguyên chất', 'giả', 'hoa gì', 'lấy mật'],
    answer:
      'Mật ong MelBee đến từ những mùa hoa nơi núi rừng Điện Biên, Tây Bắc. Hành trình từ mùa hoa đến hũ mật được kể ở phần Nguồn gốc và Quy trình — thông tin chi tiết về từng nguồn mật MelBee đang cập nhật thêm.',
    actions: [
      { label: 'Xem câu chuyện MelBee', go: 'cau-chuyen/' },
    ],
  },
  {
    id: 'store',
    keys: ['bảo quản', 'kết tinh', 'đông', 'đặc lại', 'hạn', 'tủ lạnh', 'để được bao lâu', 'cất'],
    answer:
      'Mật ong nên đậy kín nắp, để nơi khô ráo, thoáng mát, tránh nắng; dùng thìa khô, sạch. Mật để lâu có thể kết tinh (đặc lại, lợn cợn) — đó là hiện tượng tự nhiên; muốn lỏng lại thì ngâm hũ trong nước ấm (dưới 40°C).',
    actions: [{ label: 'Cách dùng mật ong?', ask: 'Dùng mật ong thế nào?' }],
  },
  {
    id: 'use',
    keys: ['dùng', 'cách dùng', 'pha', 'uống', 'ăn', 'công dụng', 'tác dụng', 'chữa', 'bệnh', 'giảm cân'],
    answer:
      'MelBee giới thiệu mật ong như một thực phẩm, không đưa ra công dụng chữa bệnh. Bạn có thể pha cùng nước ấm, dùng với trà, chanh, gừng, hay rưới lên bánh, sữa chua.',
    actions: [{ label: 'Bảo quản thế nào?', ask: 'Bảo quản mật ong ra sao?' }],
  },
  {
    id: 'baby',
    keys: ['trẻ', 'em bé', 'bé', 'sơ sinh', 'con nhỏ', 'tháng', 'tuổi', 'bầu', 'mang thai'],
    answer:
      'Lưu ý chung: không cho trẻ dưới 1 tuổi ăn mật ong. Với trẻ lớn hơn, người đang mang thai hoặc có bệnh nền, bạn nên hỏi ý kiến bác sĩ.',
    actions: [zalo],
  },
  {
    id: 'contact',
    keys: ['liên hệ', 'số điện thoại', 'sđt', 'hotline', 'email', 'địa chỉ', 'cửa hàng', 'gọi'],
    answer: () => {
      const c = brand.contact
      return [
        'Liên hệ MelBee:',
        c.phone && `• Điện thoại / Zalo: ${c.phone}`,
        c.email && `• Email: ${c.email}`,
        c.address && `• Địa chỉ: ${c.address}`,
      ]
        .filter(Boolean)
        .join('\n')
    },
    actions: [zalo, facebook],
  },
  {
    id: 'thanks',
    keys: ['cảm ơn', 'cám ơn', 'thanks', 'thank', 'ok', 'oke'],
    answer: 'Không có gì ạ! Cần thêm gì bạn cứ hỏi, hoặc nhắn Zalo để MelBee tư vấn trực tiếp nhé 🐝',
    actions: [zalo],
  },
]

/** Bỏ dấu, chữ thường — để "gia bao nhieu" khớp "giá bao nhiêu". */
export const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Chọn câu trả lời: từ khoá nào khớp nguyên cụm thì cộng điểm theo độ dài cụm. */
export function reply(question) {
  const q = ` ${normalize(question)} `
  let best = null
  let score = 0
  for (const it of intents) {
    let s = 0
    for (const k of it.keys) {
      const key = normalize(k)
      if (key && q.includes(` ${key} `)) s += key.split(' ').length * 2
      else if (key.length > 3 && q.includes(key)) s += 1
    }
    if (s > score) {
      score = s
      best = it
    }
  }
  const hit = best || chatbot.fallback
  const text = typeof hit.answer === 'function' ? hit.answer() : hit.answer
  return { text: text.replace(/ ₫/g, '\u00a0₫'), actions: hit.actions || [] } // "₫" không bị rớt xuống dòng
}
