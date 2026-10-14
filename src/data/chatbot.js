import { brand } from '../config/brand.js'
import { honeys, giftBoxes, giftBoxFee } from './catalog.js'

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
const vnd = (n) => `${n.toLocaleString('vi-VN')}\u00a0₫`
const short = (id) => honeys.find((h) => h.id === id).short
const loosePrice = (b) => b.preset.reduce((s, id, i) => s + honeys.find((h) => h.id === id).prices[b.slots[i]], giftBoxFee)

export const chatbot = {
  title: `${brand.shortName} xin chào!`,
  subtitle: 'Trợ lý tự động · câu hỏi thường gặp',
  greeting:
    'Xin chào! Đây là trợ lý tự động của MelBee. Bạn có thể tìm hiểu các loại mật, hộp quà hoặc cách đặt hàng — chọn một câu hỏi bên dưới hoặc nhập câu hỏi của bạn.',
  suggestions: ['Các loại mật và bảng giá', 'Tư vấn hộp quà', 'Cách đặt hàng', 'Phí và thời gian giao hàng', 'Cách bảo quản mật ong'],
  footnote: 'Câu trả lời tự động dựa trên thông tin của MelBee. Để được tư vấn chi tiết, vui lòng nhắn qua Zalo hoặc Facebook.',
  fallback: {
    answer:
      'Câu hỏi này cần MelBee giải đáp trực tiếp. Bạn vui lòng nhắn qua Zalo hoặc Facebook, hoặc chọn một câu hỏi bên dưới.',
    actions: [zalo, facebook, { label: 'Các loại mật và bảng giá', ask: 'Các loại mật và bảng giá' }],
  },
}

export const intents = [
  {
    id: 'hello',
    keys: ['chào', 'hello', 'hi', 'alo', 'ơi'],
    answer: 'Xin chào! MelBee có thể hỗ trợ bạn tìm hiểu các loại mật, hộp quà hoặc cách đặt hàng.',
    actions: [
      { label: 'Các loại mật và bảng giá', ask: 'Các loại mật và bảng giá' },
      { label: 'Tư vấn hộp quà', ask: 'Tư vấn hộp quà' },
    ],
  },
  {
    id: 'order',
    keys: ['đặt', 'order', 'đặt hàng', 'mua thế nào', 'mua ở đâu', 'cách mua', 'chốt', 'inbox', 'nhắn'],
    answer:
      'MelBee nhận đặt hàng qua tin nhắn, không cần tạo tài khoản. Bạn chỉ cần nhắn Zalo hoặc Facebook kèm tên sản phẩm, số lượng và địa chỉ nhận hàng — MelBee sẽ tư vấn và xác nhận đơn trực tiếp.',
    actions: [zalo, facebook],
  },
  {
    id: 'products',
    keys: ['giá', 'bao nhiêu', 'loại', 'sản phẩm', 'mua', 'hũ', 'ml', 'tiền', 'bán gì', 'có bán', 'có gì'],
    // giá lấy thẳng từ bảng giá trong src/data/catalog.js — đổi giá ở đó là câu trả lời tự đổi theo
    answer: () => {
      const list = honeys
        .map((h) => `• ${h.name}\n  ${Object.entries(h.prices).map(([size, p]) => `${size} ${vnd(p)}`).join(' · ')}`)
        .join('\n')
      return `Sản phẩm MelBee:\n${list}\n\nMelBee xác nhận lại giá và phí giao khi bạn nhắn tin đặt hàng.`
    },
    actions: [{ label: 'Xem sản phẩm', go: 'san-pham/' }, { label: 'Cách đặt hàng', ask: 'Cách đặt hàng' }, zalo],
  },
  {
    id: 'gift',
    keys: ['quà', 'hộp', 'hộp quà', 'tặng', 'biếu', 'tết', 'doanh nghiệp', 'thiệp', 'gói'],
    answer: () =>
      `Hộp quà MelBee: hộp cứng nâu trầm chữ nhũ vàng, kèm túi giấy đồng bộ.\n${giftBoxes
        .map((b) => {
          const save = loosePrice(b) - b.price
          return `• ${b.set} · ${b.name}: ${b.preset.map((id, i) => `${short(id)} ${b.slots[i]}`).join(' + ')} — ${vnd(b.price)}${save > 0 ? ` (tiết kiệm ${vnd(save)} so với mua lẻ)` : ''}`
        })
        .join('\n')}\n\nBạn cũng có thể tự chọn loại mật cho từng lọ: giá bằng tổng các lọ cộng ${vnd(giftBoxFee)} hộp và túi. Tại trang Hộp quà, chọn xong bấm "Đặt hộp quà" để gửi thông tin cho MelBee.`,
    actions: [{ label: 'Xem hộp quà', go: 'hop-qua/' }, zalo],
  },
  {
    id: 'ship',
    keys: ['ship', 'giao', 'vận chuyển', 'phí', 'bao lâu', 'tỉnh', 'cod', 'nhận hàng'],
    answer:
      'Phí và thời gian giao hàng tuỳ theo địa chỉ nhận. MelBee (Hà Nội) sẽ báo cụ thể khi xác nhận đơn qua tin nhắn.',
    actions: [zalo, { label: 'Cách đặt hàng', ask: 'Cách đặt hàng' }],
  },
  {
    id: 'pay',
    keys: ['thanh toán', 'chuyển khoản', 'trả tiền', 'payment', 'tiền mặt'],
    answer: 'MelBee sẽ hướng dẫn hình thức thanh toán khi xác nhận đơn qua tin nhắn.',
    actions: [zalo, facebook],
  },
  {
    id: 'origin',
    keys: ['nguồn gốc', 'ở đâu', 'điện biên', 'tây bắc', 'rừng', 'thật', 'nguyên chất', 'giả', 'hoa gì', 'lấy mật'],
    answer:
      'Mật ong MelBee đến từ những mùa hoa nơi núi rừng Điện Biên, Tây Bắc. Hành trình từ mùa hoa đến lọ mật được giới thiệu ở trang Câu chuyện; thông tin chi tiết về từng nguồn mật đang được MelBee tiếp tục cập nhật.',
    actions: [
      { label: 'Xem câu chuyện MelBee', go: 'cau-chuyen/' },
    ],
  },
  {
    id: 'store',
    keys: ['bảo quản', 'kết tinh', 'đông', 'đặc lại', 'hạn', 'tủ lạnh', 'để được bao lâu', 'cất'],
    answer:
      // theo nhãn in trên lọ (src/data/catalog.js → commonInfo)
      'Bảo quản mật ong nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp; đậy kín nắp và dùng thìa khô, sạch. Không bảo quản trong tủ lạnh. Mật ong tự nhiên có thể kết tinh theo thời gian — đây là hiện tượng tự nhiên, không làm giảm chất lượng; để mật lỏng lại, ngâm lọ vào nước ấm khoảng 60°C cho đến khi tan.',
    actions: [{ label: 'Cách dùng mật ong', ask: 'Cách dùng mật ong' }],
  },
  {
    id: 'use',
    keys: ['dùng', 'cách dùng', 'pha', 'uống', 'ăn', 'công dụng', 'tác dụng', 'chữa', 'bệnh', 'giảm cân'],
    answer:
      'MelBee giới thiệu mật ong như một thực phẩm, không đưa ra công dụng chữa bệnh. Mỗi ngày có thể dùng 15–30g pha cùng nước ấm, dùng với trà, chanh, gừng hoặc rưới lên bánh, sữa chua.',
    actions: [{ label: 'Cách bảo quản mật ong', ask: 'Cách bảo quản mật ong' }],
  },
  {
    id: 'baby',
    keys: ['trẻ', 'em bé', 'bé', 'sơ sinh', 'con nhỏ', 'tháng', 'tuổi', 'bầu', 'mang thai'],
    answer:
      'Không sử dụng mật ong cho trẻ dưới 1 tuổi. Với trẻ lớn hơn, phụ nữ mang thai hoặc người có bệnh nền, nên tham khảo ý kiến bác sĩ trước khi dùng.',
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
    answer: 'Cảm ơn bạn đã quan tâm đến MelBee! Nếu cần tư vấn thêm, bạn có thể nhắn trực tiếp qua Zalo.',
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
